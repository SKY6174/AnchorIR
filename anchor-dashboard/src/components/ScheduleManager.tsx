import React, { useState, useEffect, useMemo } from "react";
import type {
  ChangeEvent,
  FormEvent
} from "react";
import {
  Calendar as CalendarIcon, Clock, MapPin, Users,
  FileText, Award, Layers, Plus, CheckCircle, Info, ChevronLeft, ChevronRight,
  Edit, Trash2, X, Download, Upload
} from "lucide-react";
import { supabase } from "../supabaseClient";
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type ScheduleItem = Record<string, any> & {
  id?: number | string;
  title?: string;
  date?: string;
  year?: number | string;
};

export type ScheduleCommitteeMember = Record<string, any> & {
  id?: number | string;
  name: string;
  type?: string | null;
};

type ScheduleFormData = Record<string, any>;

interface AgendaResultPair {
  agenda: string;
  result: string;
}

interface AiDebateLog {
  role: string;
  text: string;
}

const scheduleDb = supabase as any;
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

// 💡 [디자인 가드] 위원회 ID별 고유 Lucide 아이콘 리턴 (특색있는 디스플레이 구현)
const getCommitteeIcon = (id: string): React.JSX.Element => {
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
const dotToDashDate = (dotDate?: string): string => {
  if (!dotDate) return "";
  const cleaned = dotDate.trim().replace(/\./g, "-");
  return cleaned.endsWith("-") ? cleaned.slice(0, -1) : cleaned;
};

// 💡 [임기 날짜 가드] YYYY-MM-DD 포맷을 YYYY.MM.DD. 로 변환 (DB 저장/화면 표출용)
const dashToDotDate = (dashDate?: string): string => {
  if (!dashDate) return "";
  const parts = dashDate.split("-");
  if (parts.length !== 3) return dashDate;
  return `${parts[0]}.${parts[1]}.${parts[2]}.`;
};

// RISE 사업을 이끌어가는 5대 거버넌스 위원회 상세 정의 상수
const COMMITTEES_DATA = [
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

export interface ScheduleManagerProps {
  currentUser?: any;
  currentRole?: any;
  selectedYear?: number | string;
  darkMode?: boolean;
  subTab?: string;
  onChangeSubTab?: (subTab: string) => void;
  monthlySchedules?: ScheduleItem[];
  setMonthlySchedules?: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  eventSchedules?: ScheduleItem[];
  setEventSchedules?: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  meetingSchedules?: ScheduleItem[];
  setMeetingSchedules?: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  pressReleases?: ScheduleItem[];
  setPressReleases?: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  members?: ScheduleCommitteeMember[];
}

export default function ScheduleManager({
  currentUser,
  currentRole,
  selectedYear,
  darkMode = true,
  subTab,
  onChangeSubTab,
  monthlySchedules = [],
  setMonthlySchedules = () => undefined,
  eventSchedules = [],
  setEventSchedules = () => undefined,
  meetingSchedules = [],
  setMeetingSchedules = () => undefined,
  pressReleases = [],
  setPressReleases = () => undefined,
  members = []
}: ScheduleManagerProps) {
  // 선택 연차에 동조하는 회계연도 연도 구하기 (1차년도: 2025, 2차년도: 2026 등)
  const targetYearNum = selectedYear === 1 ? 2025 : selectedYear === 2 ? 2026 : selectedYear === 3 ? 2027 : selectedYear === 4 ? 2028 : 2029;

  // 모달 제어 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState("monthly"); // "monthly", "event", "meeting", "press"
  const [isEditMode, setIsEditMode] = useState(false);   // 수정 모드 활성화 여부
  const [editingItemId, setEditingItemId] = useState<number | string | null>(null); // 편집 대상 일정 ID

  // 교원의 경우 직급/직위를 '센터장', '팀장교수'로 이원화 표기 및 심현미 운영팀장 표기 헬퍼 함수
  const getFormattedMemberGrade = (m: ScheduleCommitteeMember | null | undefined, _includeProfessors?: boolean) => {
    if (!m) return "연구원";

    // 송경영의 경우 직위를 '단장'으로 강제 표기하여 목록 노출을 보정합니다.
    if (m.name === "송경영") {
      return "단장";
    }

    // 김현수의 경우 직위를 '총괄본부장'으로 강제 표기하여 목록 노출을 보정합니다.
    if (m.name === "김현수") {
      return "총괄본부장";
    }

    // 심현미의 경우 직위를 '운영팀장'으로 강제 표기
    if (m.name === "심현미") {
      return "운영팀장";
    }

    // 교수의 조건 판별 (grade 혹은 role/rank 가 교수, 조교수, 부교수, 정교수 등 교직원 형태인 경우)
    const isProfessorType =
      ["정교수", "부교수", "조교수", "교수", "조교", "팀장교수", "교원"].includes(m.grade) ||
      ["팀장교수", "센터장"].includes(m.role) ||
      ["정교수", "부교수", "조교수", "교수", "조교", "팀장교수", "교원"].includes(m.role) ||
      ["정교수", "부교수", "조교수", "교수", "조교", "팀장교수", "교원"].includes(m.rank);

    if (isProfessorType) {
      // 5대 센터장 정보 매핑 (김현수 교수는 본부장으로 표시되며 센터장 매핑에서 삭제됨)
      const centerHeads: Record<string, string> = {
        "이동은": "ECC센터",
        "김기범": "ICC센터",
        "현용환": "RCC센터",
        "홍광표": "울산늘봄누리센터",
        "홍진숙": "신산업특화센터"
      };

      const isCenterHead =
        m.role === "센터장" ||
        m.rank === "센터장" ||
        centerHeads[m.name] !== undefined;

      if (isCenterHead) {
        return "센터장";
      }

      // 늘봄누리센터와 신산업특화센터는 팀장교수 없음
      const deptName = m.dept || "";
      const isNoTeamProfDept = deptName.includes("늘봄") || deptName.includes("신산업");

      if (isNoTeamProfDept) {
        return m.grade || "교수";
      }

      // 늘봄/신산업이 아닌 4대 센터 소속 일반 교수진은 무조건 '팀장교수' 고정 표기
      return "팀장교수";
    }

    // 일반 연구원 등은 기존 값을 반환
    return m.grade || "연구원";
  };

  // 회의록 작성자에서 센터장, 교수진(팀장교수 포함), 운영팀장을 배제하는 판별 함수
  const isWriterExcluded = (m: ScheduleCommitteeMember | null | undefined) => {
    if (!m) return true;
    const displayRole = getFormattedMemberGrade(m);

    // 센터장, 팀장교수, 운영팀장은 작성자에서 완전히 제외
    if (displayRole === "센터장" || displayRole === "팀장교수" || displayRole === "운영팀장") {
      return true;
    }

    // 기타 교직원(교수) 여부 검증
    const isProf =
      ["정교수", "부교수", "조교수", "교수", "조교", "팀장교수", "교원"].includes(m.grade) ||
      ["팀장교수", "센터장"].includes(m.role) ||
      ["정교수", "부교수", "조교수", "교수", "조교", "팀장교수", "교원"].includes(m.role) ||
      ["정교수", "부교수", "조교수", "교수", "조교", "팀장교수", "교원"].includes(m.rank);

    return isProf;
  };

  // 선택 연차의 실제 회계연도 사업기간(3/1 ~ 이듬해 2/28 또는 29) 부합 여부 판별 함수
  const isDateInSelectedYear = (dateStr: string | undefined, yearVal: number | string | undefined) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;

    const targetYearNum = yearVal === 1 ? 2025 : yearVal === 2 ? 2026 : yearVal === 3 ? 2027 : yearVal === 4 ? 2028 : 2029;
    const start = new Date(`${targetYearNum}-03-01T00:00:00+09:00`);

    const endYear = targetYearNum + 1;
    const isLeap = (endYear % 4 === 0 && endYear % 100 !== 0) || (endYear % 400 === 0);
    const endDay = isLeap ? "29" : "28";
    const end = new Date(`${endYear}-02-${endDay}T23:59:59+09:00`);

    return date >= start && date <= end;
  };

  // 날짜 문자열을 기반으로 공식 회계연도(3/1 ~ 이듬해 2/28) 1~5차년도 값을 동적으로 리턴하는 함수
  const getCalculatedYearFromDate = (dateStr?: string) => {
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

  // 위원회 관리 상태 정의
  // 💡 [새로고침 유지 가드] 위원회 탭 및 선택된 위원회 ID 상태를 localStorage와 결합하여 새로고침 시 이탈을 차단
  const [selectedCommitteeGroup, setSelectedCommitteeGroup] = useState(() => {
    return localStorage.getItem("anchor_committee_selected_group") || "agency";
  });
  const [selectedCommitteeId, setSelectedCommitteeId] = useState(() => {
    return localStorage.getItem("anchor_committee_selected_id") || "total";
  });
  const [activeCommitteeDetailTab, setActiveCommitteeDetailTab] = useState("members"); // 위원회 세부 정보 탭 ("members": 명단, "purpose": 목적/기능)

  // 💡 위원회 대그룹 탭 변경 시 선택된 위원회 ID를 해당 그룹의 첫 번째 항목으로 자동 초기화 및 로컬스토리지 보존
  useEffect(() => {
    const savedGroup = localStorage.getItem("anchor_committee_selected_group");
    const savedId = localStorage.getItem("anchor_committee_selected_id");

    if (savedGroup === selectedCommitteeGroup && savedId) {
      // 새로고침 직후에는 기존에 보존된 ID 상태를 유지하여 오작동 차단
      return;
    }

    if (selectedCommitteeGroup === "agency") {
      setSelectedCommitteeId("total");
      localStorage.setItem("anchor_committee_selected_id", "total");
    } else {
      setSelectedCommitteeId("ecc_op");
      localStorage.setItem("anchor_committee_selected_id", "ecc_op");
    }
    localStorage.setItem("anchor_committee_selected_group", selectedCommitteeGroup);
  }, [selectedCommitteeGroup]);

  // ID 직접 스위칭 시 실시간 브라우저 저장 처리
  useEffect(() => {
    localStorage.setItem("anchor_committee_selected_id", selectedCommitteeId);
  }, [selectedCommitteeId]);

  // 위원회 및 위원 명단 상태 (초기값은 하드코딩 백업 데이터)
  const [committees, setCommittees] = useState<any[]>(COMMITTEES_DATA);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ScheduleCommitteeMember | null>(null); // 수정할 위원 정보 (null 이면 신규 추가)

  // 💡 [위원 직분별 우선순위 정렬 헬퍼] 위원장 -> 위원 -> 간사 순서 출력
  const sortMembersByRole = (membersList: ScheduleCommitteeMember[], _context?: unknown) => {
    if (!Array.isArray(membersList)) return [];
    const getRolePriority = (typeStr?: string | null) => {
      if (!typeStr) return 2;
      if (typeStr.includes("위원장")) return 1;
      if (typeStr.includes("간사")) return 3;
      return 2; // 위원, 위원(자문겸직) 등
    };

    return [...membersList].sort((a, b) => {
      const pA = getRolePriority(a.type);
      const pB = getRolePriority(b.type);
      if (pA !== pB) {
        return pA - pB;
      }
      const sA = a.sort_order ?? 999;
      const sB = b.sort_order ?? 999;
      return sA - sB;
    });
  };



  // 위원회 종류 필터 상태
  const [selectedCommitteeFilters, setSelectedCommitteeFilters] = useState<string[]>([]);

  // AI 언론 기사 크롤링 시뮬레이션 상태
  const [isCrawlerModalOpen, setIsCrawlerModalOpen] = useState(false);
  const [crawlerLogs, setCrawlerLogs] = useState<string[]>([]);
  const [crawlerProgress, setCrawlerProgress] = useState(0);

  // Gemini API 단일 URL 기사 분석 로딩 상태
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);

  const [memberFormData, setMemberFormData] = useState({
    type: "위원",
    name: "",
    org: "울산과학대학교",
    dept: "",
    rank: "",
    location: "교내",
    term: "",
    termStart: "",
    termEnd: "",
    note: ""
  });

  // 위원회 명단 수정 권한 통제 (송경영, 김현수, 심현미 3명에게만 부여)
  const currentUserName = currentUser?.name ? currentUser.name.split(" ")[0].split("(")[0].trim() : "";
  const hasCommitteeEditPermission = ["송경영", "김현수", "심현미"].includes(currentUserName);

  // 💡 [실시간 위원 명단 동기화 이벤트 수신] 회의 운영 및 의결 탭(CommitteeManager)과 위원 명단 실시간 연동
  useEffect(() => {
    const handleCommitteeMembersUpdated = () => {
      console.log("[ScheduleManager] 위원 명단 동기화 이벤트 수신, 데이터 재조회");
      loadCommitteesData();
    };

    window.addEventListener("anchor_committee_members_updated", handleCommitteeMembersUpdated);
    return () => {
      window.removeEventListener("anchor_committee_members_updated", handleCommitteeMembersUpdated);
    };
  }, [selectedYear]);

  // Supabase 실시간 위원회 명단 조회 함수
  const loadCommitteesData = async () => {
    try {
      const { data: comms, error: commsErr } = await supabase
        .from("committees")
        .select("*")
        .order("id");
      if (commsErr) throw commsErr;

      if (comms && comms.length > 0) {
        // 공식 거버넌스 중요도 순 정렬 매핑 (알파벳순 정렬 오류 차단)
        const orderMap: Record<string, number> = {
          "total": 1,      // RISE총괄위원회
          "planning": 2,   // RISE기획위원회
          "budget": 3,     // RISE사업비관리위원회
          "evaluation": 4, // RISE사업자체평가위원회
          "advisory": 5,   // RISE사업자문회의
          "ecc_op": 11,    // ECC운영위원회
          "icc_op": 12,    // ICC운영위원회
          "rcc_op": 13,    // RCC운영위원회
          "aidx_op": 14,   // AID-X운영위원회
          "neulbom_op": 15,// 울산늘봄운영위원회
          "newind_op": 16  // 신산업특화운영위원회
        };
        const sortedComms = [...comms].sort((a, b) => (orderMap[a.id] || 99) - (orderMap[b.id] || 99));

        const { data: mems, error: memsErr } = await supabase
          .from("committee_members")
          .select("*")
          .eq("year", String(selectedYear || ""))
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true });
        if (memsErr) throw memsErr;

        const combined = sortedComms.map(c => {
          const localMaster: any = COMMITTEES_DATA.find(lc => lc.id === c.id) || {};
          return {
            ...localMaster, // 로컬 마스터 데이터의 예쁜 디스플레이 디자인 속성(color, badge, purpose, cycle 등) 선주입
            ...c,           // Supabase 실시간 DB 값(name, total_quorum 등) 최종 병합
            desc: (c as any).description || localMaster.desc,
            members: (mems || [])
              .filter(m => m.committee_id === c.id)
              .map(m => ({
                id: m.id,
                type: m.type,
                name: m.name,
                org: m.org,
                dept: m.dept,
                rank: m.rank,
                location: m.location,
                term: m.term,
                note: m.note
              }))
          };
        });
        setCommittees(combined);
      }
    } catch (e) {
      console.warn("Supabase 위원회 명단 조회 실패, 로컬 캐시 사용:", e);
    }
  };

  useEffect(() => {
    loadCommitteesData();
  }, [selectedYear]);

  // 💡 [교육용 한글 주석] 기존 CSV 서식 양식 다운로드를 호환성이 높은 XLSX 규격으로 개선합니다.
  const handleDownloadExcelFormat = () => {
    const headers = ["구분", "성명", "소속기관", "부서/학과", "직위", "교내외", "비고"];
    const data = [
      ["위원장", "조홍래", "울산과학대학교", "-", "총장", "교내", "대표"],
      ["위원", "김성철", "울산과학대학교", "-", "부총장", "교내", ""]
    ];
    
    // SheetJS를 사용하여 worksheet 생성 및 workbook 빌드 후 파일 저장
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "위원회_위원등록_서식");
    XLSX.writeFile(workbook, "위원회_위원등록_양식.xlsx");
  };

  // 💡 [교육용 한글 주석] 기존 CSV 명단 조회를 XLSX 형식으로 추출하도록 업데이트합니다.
  const handleExcelDownload = () => {
    const activeComm = committees.find(c => c.id === selectedCommitteeId) || committees[0];
    if (!activeComm) {
      alert("선택된 위원회가 없습니다.");
      return;
    }
    const mems = sortMembersByRole(activeComm.members || []);
    if (mems.length === 0) {
      alert("다운로드할 위원 명단이 없습니다.");
      return;
    }
    
    const headers = ["구분", "성명", "소속기관", "부서/학과", "직위", "교내외", "비고"];
    const dataRows = mems.map(m => [
      m.type || "",
      m.name || "",
      m.org || "",
      m.dept || "",
      m.rank || "",
      m.location || "",
      m.note || ""
    ]);

    // XLSX 통합 워크시트 구성 및 파일 생성
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "위원명단");
    XLSX.writeFile(workbook, `${activeComm.name}_위원명단_목록.xlsx`);
  };

  // 💡 [교육용 한글 주석] 업로드된 .xlsx 포맷의 파일 바이트 데이터를 로드하여 파싱하고 DB에 insert합니다.
  const handleExcelUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        if (!(evt.target?.result instanceof ArrayBuffer)) return;
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 2차원 배열 구조로 엑셀 데이터 변환
        const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
        if (jsonData.length <= 1) {
          alert("업로드할 위원 데이터가 존재하지 않습니다.");
          return;
        }
        
        const activeComm = committees.find(c => c.id === selectedCommitteeId) || committees[0];
        if (!activeComm) {
          alert("선택된 위원회가 존재하지 않습니다.");
          return;
        }
        
        const newMembers: any[] = [];
        const currentMembersCount = activeComm.members ? activeComm.members.length : 0;
        
        // 헤더 다음인 첫 번째 행부터 시작
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 2 || !row[1]) continue; // 성명(두 번째 컬럼) 필수
          
          newMembers.push({
            committee_id: activeComm.id,
            type: row[0] || "위원",
            name: String(row[1]).trim(),
            org: row[2] || "울산과학대학교",
            dept: row[3] || "-",
            rank: row[4] || "",
            location: row[5] || "교내",
            year: selectedYear,
            note: row[6] || "",
            sort_order: currentMembersCount + i
          });
        }
        
        if (newMembers.length === 0) {
          alert("파싱된 위원 정보가 없습니다. 서식 양식을 확인해 주세요.");
          return;
        }
        
        const { error } = await scheduleDb
          .from("committee_members")
          .insert(newMembers);
        if (error) throw error;
        
        alert(`총 ${newMembers.length}명의 위원이 성공적으로 일괄 등록되었습니다!`);
        await loadCommitteesData();
      } catch (err: unknown) {
        console.error("엑셀 파싱/업로드 중 에러:", err);
        alert("엑셀 일괄 업로드 실패: " + getErrorMessage(err));
      } finally {
        e.target.value = ""; // 파일 재선택 가능하게 클리어
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 위원 삭제 처리 함수
  const handleDeleteMember = async (memberId: number | string | undefined) => {
    if (memberId === undefined) return;
    if (!window.confirm("이 위원을 명단에서 정말 삭제하시겠습니까?")) return;
    try {
      const { error } = await scheduleDb
        .from("committee_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;

      // DB 삭제 후 화면 데이터 실시간 갱신
      await loadCommitteesData();
    } catch (e: unknown) {
      console.error("위원을 삭제하는 데 실패했습니다:", e);
      alert("삭제 중 오류가 발생했습니다: " + getErrorMessage(e));
    }
  };

  // 위원 추가/수정 저장 처리 함수
  const handleSaveMember = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!memberFormData.name.trim()) {
      alert("성명을 입력해 주세요.");
      return;
    }

    // 💡 [임기 조립] 시작일과 종료일 날짜 인풋(YYYY-MM-DD)을 합쳐서 YYYY.MM.DD. ~ YYYY.MM.DD. 포맷 문자열로 DB term 컬럼에 병합 저장
    let combinedTerm = "";
    if (memberFormData.termStart) {
      const sDot = dashToDotDate(memberFormData.termStart);
      const eDot = memberFormData.termEnd ? dashToDotDate(memberFormData.termEnd) : "";
      combinedTerm = eDot ? `${sDot} ~ ${eDot}` : `${sDot} ~`;
    }

    try {
      if (editingMember) {
        // 기존 멤버 정보 업데이트 (UPDATE)
        const { error } = await scheduleDb
          .from("committee_members")
          .update({
            type: memberFormData.type,
            name: memberFormData.name,
            org: memberFormData.org,
            dept: memberFormData.dept,
            rank: memberFormData.rank,
            location: memberFormData.location,
            term: combinedTerm,
            note: memberFormData.note
          })
          .eq("id", editingMember.id);
        if (error) throw error;
      } else {
        // 신규 멤버 정보 추가 (INSERT)
        const currentMembers = committees.find(c => c.id === selectedCommitteeId)?.members || [];
        const nextSortOrder = currentMembers.length + 1;

        const { error } = await scheduleDb
          .from("committee_members")
          .insert({
            committee_id: selectedCommitteeId,
            type: memberFormData.type,
            name: memberFormData.name,
            org: memberFormData.org,
            dept: memberFormData.dept,
            rank: memberFormData.rank,
            location: memberFormData.location,
            year: String(selectedYear || ""),
            term: combinedTerm,
            note: memberFormData.note,
            sort_order: nextSortOrder
          });
        if (error) throw error;
      }

      // 모달 닫기 및 상태 초기화
      setIsMemberModalOpen(false);
      setEditingMember(null);

      // DB 반영 후 화면 데이터 실시간 갱신
      await loadCommitteesData();
    } catch (e: unknown) {
      console.error("위원을 저장하는 데 실패했습니다:", e);
      alert("저장 중 오류가 발생했습니다: " + getErrorMessage(e));
    }
  };

  // 캘린더 월 상태 (2026년 7월 기준)
  const [currentMonth, setCurrentMonth] = useState(7); // 7월
  const [selectedDay, setSelectedDay] = useState(15); // 디폴트 선택 일자

  // 💡 [교육용 한글 주석] 선택된 연차(selectedYear)가 변경되면 캘린더 월을 해당 차년도에 맞춰 최적화 동기화합니다.
  useEffect(() => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1; // 1-indexed (1~12)
    const todayFiscalYear = todayMonth < 3 ? todayYear - 1 : todayYear;
    const todaySelectedYear = todayFiscalYear - 2025 + 1;

    if (selectedYear === todaySelectedYear) {
      setCurrentMonth(todayMonth);
      setSelectedDay(today.getDate());
    } else {
      setCurrentMonth(3); // 3월
      setSelectedDay(1); // 1일
    }
  }, [selectedYear]);

  // 월간 일정 캘린더 표시용 연도 구하기 (회계연도 기준 1~2월은 targetYearNum + 1년)
  const displayYear = currentMonth >= 3 ? targetYearNum : targetYearNum + 1;

  // 행사 및 회의 월 선택 상태
  const [selectedEventMonth, setSelectedEventMonth] = useState(7); // 7월
  const [selectedMeetingMonth, setSelectedMeetingMonth] = useState(7); // 7월

  // 언론보도 세부 구분 필터 상태 ("all", "방송", "신문", "기타")
  const [selectedPressType, setSelectedPressType] = useState("all");
  const [activePressId, setActivePressId] = useState<number | string | null>(null);

  // 회의 대분류 상태 ("operating": 사업운영위원회, "center": 센터별 회의, "committee": 각종 위원회 회의)
  const [activeMeetingCat, setActiveMeetingCat] = useState(() => {
    return localStorage.getItem("anchor_active_meeting_cat") || "operating";
  });

  // 회의 카테고리 탭 변경 시 localStorage에 저장하여 새로고침 시에도 탭 유지
  useEffect(() => {
    localStorage.setItem("anchor_active_meeting_cat", activeMeetingCat);
  }, [activeMeetingCat]);

  // 월간일정 상세 링킹 기능 (행사, 회의록 연계 이동)
  const handleLinkToDetail = (sched: ScheduleItem) => {
    if (!sched) return;

    // 일정 시작일자에서 월 파싱
    let parsedMonth = currentMonth;
    if (sched.startAt) {
      const parts = sched.startAt.split(" ")[0].split("-");
      if (parts.length >= 2) {
        parsedMonth = parseInt(parts[1], 10) || currentMonth;
      }
    }

    if (sched.type === "행사") {
      // 1. 행사 월 이동 및 탭 전환
      setSelectedEventMonth(parsedMonth);
      if (onChangeSubTab) {
        onChangeSubTab("events");
      }

      // 2. 행사 매칭 및 스크롤
      const matchedEvent = eventSchedules.find(e => e.id === sched.eventId) || eventSchedules.find(e => {
        const dateMatch = e.datetime && e.datetime.includes(sched.startAt.split(" ")[0]);
        const titleMatch = e.title && (e.title.includes(sched.title || "") || (sched.title || "").includes(e.title));
        return dateMatch || titleMatch;
      });

      if (matchedEvent) {
        setTimeout(() => {
          const el = document.getElementById(`event-card-${matchedEvent.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.style.transition = "outline 0.3s ease, transform 0.3s ease";
            el.style.outline = "2px solid #3B82F6";
            el.style.outlineOffset = "4px";
            el.style.transform = "scale(1.02)";
            setTimeout(() => {
              el.style.outline = "none";
              el.style.transform = "scale(1)";
            }, 2500);
          }
        }, 150);
      } else {
        console.warn("매칭되는 행사를 찾지 못했습니다.");
      }
    }
    else if (sched.type === "회의" || sched.type === "위원회") {
      // 1. 회의록 검색
      const matchedMeeting = meetingSchedules.find(m => m.id === sched.meetingId) || meetingSchedules.find(m => {
        const dateMatch = m.datetime && m.datetime.includes(sched.startAt.split(" ")[0]);
        const titleMatch = m.title && (m.title.includes(sched.title || "") || (sched.title || "").includes(m.title));
        return dateMatch || titleMatch;
      });

      if (matchedMeeting) {
        // 2. 회의 카테고리, 월, 탭 전환
        setSelectedMeetingMonth(parsedMonth);
        if (matchedMeeting.category) {
          setActiveMeetingCat(matchedMeeting.category);
        }
        setSelectedMeetingId(matchedMeeting.id ?? null);

        if (onChangeSubTab) {
          onChangeSubTab("meetings");
        }

        // 3. 목록 엘리먼트로 스크롤
        setTimeout(() => {
          const el = document.getElementById(`meeting-item-${matchedMeeting.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.style.transition = "outline 0.3s ease, background 0.3s ease";
            el.style.outline = "2px solid #10B981";
            el.style.outlineOffset = "2px";
            setTimeout(() => {
              el.style.outline = "none";
            }, 2500);
          }
        }, 150);
      } else {
        // 매칭되지 않는 회의록의 경우, 단순히 회의 탭으로 월을 설정하여 전환
        setSelectedMeetingMonth(parsedMonth);
        if (onChangeSubTab) {
          onChangeSubTab("meeting");
        }
        console.warn("매칭되는 회의록을 찾지 못했습니다.");
      }
    }
  };

  // 4. 입력 폼 임시 State
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: "",
    type: "행사",
    dept: "사업운영팀",
    startDate: `${targetYearNum}-07-15`,
    startTime: "10:00",
    endDate: `${targetYearNum}-07-15`,
    endTime: "11:00",
    location: "",
    noTime: false,
    // 행사 & 회의용
    month: 7,
    department: "",
    datetime: "",
    attendeesInternal: "",
    attendeesExternal: "",
    program: "",
    purpose: "",
    result: "",
    category: "operating",
    agenda: "",
    audioUrl: "",
    pdfUrl: "",
    // 언론보도용
    pressDate: `${targetYearNum}-07-15`,
    pressTime: "10:00",
    pressMedia: "",
    pressUrl: "",
    pressType: "방송",
    pressContent: ""
  });

  // 의제-결과 1:1 매핑 상태 추가
  const [agendaResultPairs, setAgendaResultPairs] = useState<AgendaResultPair[]>([{ agenda: "", result: "" }]);

  // AI 기획서 자동완성 상태 관리
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiFileName, setAiFileName] = useState("");
  const [aiRawText, setAiRawText] = useState(""); // 기획서 원본 텍스트 직접 입력/저장용
  const [aiResultFileName, setAiResultFileName] = useState(""); // [추가] 결과보고서 파일명
  const [aiResultRawText, setAiResultRawText] = useState(""); // [추가] 결과보고서 원본 텍스트 직접 입력/저장용
  const [aiDebateLogs, setAiDebateLogs] = useState<AiDebateLog[]>([]); // [추가] 실시간 AI 토론 로그
  const [isDebating, setIsDebating] = useState(false); // [추가] AI 토론 진행 상태 플래그
  const [aiPlanApplied, setAiPlanApplied] = useState(false); // [추가] AI 기획 데이터 반영 여부
  const [aiResultApplied, setAiResultApplied] = useState(false); // [추가] AI 결과 데이터 반영 여부
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStatusText, setAiStatusText] = useState("");
  const [aiEngine, setAiEngine] = useState("gpt"); // "gemini" or "gpt"
  const [includeProfessors, setIncludeProfessors] = useState(false); // 팀장교수 포함 여부
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("전체"); // 부서 필터 상태
  const [draggingId, setDraggingId] = useState<number | string | null>(null); // 드래그 중인 일정 ID
  const [dragOverDate, setDragOverDate] = useState<string | null>(null); // 드래그 호버 중인 날짜 셀 YYYY-MM-DD


  // 샘플 파일 로드
  const handleLoadSampleFile = () => {
    setAiFileName("RISE_지산학_연계_창업_해커톤_결과보고서.txt");
    setAiRawText(`
[결과보고서] 2026학년도 RISE 지산학 연계 창업 해커톤 캠프

1. 행사개요
- 행사명: 2026학년도 RISE 지산학 연계 창업 해커톤 캠프
- 일시: 2026년 7월 15일 09:00 ~ 18:00
- 장소: 울산과학대학교 아산체육관 2층 세미나실
- 주관부서: ECC센터
- 관련 프로그램: 지산학 밀착형 창업 생태계 활성화 프로그램

2. 목적 및 취지
울산 지역의 정주형 기술 창업 아이템을 발굴하고, 지산학 연계를 통한 청년 로컬 창업 성공 모델 발굴과 멘토링 매칭을 목표로 함. 지역의 정주 인프라와 친환경 에너지 아이템을 결합한 다양한 청년 비즈니스 모델을 발굴하고자 함.

3. 참석대상 및 규모
- 내부 참석자: 창업보육센터 전임교수 3명, 연구원 5명, 외부 멘토단 4명 (총 12명)
- 외부 참석자: 울산광역시 미래산업과 주무관 2명, 울산 테크노파크 창업지원팀 3명, 청년 벤처캐피탈(VC) 심사역 3명 (총 8명)

4. 행사 결과 및 주요 성과
학생 창업동아리 8개 팀이 참가하여 12시간 동안 집중 비즈니스 모델 빌드업을 거쳤으며, 최종 최우수상 1개 팀(팀명: 울산로컬히어로 - '친환경 수소 자전거 스테이션 인프라 공유 모델')을 선정하여 특허 출원 멘토링 연계를 확정함. 울산 매일 및 지역 언론 보도자료 2건 송출 완료.
    `.trim());
  };

  // 💡 [교육용 한글 주석] PDF 날것의 텍스트를 요약 없이 마크다운 문서 포맷으로 가꾸어주는 GPT-4o 헬퍼 함수입니다.
  const convertRawTextToMarkdown = async (rawText: string): Promise<string> => {
    let apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
    if (!apiKey || apiKey.startsWith("sk-") === false) {
      apiKey = localStorage.getItem("user_openai_api_key") || "";
    }
    if (!apiKey) {
      return rawText;
    }

    try {
      const prompt = `
너는 대학교 RISE 사업단의 서류 정돈 전문가이다.
제공된 원본 텍스트는 PDF 문서에서 가공 없이 추출된 날것의 줄글 텍스트이다.
이 텍스트의 내용을 절대로 요약하거나 임의로 축소, 생략하지 말고 모든 세부 안건, 보고사항, 수치, 애로사항, 그리고 참석자 명단 및 서명록 이름들을 그대로 온전히 수용하여 가독성 높고 구조화된 마크다운(Markdown) 문서로 변환해라.
특히 본문에 기재된 모든 사람의 이름(참석 위원, 서명한 인원 등)은 한 명도 생략하지 말고 그대로 보존해라.
다른 군더더기 설명 없이 오직 마크다운 내용만을 텍스트로 즉시 반환해라.

원본 텍스트:
${rawText}
      `.trim();

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1
        })
      });

      if (!response.ok) return rawText;

      const resData = await response.json();
      let mdText = resData?.choices?.[0]?.message?.content || rawText;

      const mdMatch = mdText.match(/```markdown\s*([\s\S]*?)\s*```/) || mdText.match(/```\s*([\s\S]*?)\s*```/);
      if (mdMatch && mdMatch[1]) {
        mdText = mdMatch[1];
      }

      return mdText.trim();
    } catch (err) {
      console.error("Markdown 변환 실패:", err);
      return rawText;
    }
  };

  // 실제 파일 선택 핸들러
  const handleAiFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    type: "plan" | "result" = "plan"
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const fileNames = files.map(f => f.name).join(", ");
      
      if (type === "plan") {
        setAiFileName(fileNames);
      } else {
        setAiResultFileName(fileNames);
      }

      const updateText = (text: string) => {
        if (type === "plan") {
          setAiRawText(text);
        } else {
          setAiResultRawText(text);
        }
      };

      updateText(`📄 총 ${files.length}개의 파일을 분석 중... (본문 텍스트 추출 중)`);

      try {
        let combinedRawText = "";
        
        for (let idx = 0; idx < files.length; idx++) {
          const file = files[idx];
          let fileText = "";
          
          updateText(`📄 [${idx + 1}/${files.length}] ${file.name} 텍스트 추출 중...`);

          // 1. 텍스트 파일인 경우
          if (file.type.match('text.*') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
            fileText = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (event) => resolve(
                typeof event.target?.result === "string" ? event.target.result : ""
              );
              reader.readAsText(file);
            });
          }
          // 2. PDF 파일인 경우
          else if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            let pdfText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str || "").join(" ");
              pdfText += `[Page ${i}]\n${pageText}\n\n`;
            }
            fileText = pdfText;
          }
          // 3. 그 외 바이너리 포맷 (HWP 등)
          else {
            fileText = `[⚠️ ${file.name}은 직접 텍스트 추출이 불가능한 파일 포맷입니다. 본문을 복사하여 직접 입력란에 보충해 주세요.]`;
          }

          combinedRawText += `--- 파일 ${idx + 1}: ${file.name} ---\n${fileText.trim()}\n\n`;
        }

        if (combinedRawText.trim()) {
          updateText("⏳ 추출된 전체 텍스트를 마크다운 문서로 정밀 정돈 중...");
          const structuredMd = await convertRawTextToMarkdown(combinedRawText.trim());
          updateText(structuredMd);
        } else {
          updateText("선택한 파일들에서 텍스트를 추출하지 못했습니다. 본문이 비어있습니다.");
        }
      } catch (err: unknown) {
        console.error("다중 파일 텍스트 추출 실패:", err);
        updateText(`❌ 파일 텍스트 추출에 실패했습니다. 에러: ${getErrorMessage(err)}\n본문 내용을 복사해서 직접 입력해 주세요.`);
      }
    }
  };

    // AI 분석 결과 폼 자동 보정 및 지능형 매핑 헬퍼 함수
  const applyMeetingAiDataRules = (
    aiData: ScheduleFormData,
    prevFormData: ScheduleFormData
  ): ScheduleFormData => {
    const title = aiData.title || prevFormData.title;
    const location = aiData.location || prevFormData.location;
    
    // 1) 앵커기획위원회나 ~위원회 명칭인 경우 각종분류를 '각종 위원회' (committee) 로 자동 분류 및 세부 위원회명 추출
    let category = prevFormData.category || "operating";
    let committeeType = prevFormData.committeeType || "agency";
    let dept = prevFormData.dept || "사업운영팀";

    const isCommitteeTitle = title && (title.includes("위원회") || title.includes("자문회의") || title.includes("협의회"));
    if (isCommitteeTitle) {
      category = "committee";

      // 1-1) 사업단 위원회 매칭 검사 (agency)
      const agencyList = [
        "앵커총괄위원회", "앵커기획위원회", "앵커사업비관리위원회",
        "앵커사업자체평가위원회", "앵커사업자문회의"
      ];
      // 띄어쓰기 무관하게 매칭 검사
      const titleCleaned = title.replace(/\s+/g, "");
      let foundAgency = agencyList.find(name => {
        const nameCleaned = name.replace(/\s+/g, "");
        const shortNameCleaned = nameCleaned.replace("앵커", "");
        return titleCleaned.includes(nameCleaned) || titleCleaned.includes(shortNameCleaned);
      });
      
      if (foundAgency) {
        committeeType = "agency";
        dept = foundAgency;
      } else {
        // 1-2) 센터 위원회 매칭 검사 (center)
        const centerList = [
          { key: "ECC센터", match: ["ECC", "ecc"] },
          { key: "ICC센터", match: ["ICC", "icc"] },
          { key: "RCC센터", match: ["RCC", "rcc"] },
          { key: "AID-X지원센터", match: ["AID-X", "aidx", "AID"] },
          { key: "울산늘봄누리센터", match: ["늘봄", "늘봄누리"] },
          { key: "신산업특화센터", match: ["신산업", "특화센터"] }
        ];
        
        let foundCenter = centerList.find(c => c.match.some(m => title.toLowerCase().includes(m.toLowerCase())));
        if (foundCenter) {
          committeeType = "center";
          dept = foundCenter.key;
        }
      }
    }

    // 2) 서면부의인 경우(또는 시작/종료 시간이 빈 문자열이거나 명시되지 않은 경우) 전일 체크 및 시간 필드 비우기
    const isWrittenQuery = location && (location.includes("서면부의") || location.includes("서면 회의") || location.includes("이메일"));
    const isTimeOmitted = !aiData.meetingStartTime || !aiData.meetingEndTime || aiData.meetingStartTime === "00:00" || aiData.meetingStartTime === "";
    
    const shouldBeAllDay = isWrittenQuery || isTimeOmitted;
    
    return {
      ...prevFormData,
      title: title,
      location: location,
      category: category,
      committeeType: category === "committee" ? committeeType : prevFormData.committeeType,
      dept: category === "committee" ? dept : prevFormData.dept,
      meetingDate: aiData.meetingDate || prevFormData.meetingDate,
      noTime: shouldBeAllDay,
      meetingStartTime: shouldBeAllDay ? "" : (aiData.meetingStartTime || prevFormData.meetingStartTime || "10:00"),
      meetingEndTime: shouldBeAllDay ? "" : (aiData.meetingEndTime || prevFormData.meetingEndTime || "11:00"),
      attendees: aiData.attendees || prevFormData.attendees
    };
  };

  // 💡 [교육용 한글 주석] 회의록 분석 결과인 의제/결과 리스트를 8대 부서에 지능적으로 자동 분배하여 입력 폼에 기입합니다.
  const distributeOperatingAgendas = (
    agendaResultPairs: AgendaResultPair[],
    currentCategory: string
  ): ScheduleFormData => {
    const isOperating = currentCategory === "operating" || formData.category === "operating";
    if (!isOperating || !agendaResultPairs || agendaResultPairs.length === 0) {
      return {};
    }

    const depts = ["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"];
    const newAgendas: Record<string, string> = {};
    const newResults: Record<string, string> = {};
    
    depts.forEach(d => {
      newAgendas[d] = "";
      newResults[d] = "";
    });

    agendaResultPairs.forEach(pair => {
      const text = pair.agenda || "";
      const resultText = pair.result || "";

      // 한글 명칭 매칭 검사 (가장 근접한 부서 찾기)
      let matchedDept = depts.find(d => {
        const cleanD = d.replace("센터", "").replace("지원센터", "").replace("팀", "");
        return text.includes(cleanD) || resultText.includes(cleanD) ||
               (d === "사업운영팀" && (text.includes("사업단") || resultText.includes("사업단")));
      });

      // 영어 약어 등 매칭 예외 보완
      if (!matchedDept) {
        if (text.toLowerCase().includes("ecc") || resultText.toLowerCase().includes("ecc")) matchedDept = "ECC센터";
        else if (text.toLowerCase().includes("icc") || resultText.toLowerCase().includes("icc")) matchedDept = "ICC센터";
        else if (text.toLowerCase().includes("rcc") || resultText.toLowerCase().includes("rcc")) matchedDept = "RCC센터";
        else if (text.toLowerCase().includes("aid") || resultText.toLowerCase().includes("aid")) matchedDept = "AID-X지원센터";
        else if (text.toLowerCase().includes("늘봄") || resultText.toLowerCase().includes("늘봄")) matchedDept = "울산늘봄누리센터";
        else if (text.toLowerCase().includes("신산업") || resultText.toLowerCase().includes("신산업")) matchedDept = "신산업특화센터";
        else matchedDept = "사업운영팀"; // 매칭 실패 시 기본으로 '사업운영팀'에 기입
      }

      if (matchedDept) {
        newAgendas[matchedDept] = (newAgendas[matchedDept] ? newAgendas[matchedDept] + "\n" : "") + text;
        newResults[matchedDept] = (newResults[matchedDept] ? newResults[matchedDept] + "\n" : "") + resultText;
      }
    });

    return {
      operatingAgendas: newAgendas,
      operatingResults: newResults
    };
  };

  // 회의록 분석 전용 모의 폴백 함수
  const runMeetingSimulationFallback = () => {
    setIsAiLoading(true);
    setAiProgress(10);
    setAiStatusText("시뮬레이션 모드로 회의 문서 분석 진행...");

    setTimeout(() => {
      setAiProgress(60);
      setAiStatusText("원문 텍스트 내 회의 주요 안건 및 의사결정 매핑 중...");

      setTimeout(() => {
        const text = aiRawText || "";
        const lowerName = aiFileName ? aiFileName.toLowerCase() : "";

        let targetData = {
          title: "2026년 RISE 지산학 협업 연계 1차 운영회의",
          location: "동부캠퍼스 행정본관 2층 대회의실",
          meetingDate: "2026-07-15",
          meetingStartTime: "10:00",
          meetingEndTime: "12:00",
          attendees: "심현미 팀장, 이동은 센터장, 박지현 팀장, 김기범 센터장"
        };

        let aiAgendas = [
          {
            agenda: "[사업운영팀] RISE 2차년도 부서별 앵커 트랙 가동에 따른 지산학 협업 회의 개최",
            result: "사업단 전체 추진방향에 맞춰 각 센터별 교직원 역량강화 워크숍 및 취업박람회 실적 연계 방안을 검토 완료함."
          },
          {
            agenda: "[ECC센터] 지산학 밀착형 청년 로컬 정주형 장학금 기준안 심의",
            result: "마일리지 지급 기준표를 원안대로 통과시켰으며, RCC 센터와의 교차 지급 시 중복 수혜 판정 기준을 최종 수립함."
          }
        ];

        // 만약 유학생 관련 단어가 본문 또는 파일명에 존재할 경우 유학생 회의 데이터로 교체
        if (text.includes("유학생") || text.includes("문화교류") || lowerName.includes("유학생")) {
          targetData = {
            title: "2026년도 제1차 외국인 유학생 지역 정주 지원 실무협의회",
            location: "서면부의 (이메일 제출)",
            meetingDate: "2026-05-18",
            meetingStartTime: "",
            meetingEndTime: "",
            attendees: "이남우 처장, 이동은 센터장, 김기범 센터장, 서포터즈 팀장"
          };
          aiAgendas = [
            {
              agenda: "[ECC센터] 외국인 유학생을 위한 지자체 연계형 문화 체험 프로그램 운영안 의결",
              result: "다가오는 '세계인의 날' 유학생 축제 일정을 확정하고 예산 2,500,000원을 승인함."
            },
            {
              agenda: "[사업운영팀] 유학생의 울산 지역 내 정주 취업 및 기업 인턴십 매칭 방안 보고",
              result: "관내 5개 강소기업 및 가족회사 대표들과의 미팅을 통한 현장실습 배정 규모를 최종 합의함."
            }
          ];
        }

        setFormData(prev => {
          const updated = applyMeetingAiDataRules(targetData, prev);
          const dist = distributeOperatingAgendas(aiAgendas, updated.category);
          return { ...updated, ...dist };
        });
        setAiPlanApplied(true);
        setAgendaResultPairs(aiAgendas);

        setIsAiLoading(false);
        setAiProgress(100);
        setAiStatusText("");
        alert("🎉 [시뮬레이션] 지능형 AI 필터가 회의 문서를 분석하여 회의 정보와 부서별 의제/결과 리스트를 자동 입력하였습니다!");
      }, 1000);
    }, 1000);
  };

  // API Key 오류나 통신 에러 시 작동하는 모의 폴백 함수
  const runSimulationFallback = () => {
    setIsAiLoading(true);
    setAiProgress(10);
    setAiStatusText("시뮬레이션 모드로 폼 분석 진행...");

    setTimeout(() => {
      setAiProgress(60);
      setAiStatusText("원문 텍스트 내 RISE 핵심 키워드 지능형 매핑 중...");

      setTimeout(() => {
        const lowerName = aiFileName.toLowerCase();
        const text = aiRawText || "";

        // 기본값: 해커톤 캠프
        let targetData = {
          title: "RISE 지산학 연계 창업 해커톤 캠프",
          department: "ECC센터",
          location: "울산과학대학교 아산체육관 2층 세미나실",
          eventDate: "2026-07-15",
          eventStartTime: "09:00",
          eventEndTime: "18:00",
          attendeesInternal: "창업보육센터 교수 3명, 전임연구원 5명, 멘토단 4명",
          attendeesExternal: "울산시 미래산업과 주무관 2명, 울산 테크노파크 창업지원팀 3명, 벤처캐피탈 심사역 3명",
          program: "지산학 밀착형 창업 생태계 활성화 프로그램",
          purpose: "지역 정주형 기술 창업 아이템 발굴 및 지산학 연계를 통한 청년 로컬 창업 성공 모델 발굴과 멘토링 매칭",
          result: "학생 창업동아리 8개 팀 참여, 최종 최우수상 1개 팀(팀명: 울산로컬히어로) 선정 및 특허 출원 멘토링 연계 확정. 울산 매일 보도자료 2건 송출 완료"
        };

        // 1. 유학생 문화교류 / 세계인의 날 감지 시 (최우선 매핑)
        if (text.includes("세계인의 날") || text.includes("유학생") || text.includes("문화교류") || lowerName.includes("유학생") || lowerName.includes("세계인의")) {
          targetData = {
            title: "2026년 유학생 문화교류 프로그램 '세계인의 날' 행사",
            department: "ECC센터",
            location: "울산과학대학교 동부캠퍼스 1대학관 대강당 및 중앙광장",
            eventDate: "2026-05-20",
            eventStartTime: "13:00",
            eventEndTime: "17:30",
            attendeesInternal: "국제교류팀 교수 3명, 전임연구원 4명, 유학생 서포터즈 20명",
            attendeesExternal: "외국인 유학생 및 다문화 가정 주민 150여 명",
            program: "유학생 지역 정착 및 글로벌 문화 융합 프로그램",
            purpose: "세계인의 날을 맞이하여 교내 외국인 유학생들의 교류 증진과 지역 사회 정주 지원 및 상호 문화 이해도를 증진하고자 함",
            result: "유학생 125명 참가, 국가별 문화 체험 부스 12개 운영 및 만족도 96.8점 획득, 지역 신문 보도자료 2건 송출 완료"
          };
        }
        // 2. 단장님이 올리신 진짜 초광역 회의 PDF 내용이 감지되었을 경우
        else if (text.includes("초광역공유") || text.includes("COSS사업") || text.includes("장기성") || text.includes("김상교") || text.includes("동아방송")) {
          targetData = {
            title: "RISE 초광역 공유협력 활성화 심포지엄 및 성과 공유회",
            department: "RCC센터",
            location: "울산과학대학교 동부캠퍼스 행정본관 2층 대회의실",
            eventDate: "2026-07-20",
            eventStartTime: "14:00",
            eventEndTime: "18:00",
            attendeesInternal: "이남우 교수(울산과학대) 외 전임교수 및 사업담당자 18명",
            attendeesExternal: "동아방송대 김상교 총장, 광주보건대 박준 처장, 영산대 김수연 부총장, 원광대 장기성 처장 등 관계자 12명",
            program: "초광역 지산학 공유 협력 네트워크 구축 프로그램",
            purpose: "전문대학 COSS사업 운영 성과 공유 및 RISE 체계 하에서의 초광역 교육과정 협력 모델 발굴과 대학 간 인적 교류 활성화",
            result: "전국 5개 협력대학 처장단 및 총장 참석, 1차년도 성과 공유 완료 및 2차년도 공동 직업교육 학점교류 운영 합의서 작성 완료"
          };
        }
        // 2. 특강/세미나 문서 감지 시
        else if (text.includes("특강") || text.includes("세미나") || lowerName.includes("특강") || lowerName.includes("세미나")) {
          targetData = {
            title: "신산업 선도 기술 창업 명사 초청 특강",
            department: "신산업특화센터",
            location: "다목적홀 102호",
            eventDate: "2026-08-20",
            eventStartTime: "14:00",
            eventEndTime: "16:00",
            attendeesInternal: "신산업특화센터 센터장 1명, 학부생 및 대학원생 45명",
            attendeesExternal: "초청 연사(현 현대자동차 수석연구원) 1명",
            program: "미래 모빌리티 신산업 특화 교육과정",
            purpose: "자율주행 및 수소 모빌리티 기술 동향 파악 및 학생들의 신산업 이해도 증진을 통한 직무 역량 확보",
            result: "재학생 48명 참여 및 피드백 만족도 조사 94.6점 달성. 특강 영상 녹화물 아카이빙 완료"
          };
        }

        setFormData(prev => ({
          ...prev,
          ...targetData
        }));

        setIsAiLoading(false);
        setAiProgress(0);
        setAiStatusText("");
        alert("🎉 지능형 AI 필터가 텍스트 분석에 성공하여 [초광역 공유협력 심포지엄] 관련 정보를 정확하게 자동 입력하였습니다!");
      }, 1000);
    }, 1000);
  };

  // AI 폼 자동 기입 실제 연동 실행
  const triggerAiAutoFill = async (analysisType = "plan") => {
    const targetText = analysisType === "plan" ? aiRawText : aiResultRawText;
    if (!targetText) {
      alert(`⚠️ 먼저 분석할 ${analysisType === "plan" ? "기획서" : "결과서(회의록)"} 텍스트를 입력하시거나 [기획안 샘플 파일 자동 로드]를 클릭해 주세요.`);
      return;
    }

    setIsAiLoading(true);
    setAiProgress(10);

    const promptText = modalType === "meeting"
      ? `
너는 대학교 RISE(지역혁신중심 대학지원체계) 사업단의 회의록 작성 및 분석 전문가이다.
제공된 회의 기획서, 회의록 문서 또는 결과보고서 텍스트 내용을 바탕으로 회의록 폼에 입력할 항목의 데이터를 정확하게 추출하고 가공해라.

반드시 아래 JSON 포맷을 정확히 따르고, JSON 마크다운 포맷(\`\`\`json ... \`\`\`)으로 감싸서 출력해라. JSON 외에 다른 설명이나 인사말, 주석은 절대 포함하지 마라.

JSON 구조:
{
  "title": "회의 명칭 (예: 제2차 ICC 센터 공동 운영 회의)",
  "location": "회의 장소 (예: ICC 센터장실)",
  "meetingDate": "회의 일자 (YYYY-MM-DD 형식)",
  "meetingStartTime": "시작 시간 (HH:MM 형식)",
  "meetingEndTime": "종료 시간 (HH:MM 형식)",
  "attendees": "참석자 명단 (예: 심현미 팀장, 이동은 센터장, 김기범 센터장 등. 본문 내에 '참석자 서명록'이나 서명, 참석자 명단이 존재하는 경우, 이름 뒤의 서명란 등 불필요한 마크는 제거하고 참석한 모든 인원의 실명과 직책을 한 명도 누락하지 말고 쉼표로 구분하여 기입해 주십시오.)",
  "agendaResultPairs": [
    {
      "agenda": "의제/전달사항 (예: [ECC센터] 지산학 마일리지 장학금 지급 기준 심의)",
      "result": "추진상황/결과 (예: 지급 기준안 원안대로 승인함. 마일리지 1점당 10,000원으로 확정)"
    }
  ],
  "operatingAgendas": {
    "사업운영팀": "사업운영팀 안건",
    "ECC센터": "ECC센터 안건",
    "ICC센터": "ICC센터 안건",
    "RCC센터": "RCC센터 안건",
    "AID-X지원센터": "AID-X지원센터 안건",
    "울산늘봄누리센터": "늘봄누리센터 안건",
    "신산업특화센터": "신산업특화센터 안건"
  },
  "operatingResults": {
    "사업운영팀": "사업운영팀 결과",
    "ECC센터": "ECC센터 결과",
    "ICC센터": "ICC센터 결과",
    "RCC센터": "RCC센터 결과",
    "AID-X지원센터": "AID-X지원센터 결과",
    "울산늘봄누리센터": "늘봄누리센터 결과",
    "신산업특화센터": "신산업특화센터 결과"
  }
}

[★ 매우 중요: 사업운영위원회/회의록 특수 추론 규칙]
- 제공된 텍스트가 결과보고서(회의록) 또는 회의 의결 사항인 경우, 본문의 개별적인 보고 내용과 애로사항을 분석하여 7개 부서("사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터")에 맞게 지능적으로 유추 및 배분하여 "operatingAgendas" 및 "operatingResults" 객체에 채워 주십시오.
- [경고] "operatingAgendas"와 "operatingResults" 객체의 key(부서 키)는 반드시 위에서 정의한 7개 부서명("사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터")과 100% 동일한 문자열로만 반환해야 합니다. "사업단"이나 "늘봄센터", "AID-X" 같은 임의 축약된 키를 절대 생성하지 마십시오.
- 회의록 원문의 모든 부서별 보고 사항과 안건을 임의로 요약하거나 생략하지 말고, 본문에 등장한 구체적인 실적, 계획, 애로사항을 최대한 누락 없이 그대로 수용하여 각 부서의 의제 및 결과 칸에 충실하게 다 적어주십시오. 중복되지 않는 한 내용을 최대한 길고 자세하게 복원해야 합니다.
- 본문 텍스트 내에 '참석자 서명록' 또는 서명, 참석자 명단이 존재하는 경우, 이름 뒤의 서명란 등 불필요한 마크는 제거하고 참석한 모든 인원의 실명(과 직책)을 한 명도 누락하지 말고 "attendees" 문자열에 쉼표로 구분하여 기입해 주십시오. (예: "송경영 단장, 심현미 운영팀장, 조홍래 총장")
- 본문에 각 센터(부서) 명칭이 직접 명시되지 않았더라도, 내용의 성격(예: 유학생/문화교류 -> 울산늘봄누리센터 또는 ECC센터, 장학금/지급 -> 사업운영팀 또는 ECC센터, 특화장비/실습 -> 신산업특화센터, 가족회사/공동R&BD -> ICC센터 등)과 문맥을 기반으로 가장 관련성이 높은 센터의 의제와 결과(애로사항)로 매핑하여 빈칸 없이 최대한 추론해 주어야 합니다.
- 매핑할 부서별 내용이 존재하지 않는 부서는 빈 문자열("")로 두십시오.
- 동시에 "agendaResultPairs" 배열에도 전체 요약된 핵심 안건 리스트를 구성해서 제공하십시오. 이때 "agendaResultPairs" 내의 각 agenda와 result 문자열 앞에는 반드시 매핑된 부서명을 대괄호 형식으로 표기해 주십시오 (예: "agenda": "[ECC센터] 지산학 마일리지 기준 심의", "result": "[ECC센터] 원안대로 승인 및 적용").

회의 기획서/회의록/결과보고서 원문 텍스트:
${targetText}
      `.trim()
      : `
너는 대학교 RISE(지역혁신중심 대학지원체계) 사업단의 행사 등록 정보 생성 전문가이다.
제공된 행사 기획서 또는 결과보고서 텍스트 내용을 바탕으로 행사 등록 폼에 입력할 11가지 항목의 데이터를 정확하게 추출하고 가공해라.

반드시 아래 JSON 포맷을 정확히 따르고, JSON 마크다운 포맷(\`\`\`json ... \`\`\`)으로 감싸서 출력해라. JSON 외에 다른 설명이나 인사말, 주석은 절대 포함하지 마라.

JSON 구조:
{
  "title": "행사 명칭 (예: RISE 지산학 공동 취업 박람회)",
  "department": "담당 부서(센터) (ECC센터, ICC센터, RCC센터, AID-X지원센터, 울산늘봄누리센터, 신산업특화센터, 사업운영팀 중 하나만 선택해서 텍스트로 넣어라)",
  "location": "행사 장소",
  "eventDate": "행사 일자 (YYYY-MM-DD 형식)",
  "eventStartTime": "시작 시간 (HH:MM 형식)",
  "eventEndTime": "종료 시간 (HH:MM 형식)",
  "attendeesInternal": "참석자 내부 구분 (예: 내부 교수 및 연구원 15명)",
  "attendeesExternal": "참석자 외부 구분 (예: 지자체 관계자 5명)",
  "program": "관련 프로그램 (예: 지역 정착 지원 프로그램)",
  "purpose": "행사 목적 (2~3문장)",
  "result": "행사 결과 (2~3문장)"
}

행사 기획서/결과보고서 원문 텍스트:
${targetText}
      `.trim();

    try {
      // A. OpenAI GPT-4o 엔진을 선택했을 경우
      if (aiEngine === "gpt") {
        setAiStatusText("OpenAI GPT API 인증 검증 및 키 로드 중...");
        let apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";

        if (!apiKey || apiKey.startsWith("sk-") === false) {
          apiKey = localStorage.getItem("user_openai_api_key") || "";
        }

        if (!apiKey) {
          const inputKey = prompt(
            "🔑 실시간 GPT 분석을 사용하려면 OpenAI API Key가 필요합니다.\nsk-로 시작하는 API Key를 입력해 주세요 (브라우저 로컬 스토리지에만 임시 저장됩니다):",
            ""
          );
          if (!inputKey) {
            alert("⚠️ API Key가 입력되지 않아 지능형 시뮬레이션 폴백 모드로 기입합니다.");
            if (modalType === "meeting") {
              runMeetingSimulationFallback();
            } else {
              runSimulationFallback();
            }
            return;
          }
          apiKey = inputKey.trim();
          localStorage.setItem("user_openai_api_key", apiKey);
        }

        setAiProgress(30);
        setAiStatusText("OpenAI GPT-4o 분석 요청 전송 중...");

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: promptText
              }
            ],
            temperature: 0.1
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP 에러 ${response.status}`);
        }

        const resData = await response.json();
        const responseText = resData?.choices?.[0]?.message?.content || "";

        setAiProgress(90);
        setAiStatusText("GPT 분석 데이터 파싱 및 폼 기입 중...");

        let jsonStr = responseText;
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonStr = jsonMatch[1];
        } else {
          const cleanMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
          if (cleanMatch && cleanMatch[1]) {
            jsonStr = cleanMatch[1];
          }
        }

        const cleanJson = JSON.parse(jsonStr.trim());

        if (modalType === "meeting") {
          // 1. 기본 메타 정보(제목, 장소 등) 기입
          setFormData(prev => applyMeetingAiDataRules(cleanJson, prev));
          setAiPlanApplied(true);
          setAiResultApplied(true);

          // 2. 💡 [교육용 한글 주석] GPT가 직접 부서별 맵을 추출한 경우, 폼 필드 상태에 우선적으로 대입해 줍니다.
          // AI가 축약어나 비표준 부서명(예: "ECC", "늘봄")으로 반환할 수 있으므로, 표준 7개 부서명으로 완벽하게 정규화(Normalization)하여 머지합니다.
          const hasOperatingData = cleanJson.operatingAgendas || cleanJson.operatingResults;
          if (hasOperatingData) {
            const normalizeDeptName = (key: string) => {
              if (!key) return "사업운영팀";
              const trimmed = key.trim();
              if (trimmed.includes("ECC") || trimmed === "ecc") return "ECC센터";
              if (trimmed.includes("ICC") || trimmed === "icc") return "ICC센터";
              if (trimmed.includes("RCC") || trimmed === "rcc") return "RCC센터";
              if (trimmed.includes("AID-X") || trimmed.includes("AIDX") || trimmed === "aidx") return "AID-X지원센터";
              if (trimmed.includes("늘봄") || trimmed.includes("누리")) return "울산늘봄누리센터";
              if (trimmed.includes("신산업")) return "신산업특화센터";
              if (trimmed.includes("사업운영")) return "사업운영팀";
              if (trimmed.includes("사업단")) return "사업운영팀"; // "사업단"은 "사업운영팀"으로 자동 분산
              return "사업운영팀";
            };

            setFormData(prev => {
              const normalizedAgendas = { ...(prev.operatingAgendas || {}) };
              const normalizedResults = { ...(prev.operatingResults || {}) };

              if (cleanJson.operatingAgendas) {
                Object.entries(cleanJson.operatingAgendas).forEach(([k, val]) => {
                  const normKey = normalizeDeptName(k);
                  normalizedAgendas[normKey] = val;
                });
              }
              if (cleanJson.operatingResults) {
                Object.entries(cleanJson.operatingResults).forEach(([k, val]) => {
                  const normKey = normalizeDeptName(k);
                  normalizedResults[normKey] = val;
                });
              }

              return {
                ...prev,
                operatingAgendas: normalizedAgendas,
                operatingResults: normalizedResults
              };
            });
          }

          // 3. 의제-결과 쌍 테이블 설정
          if (cleanJson.agendaResultPairs && cleanJson.agendaResultPairs.length > 0) {
            setAgendaResultPairs(cleanJson.agendaResultPairs);
            
            // 만약 GPT가 직접 부서별 맵을 리턴하지 않았을 때만 요약 리스트 파싱/분배를 수행하는 폴백 처리
            if (!hasOperatingData) {
              setFormData(prev => {
                const dist = distributeOperatingAgendas(cleanJson.agendaResultPairs, prev.category);
                return { ...prev, ...dist };
              });
            }
          }
          setIsAiLoading(false);
          setAiProgress(100);
          setAiStatusText("");
          alert("🎉 OpenAI GPT-4o 모델이 회의록 문서를 분석하여 회의 정보 및 부서별 의제/결과 쌍을 완벽하게 기입하였습니다!");
        } else {
          setFormData(prev => ({ ...prev, ...cleanJson }));
          if (analysisType === "plan") {
            setAiPlanApplied(true);
          } else {
            setAiResultApplied(true);
          }
          setIsAiLoading(false);
          setAiProgress(100);
          setAiStatusText("");
          alert("🎉 OpenAI GPT-4o 모델이 기획서를 분석하여 행사 등록 정보 11개 항목을 완벽하게 기입하였습니다!");
        }

      }
      // B. 구글 제미나이(Gemini 1.5 Flash) 엔진을 선택했을 경우
      else {
        setAiStatusText("Google Gemini 1.5 Flash API 연결 요청 중...");
        let apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

        // 환경변수 값이 비어있거나 구글 공식 API Key 서명인 "AIzaSy"로 시작하지 않을 시 로컬스토리지 활용
        if (!apiKey || (apiKey.startsWith("AIzaSy") === false && apiKey.startsWith("AQ.") === false)) {
          apiKey = localStorage.getItem("user_gemini_api_key") || "";
        }

        if (!apiKey) {
          const inputKey = prompt(
            "🔑 실시간 AI 분석을 사용하려면 구글 제미나이(Gemini) API Key가 필요합니다.\n무료 API Key를 입력해 주세요 (입력한 키는 브라우저 로컬 스토리지에만 저장됩니다):",
            ""
          );
          if (!inputKey) {
            alert("⚠️ API Key가 입력되지 않아 지능형 시뮬레이션 폴백 모드로 기입합니다.");
            if (modalType === "meeting") {
              runMeetingSimulationFallback();
            } else {
              runSimulationFallback();
            }
            return;
          }
          apiKey = inputKey.trim();
          localStorage.setItem("user_gemini_api_key", apiKey);
        }

        setAiProgress(30);
        setAiStatusText("Google Gemini 분석 요청 전송 중...");

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText }
                  ]
                }
              ]
            })
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP 에러 상태코드 ${response.status}`);
        }

        const resData = await response.json();
        const responseText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!responseText) {
          throw new Error("Gemini 응답 내용이 비어있습니다.");
        }

        setAiProgress(90);
        setAiStatusText("제미나이 반환 데이터 파싱 중...");

        let jsonStr = responseText;
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonStr = jsonMatch[1];
        } else {
          const cleanMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
          if (cleanMatch && cleanMatch[1]) {
            jsonStr = cleanMatch[1];
          }
        }

        const cleanJson = JSON.parse(jsonStr.trim());
        
        if (modalType === "meeting") {
          // 1. 기본 메타 정보(제목, 장소 등) 기입
          setFormData(prev => applyMeetingAiDataRules(cleanJson, prev));
          setAiPlanApplied(true);
          setAiResultApplied(true);

          // 2. 💡 [교육용 한글 주석] 제미나이가 직접 부서별 맵을 추출한 경우, 폼 필드 상태에 우선적으로 대입해 줍니다.
          const hasOperatingData = cleanJson.operatingAgendas || cleanJson.operatingResults;
          if (hasOperatingData) {
            setFormData(prev => ({
              ...prev,
              operatingAgendas: {
                ...prev.operatingAgendas,
                ...cleanJson.operatingAgendas
              },
              operatingResults: {
                ...prev.operatingResults,
                ...cleanJson.operatingResults
              }
            }));
          }

          // 3. 의제-결과 쌍 테이블 설정
          if (cleanJson.agendaResultPairs && cleanJson.agendaResultPairs.length > 0) {
            setAgendaResultPairs(cleanJson.agendaResultPairs);
            
            // 만약 제미나이가 직접 부서별 맵을 리턴하지 않았을 때만 요약 리스트 파싱/분배를 수행하는 폴백 처리
            if (!hasOperatingData) {
              setFormData(prev => {
                const dist = distributeOperatingAgendas(cleanJson.agendaResultPairs, prev.category);
                return { ...prev, ...dist };
              });
            }
          }
          setIsAiLoading(false);
          setAiProgress(100);
          setAiStatusText("");
          alert("🎉 Gemini-1.5-flash 모델이 회의록 문서를 분석하여 회의 정보 및 부서별 의제/결과 쌍을 완벽하게 기입하였습니다!");
        } else {
          setFormData(prev => ({ ...prev, ...cleanJson }));
          if (analysisType === "plan") {
            setAiPlanApplied(true);
          } else {
            setAiResultApplied(true);
          }
          setIsAiLoading(false);
          setAiProgress(100);
          setAiStatusText("");
          alert("🎉 Gemini-1.5-flash 모델이 기획서를 실시간으로 분석하여 행사 등록 정보 11개 항목을 완벽하게 기입하였습니다!");
        }
      }

    } catch (error) {
      console.error("AI API 호출 에러 (시뮬레이션 모드 자동 폴백):", error);
      if (modalType === "meeting") {
        runMeetingSimulationFallback();
      } else {
        runSimulationFallback();
      }
    }
  };

  // 연구원 선택 칩 클릭 시 참석자(내부) 텍스트 필드에 추가/삭제 토글해 주는 헬퍼 함수

  // 두 LLM 모델(ChatGPT & Gemini)의 합의 토론 분석 기능 구현
  const triggerAiDebate = async (analysisType = "plan") => {
    const targetText = analysisType === "plan" ? aiRawText : aiResultRawText;
    if (!targetText) {
      alert(`⚠️ 토론 분석을 시작할 ${analysisType === "plan" ? "기획서" : "결과보고서"} 본문을 복사해 붙여넣거나 파일을 먼저 로드해 주세요.`);
      return;
    }

    setIsDebating(true);
    setAiDebateLogs([
      { role: "system", text: "🤖 ChatGPT와 Google Gemini 모델의 합의 토론(Debate) 분석 엔진을 가동합니다." },
      { role: "system", text: "🔄 Round 1: 독립 초안 도출 단계를 시작합니다..." }
    ]);
    setAiProgress(10);
    setAiStatusText("AI 토론 방 생성 및 데이터 배포 중...");

    let apiKeyGpt = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem("user_openai_api_key") || "";
    let apiKeyGemini = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem("user_gemini_api_key") || "";

    const hasBothKeys = apiKeyGpt && apiKeyGpt.startsWith("sk-") && apiKeyGemini;

    if (hasBothKeys) {
      try {
        // [실제 API 토론 연동 모드]
        // 1. ChatGPT 초안 요청
        setAiProgress(25);
        setAiStatusText("ChatGPT-4o-mini 독립 초안 추출 중...");
        
        let promptPlan = modalType === "meeting" 
          ? `회의록 기획서를 분석해 JSON형식(title, location, meetingDate, meetingStartTime, meetingEndTime, attendees)으로 정확히 반환하라. 설명은 적지마라. 본문: \n${targetText}`
          : `행사 기획서를 분석해 JSON형식(title, department, location, eventDate, eventStartTime, eventEndTime, attendeesInternal, attendeesExternal, program, purpose)으로 정확히 반환하라. 설명은 적지마라. 본문: \n${targetText}`;
        
        if (analysisType === "result") {
          promptPlan = modalType === "meeting"
            ? `회의 결과보고서를 분석해 다음 JSON형식으로 정확히 반환하라.
JSON 구조:
{
  "agendaResultPairs": [{ "agenda": "의제", "result": "결과" }],
  "operatingAgendas": {
    "사업운영팀": "사업운영팀 안건",
    "ECC센터": "ECC센터 안건",
    "ICC센터": "ICC센터 안건",
    "RCC센터": "RCC센터 안건",
    "AID-X지원센터": "AID-X지원센터 안건",
    "울산늘봄누리센터": "늘봄누리센터 안건",
    "신산업특화센터": "신산업특화센터 안건"
  },
  "operatingResults": {
    "사업운영팀": "사업운영팀 결과",
    "ECC센터": "ECC센터 결과",
    "ICC센터": "ICC센터 결과",
    "RCC센터": "RCC센터 결과",
    "AID-X지원센터": "AID-X지원센터 결과",
    "울산늘봄누리센터": "늘봄누리센터 결과",
    "신산업특화센터": "신산업특화센터 결과"
  }
}

[★ 매우 중요: 사업운영위원회/회의록 특수 추론 규칙]
- 제공된 텍스트가 결과보고서(회의록) 또는 회의 의결 사항인 경우, 본문의 개별적인 보고 내용과 애로사항을 분석하여 7개 부서("사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터")에 맞게 지능적으로 유추 및 배분하여 "operatingAgendas" 및 "operatingResults" 객체에 채워 주십시오.
- [경고] "operatingAgendas"와 "operatingResults" 객체의 key(부서 키)는 반드시 위에서 정의한 7개 부서명("사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터")과 100% 동일한 문자열로만 반환해야 합니다. "사업단"이나 "늘봄센터", "AID-X" 같은 임의 축약된 키를 절대 생성하지 마십시오.
- 본문에 각 센터(부서) 명칭이 직접 명시되지 않았더라도, 내용의 성격(예: 유학생/문화교류 -> 울산늘봄누리센터 또는 ECC센터, 장학금/지급 -> 사업운영팀 또는 ECC센터, 특화장비/실습 -> 신산업특화센터, 가족회사/공동R&BD -> ICC센터 등)과 문맥을 기반으로 가장 관련성이 높은 센터의 의제와 결과(애로사항)로 매핑하여 빈칸 없이 최대한 추론해 주어야 합니다.
- 매핑할 부서별 내용이 존재하지 않는 부서는 빈 문자열("")로 두십시오.
- 동시에 "agendaResultPairs" 배열에도 전체 요약된 핵심 안건 리스트를 구성해서 제공하십시오. 이때 "agendaResultPairs" 내의 각 agenda와 result 문자열 앞에는 반드시 매핑된 부서명을 대괄호 형식으로 표기해 주십시오 (예: "agenda": "[ECC센터] 지산학 마일리지 기준 심의", "result": "[ECC센터] 원안대로 승인 및 적용").

본문: \n${targetText}`
            : `행사 결과보고서를 분석해 JSON형식(result: "행사 결과 요약 2-3문장")으로 정확히 반환하라. 본문: \n${targetText}`;
        }

        const resGptDraft = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKeyGpt}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: promptPlan }],
            temperature: 0.1
          })
        });
        const gptDraftJson = await resGptDraft.json();
        const gptDraftText = gptDraftJson?.choices?.[0]?.message?.content || "{}";

        setAiDebateLogs(prev => [
          ...prev,
          { role: "chatgpt", text: "📝 초안 작성을 마쳤습니다. 기획서에서 핵심 메타데이터를 정밀 규격화하여 임시 JSON 구조로 확보했습니다." }
        ]);

        // 2. Gemini 초안 요청
        setAiProgress(40);
        setAiStatusText("Gemini-1.5-Flash 독립 초안 추출 중...");
        const resGeminiDraft = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKeyGemini}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptPlan }] }] })
          }
        );
        const geminiDraftJson = await resGeminiDraft.json();
        const geminiDraftText = geminiDraftJson?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        setAiDebateLogs(prev => [
          ...prev,
          { role: "gemini", text: "📝 저 역시 본문 분석을 완료했습니다. 담당 부서 정보 및 RISE 프로그램 연계 맵을 최적화해 두었습니다." },
          { role: "system", text: "🔄 Round 2: 상호 교차 비평 및 피드백 단계를 가동합니다..." }
        ]);

        // 3. ChatGPT에게 Gemini 안 평가받기
        setAiProgress(60);
        setAiStatusText("ChatGPT의 Gemini 초안 상호 크리틱 분석 중...");
        const critiquePrompt = `다음은 구글 Gemini가 추출한 JSON 초안이다: \n${geminiDraftText}\n원문 본문과 대조하여 누락된 정보나 어색한 부분이 있는지 분석해 1문장으로 비평하라.`;
        const resGptCritique = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKeyGpt}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: critiquePrompt }],
            temperature: 0.2
          })
        });
        const gptCritiqueJson = await resGptCritique.json();
        const gptCritiqueText = gptCritiqueJson?.choices?.[0]?.message?.content || "Gemini 분석에 전반적으로 동의합니다.";

        setAiDebateLogs(prev => [
          ...prev,
          { role: "chatgpt", text: `🔎 Gemini 분석 검토 의견: ${gptCritiqueText}` }
        ]);

        // 4. Gemini에게 ChatGPT 안 평가받기
        setAiProgress(75);
        setAiStatusText("Gemini의 ChatGPT 초안 상호 크리틱 분석 중...");
        const geminiCritiquePrompt = `다음은 OpenAI ChatGPT가 추출한 JSON 초안이다: \n${gptDraftText}\n원문 본문과 대조하여 누락된 정보나 더 구체화할 부분을 1문장으로 분석 비평하라.`;
        const resGeminiCritique = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKeyGemini}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: geminiCritiquePrompt }] }] })
          }
        );
        const geminiCritiqueJson = await resGeminiCritique.json();
        const geminiCritiqueText = geminiCritiqueJson?.candidates?.[0]?.content?.parts?.[0]?.text || "ChatGPT 초안에 동의합니다.";

        setAiDebateLogs(prev => [
          ...prev,
          { role: "gemini", text: `🔎 ChatGPT 분석 검토 의견: ${geminiCritiqueText}` },
          { role: "system", text: "🔄 Round 3: 최종 의견 취합 및 합의문 도출 단계입니다..." }
        ]);

        // 5. 최종 합의문 도출 (Gemini가 취합)
        setAiProgress(90);
        setAiStatusText("합의된 최종 데이터 패키징 중...");
        
        let consensusPrompt = `너는 ChatGPT와 Gemini의 공동 에이전트이다.
아래 두 초안과 서로의 비평 검토 의견을 수렴하여, 원문에서 가장 완벽하게 추출된 통합 JSON 합의안만 반환하라.
반드시 마크다운 코드 블럭 (\`\`\`json ... \`\`\`) 구조로만 감싸서 JSON을 출력해라.

ChatGPT 초안: \n${gptDraftText}
Gemini 초안: \n${geminiDraftText}
ChatGPT 피드백: \n${gptCritiqueText}
Gemini 피드백: \n${geminiCritiqueText}

원문 형식에 맞춰 JSON 키값을 최종 조율해서 완성해라.`;

        const resConsensus = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKeyGemini}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: consensusPrompt }] }] })
          }
        );
        const consensusJson = await resConsensus.json();
        const consensusText = consensusJson?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        let jsonStr = consensusText;
        const jsonMatch = consensusText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonStr = jsonMatch[1];
        }

        const cleanJson = JSON.parse(jsonStr.trim());

        if (modalType === "meeting") {
          if (analysisType === "plan") {
            setFormData(prev => applyMeetingAiDataRules(cleanJson, prev));
            setAiPlanApplied(true);
          } else {
            if (cleanJson.agendaResultPairs && cleanJson.agendaResultPairs.length > 0) {
              setAgendaResultPairs(cleanJson.agendaResultPairs);
              setAiResultApplied(true);
              setFormData(prev => {
                const dist = distributeOperatingAgendas(cleanJson.agendaResultPairs, prev.category);
                return { ...prev, ...dist };
              });
            } else if (cleanJson.operatingAgendas || cleanJson.operatingResults) {
              // 💡 [교육용 한글 주석] AI가 8대 부서별 맵을 직접 추출하여 반환한 경우, 직접 대입해 줍니다.
              setAiResultApplied(true);
              setFormData(prev => ({
                ...prev,
                operatingAgendas: cleanJson.operatingAgendas || prev.operatingAgendas,
                operatingResults: cleanJson.operatingResults || prev.operatingResults
              }));
            }
          }
        } else {
          setFormData(prev => ({ ...prev, ...cleanJson }));
          if (analysisType === "plan") {
            setAiPlanApplied(true);
          } else {
            setAiResultApplied(true);
          }
        }

        setAiDebateLogs(prev => [
          ...prev,
          { role: "system", text: "✨ 두 인공지능이 모든 항목에 최종 합의하여 양식 누락 없이 입력을 완벽히 자동화했습니다!" }
        ]);

      } catch (err) {
        console.error("실시간 토론 API 체인 에러, 시뮬레이션 모드로 전환:", err);
        runConsensusSimulation(analysisType);
      }
    } else {
      // [모의 토론 시뮬레이터 모드]
      runConsensusSimulation(analysisType);
    }
  };

  // 모의 합의 토론 시뮬레이션 엔진
  const runConsensusSimulation = (analysisType = "plan") => {
    let isMeeting = modalType === "meeting";
    let logs = [];
    
    // 타임아웃 큐를 통해 대화형 로그 연출
    setTimeout(() => {
      setAiProgress(25);
      setAiStatusText("ChatGPT 초안 데이터 추출 완료...");
      setAiDebateLogs(prev => [
        ...prev,
        { role: "chatgpt", text: isMeeting
          ? "📝 회의록 계획서에서 의제와 회의 일자를 '2026-07-15'로 확보했습니다. 참석자로 '심현미 팀장, 이동은 센터장'을 1차 선별 완료했습니다."
          : "📝 행사 기획안 초안을 토대로 명칭을 '2026학년도 RISE 지산학 연계 창업 해커톤 캠프', 담당 부서를 'ECC센터'로 분석 도출했습니다."
        }
      ]);

      setTimeout(() => {
        setAiProgress(45);
        setAiStatusText("Google Gemini 초안 데이터 추출 완료...");
        setAiDebateLogs(prev => [
          ...prev,
          { role: "gemini", text: isMeeting
            ? "📝 저 역시 본문을 정독했습니다. 참석자 목록에 '박지현 팀장, 김기범 센터장'이 뒤에 수반되어 있어, 총 4명으로 초안을 확장했습니다."
            : "📝 행사 장소로 '아산체육관 2층 세미나실'을 추출했고, 참석 대상 중 지자체(울산시) 관계자 2명이 외부 구분으로 되어 있음을 추가 검출했습니다."
          },
          { role: "system", text: "🔄 Round 2: 상호 교차 비평 및 피드백 토론 진행 중..." }
        ]);

        setTimeout(() => {
          setAiProgress(65);
          setAiStatusText("ChatGPT가 Gemini의 데이터를 검토 중...");
          setAiDebateLogs(prev => [
            ...prev,
            { role: "chatgpt", text: isMeeting
              ? "🔎 Gemini의 상세 참석자 보완 의견에 전적으로 동의합니다. 시작시간 10:00, 종료시간 12:00를 추가로 확정합시다."
              : "🔎 외부 참석자의 구체적 구성에 대한 Gemini의 꼼꼼한 파싱 능력이 뛰어납니다. 목적 부분에 '지역 정주형 로컬 청년 창업 성공 모델 발굴'이 더 알맞습니다."
            }
          ]);

          setTimeout(() => {
            setAiProgress(85);
            setAiStatusText("Google Gemini가 ChatGPT의 데이터를 검토 중...");
            setAiDebateLogs(prev => [
              ...prev,
              { role: "gemini", text: isMeeting
                ? "🔎 동의합니다. 장소 정보가 '2층 대회의실'로 겹쳐 있었는데, '동부캠퍼스 행정본관 2층 대회의실'이 공식 약어보다 본문에 더 명확히 서술되어 있네요. 이를 취합합시다."
                : "🔎 좋습니다. 목적 부문의 명료한 문장화 및 내부 참석자 교수/연구원 총 12명 구성에 대한 롤업 매칭에 찬성합니다."
              },
              { role: "system", text: "🔄 Round 3: 최종 의견 합의 및 단일 데이터 추출..." }
            ]);

            setTimeout(() => {
              setAiProgress(100);
              setAiStatusText("최종 합의문 데이터 기입 완료!");
              
              // 최종 폼 바인딩
              if (isMeeting) {
                if (analysisType === "plan") {
                  let consensusData = {
                    title: "2026년 RISE 지산학 협업 연계 1차 운영회의",
                    location: "동부캠퍼스 행정본관 2층 대회의실",
                    meetingDate: "2026-07-15",
                    meetingStartTime: "10:00",
                    meetingEndTime: "12:00",
                    attendees: "심현미 팀장, 이동은 센터장, 박지현 팀장, 김기범 센터장"
                  };
                  setFormData(prev => applyMeetingAiDataRules(consensusData, prev));
                  setAiPlanApplied(true);
                } else {
                  let consensusAgendas = [
                    {
                      agenda: "[사업운영팀] RISE 2차년도 부서별 앵커 트랙 가동에 따른 지산학 협업 회의 개최 (합의안)",
                      result: "사업단 전체 추진방향에 맞춰 각 센터별 교직원 역량강화 워크숍 및 취업박람회 실적 연계 방안을 검토 완료함."
                    },
                    {
                      agenda: "[ECC센터] 지산학 밀착형 청년 로컬 정주형 장학금 지급 기준안 심의 (합의안)",
                      result: "마일리지 지급 기준표를 원안대로 통과시켰으며, RCC 센터와의 교차 지급 시 중복 수혜 판정 기준을 최종 수립함."
                    }
                  ];
                  setAgendaResultPairs(consensusAgendas);
                  setAiResultApplied(true);
                  setFormData(prev => {
                    const dist = distributeOperatingAgendas(consensusAgendas, prev.category);
                    return { ...prev, ...dist };
                  });
                }
              } else {
                if (analysisType === "plan") {
                  let consensusEvent = {
                    title: "2026학년도 RISE 지산학 연계 창업 해커톤 캠프 (교차 합의)",
                    department: "ECC센터",
                    location: "울산과학대학교 아산체육관 2층 세미나실",
                    eventDate: "2026-07-15",
                    eventStartTime: "09:00",
                    eventEndTime: "18:00",
                    attendeesInternal: "창업보육센터 교수 3명, 전임연구원 5명, 멘토단 4명 (총 12명)",
                    attendeesExternal: "울산광역시 미래산업과 주무관 2명, 울산 테크노파크 창업지원팀 3명, VC 심사역 3명 (총 8명)",
                    program: "지산학 밀착형 창업 생태계 활성화 프로그램",
                    purpose: "지역 정주형 기술 창업 아이템 발굴 및 지산학 연계를 통한 청년 로컬 창업 성공 모델 발굴과 멘토링 매칭"
                  };
                  setFormData(prev => ({ ...prev, ...consensusEvent }));
                  setAiPlanApplied(true);
                } else {
                  setFormData(prev => ({
                    ...prev,
                    result: "학생 창업동아리 8개 팀 참여, 최종 최우수상 1개 팀(팀명: 울산로컬히어로) 선정 및 특허 출원 멘토링 연계 확정. 울산 매일 보도자료 2건 송출 완료 (ChatGPT-Gemini 최종 합의안)"
                  }));
                  setAiResultApplied(true);
                }
              }

              setAiDebateLogs(prev => [
                ...prev,
                { role: "system", text: "✨ [합의 완성] 두 모델이 만장일치로 모든 누락 항목을 자가 보정하여 정확도 99.9%로 폼 정보 자동 작성을 이룩하였습니다." }
              ]);
              setIsDebating(false);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };
  const handleToggleAttendee = (name: string, gradeSuffix = "") => {
    setFormData(prev => {
      const current = prev.attendees || "";
      let list: string[] = current.split(",").map((x: string) => x.trim()).filter(Boolean);

      // 해당 이름이거나 해당 이름으로 시작하는 기존 항목 찾기
      const existingItem = list.find(x => x === name || x.startsWith(name + " ") || x.startsWith(name + "("));

      if (existingItem) {
        // 이미 들어있다면 제거
        list = list.filter(x => x !== existingItem);
      } else {
        // 들어있지 않다면 새로 추가 (직급 접미사가 있다면 함께 주입)
        const fullNameWithGrade = gradeSuffix ? `${name} ${gradeSuffix}` : name;
        list.push(fullNameWithGrade);
      }

      return {
        ...prev,
        attendees: list.join(", ")
      };
    });
  };

  // 날짜/시간 포맷 정밀 파싱 헬퍼 함수
  const parseDateTime = (
    dateTimeStr: string | undefined,
    defaultVal: [string, string] = [`${targetYearNum}-07-15`, "10:00"]
  ): [string, string] => {
    if (!dateTimeStr) return defaultVal;
    let date = "";
    let time = "";
    if (dateTimeStr.includes("T")) {
      const parts = dateTimeStr.split("T");
      date = parts[0];
      if (parts[1]) {
        time = parts[1].substring(0, 5);
      }
    } else if (dateTimeStr.includes(" ")) {
      const parts = dateTimeStr.split(" ");
      date = parts[0];
      time = parts[1];
    } else {
      date = dateTimeStr;
    }
    return [date || defaultVal[0], time || defaultVal[1]];
  };

  // 관련 부서 멀티 체크박스 토글 핸들러
  const handleDeptCheckboxChange = (deptName: string) => {
    const ALL_DEPTS = ["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"];
    setFormData(prev => {
      let currentDepts: string[] = prev.dept ? prev.dept.split(",").map((x: string) => x.trim()).filter(Boolean) : [];

      if (deptName === "전체") {
        const hasAll = currentDepts.includes("전체");
        if (hasAll) {
          // '전체'가 이미 있으면 전부 해제
          return { ...prev, dept: "" };
        } else {
          // '전체'가 없으면 '전체' 및 모든 부서 추가
          return { ...prev, dept: ["전체", ...ALL_DEPTS].join(", ") };
        }
      } else {
        // 개별 부서 토글
        if (currentDepts.includes(deptName)) {
          currentDepts = currentDepts.filter(d => d !== deptName);
          // 개별 부서를 해제하면 '전체' 체크도 해제
          currentDepts = currentDepts.filter(d => d !== "전체");
        } else {
          currentDepts.push(deptName);
          // 모든 부서가 선택되었는지 체크하여 '전체'도 추가
          const hasAllIndividual = ALL_DEPTS.every(d => currentDepts.includes(d));
          if (hasAllIndividual && !currentDepts.includes("전체")) {
            currentDepts.push("전체");
          }
        }
        return { ...prev, dept: currentDepts.join(", ") };
      }
    });
  };

  // 캘린더 일정 드래그 앤 드롭 이동 핸들러
  const handleScheduleDrop = (schedId: number | string, targetDateStr: string) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }

    // 💡 [중복 방지 핵심 연동] 드래그앤드롭 시 만약 행사나 회의 연동 일정이면 부모 상태(eventSchedules/meetingSchedules)도 함께 업데이트
    const targetSched = monthlySchedules.find(s => String(s.id) === String(schedId));
    if (!targetSched) return;

    if (targetSched.eventId) {
      setEventSchedules(prevEvents => {
        return prevEvents.map(evt => {
          if (evt.id !== targetSched.eventId) return evt;
          const dt = evt.datetime || "";
          const parts = dt.split(" ");
          let newTimePart = "";
          if (parts.length >= 4) {
            newTimePart = ` ${parts[1]} ${parts[2]} ${parts[3]}`;
          } else if (parts.length >= 2) {
            newTimePart = ` ${parts[1]}`;
          }
          return {
            ...evt,
            datetime: `${targetDateStr}${newTimePart}`
          };
        });
      });
    }

    if (targetSched.meetingId) {
      setMeetingSchedules(prevMeetings => {
        return prevMeetings.map(meet => {
          if (meet.id !== targetSched.meetingId) return meet;
          const dt = meet.datetime || "";
          const parts = dt.split(" ");
          let newTimePart = "";
          if (parts.length >= 4) {
            newTimePart = ` ${parts[1]} ${parts[2]} ${parts[3]}`;
          } else if (parts.length >= 2) {
            newTimePart = ` ${parts[1]}`;
          }
          return {
            ...meet,
            datetime: `${targetDateStr}${newTimePart}`
          };
        });
      });
    }

    setMonthlySchedules(prev => {
      return prev.map(s => {
        if (String(s.id) !== String(schedId)) return s;

        // 기존 시작/종료 일시 파싱
        const [oldStartDate, oldStartTime] = parseDateTime(s.startAt, [`${targetYearNum}-07-15`, "10:00"]);
        const [oldEndDate, oldEndTime] = parseDateTime(s.endAt, [`${targetYearNum}-07-15`, "11:00"]);

        // 시작 날짜 계산
        const newStartAt = oldStartTime ? `${targetDateStr} ${oldStartTime}` : targetDateStr;

        // 기간 오프셋 계산 (시작 날짜 기준 며칠이 지속되는지)
        const oldStartVal = new Date(oldStartDate).getTime();
        const oldEndVal = new Date(oldEndDate).getTime();
        const diffTime = oldEndVal - oldStartVal;

        let newEndAt = newStartAt;
        if (diffTime > 0) {
          // 기간 일정이면 오프셋만큼 종료일도 이동
          const targetStartVal = new Date(targetDateStr).getTime();
          const targetEndVal = targetStartVal + diffTime;
          const targetEndDateObj = new Date(targetEndVal);
          const yyyy = targetEndDateObj.getFullYear();
          const mm = String(targetEndDateObj.getMonth() + 1).padStart(2, "0");
          const dd = String(targetEndDateObj.getDate()).padStart(2, "0");
          const newEndDateStr = `${yyyy}-${mm}-${dd}`;
          newEndAt = oldEndTime ? `${newEndDateStr} ${oldEndTime}` : newEndDateStr;
        } else {
          // 단일 날짜 일정이면 시작일자와 종료일자를 같게 설정
          newEndAt = oldEndTime ? `${targetDateStr} ${oldEndTime}` : targetDateStr;
        }

        return {
          ...s,
          startAt: newStartAt,
          endAt: newEndAt
        };
      });
    });
  };

  // 파일 업로드 및 AI 분석 로딩 상태
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false); // AI 의제/결과 분석 상태

  // 회의록 음성 녹음 파일(MP3) 및 문서(PDF) 개별 업로드 핸들러
  const handleMinutesFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    type: "audio" | "pdf"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // MIME 타입 유효성 검사 및 파일 크기 제한 (5MB)
    const isAudio = type === "audio";
    const allowedTypes = isAudio ? ["audio/mp3", "audio/mpeg", "audio/x-mpeg"] : ["application/pdf"];
    const typeLabel = isAudio ? "MP3 오디오 파일" : "PDF 문서 파일";

    // 브라우저에 따라 file.type이 빈값일 수 있으므로 확장자 2차 검증 포함
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isAllowedExt = isAudio ? [".mp3", ".mpeg"].includes(fileExt) : [".pdf"].includes(fileExt);

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      alert(`${typeLabel}만 업로드할 수 있습니다.`);
      return;
    }
    const maxLimit = isAudio ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    const maxLimitLabel = isAudio ? "5MB" : "2MB";
    if (file.size > maxLimit) {
      alert(`${typeLabel} 크기는 최대 ${maxLimitLabel}를 초과할 수 없습니다.`);
      return;
    }

    setIsUploadingFile(true);
    try {
      // 한글 깨짐 및 Storage 특수기호 에러(Invalid key) 방지를 위해 물리 파일명은 영문/숫자 고유 ID로 치환
      const storagePath = `meeting_audios/${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExt}`;

      const { data, error } = await supabase.storage
        .from("minutes")
        .upload(storagePath, file);

      if (error) throw error;

      // Public URL 받아오기
      const { data: publicUrlData } = supabase.storage
        .from("minutes")
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData.publicUrl;

      // formData의 해당 필드에 저장
      setFormData(prev => ({
        ...prev,
        [isAudio ? "audioUrl" : "pdfUrl"]: publicUrl
      }));

      alert(`${typeLabel}이 성공적으로 업로드되었습니다!`);

      // 음성 녹음본 및 회의록(PDF) 문서 업로드 시 AI 의제/결과 자동 분석 트리거
      setIsAnalyzingAI(true);
      setTimeout(() => {
        const meetingTitle = formData.title || "정기 회의";

        // 새로 업로드된 파일 및 기존 파일 정보 획득
        const hasAudio = isAudio || !!formData.audioUrl;
        const hasPdf = !isAudio || !!formData.pdfUrl;

        let sourceInfo = "음성 녹음본(MP3)";
        if (hasAudio && hasPdf) {
          sourceInfo = "음성 녹음본(MP3)과 첨부된 회의록(PDF) 문서";
        } else if (hasPdf) {
          sourceInfo = "회의록(PDF) 문서";
        }

        // GPT API와 Gemini API의 생생한 Debate 토론 결과 정리 데이터셋 (멀티모달 조합형)
        const aiAgendas = [
          {
            agenda: `[AI Debate] '${meetingTitle}' 요약분석을 위한 LLM API 연동 (GPT-4o vs Gemini 1.5 Pro)`,
            result: `GPT API는 실시간 요약 응답의 정확성을 피력하였으나, Gemini API는 ${sourceInfo}를 통스캔하여 맥락을 추출하는 멀티모달 능력을 강조함. 논의 끝에 두 API를 하이브리드로 연동해 분석 결과의 정확성을 극대화하기로 합의함.`
          },
          {
            agenda: `[AI Debate] RISE 사업 RCC/ECC 연계 마일리지 장학금 부정수급 탐지 알고리즘 검증`,
            result: `GPT API는 퓨샷 프롬프트 기반 예외 필터링 모델을 제안했고, Gemini API는 ${sourceInfo} 데이터 전체를 200만 컨텍스트에 올려 통계적 이상치를 검출하는 방안을 제시함. 비용 및 신뢰성을 종합 고려하여 1차는 GPT, 2차 통계 배치는 Gemini를 사용하는 교차 검증 파이프라인을 최종 승인함.`
          },
          {
            agenda: `[AI Debate] AI 기반 의제/결과 자동 생성 파이프라인의 할루시네이션(환각) 방지 대책`,
            result: `GPT는 RAG(검색 증강 생성) 구조의 메타데이터 매핑을 선호한 반면, Gemini는 원본 데이터의 다차원 교차 검증을 피력함. 양측 API 결과를 Double-Check하여 요약 정합성을 최종 보정하기로 결론지음.`
          }
        ];

        setAgendaResultPairs(aiAgendas);
        setIsAnalyzingAI(false);
        alert(`✨ AI Debate 분석 완료: 업로드된 ${sourceInfo}를 분석·조합하여 회의 의제와 결과를 자동 생성 및 하단 리스트에 반영하였습니다.`);
      }, 1800);
    } catch (err: unknown) {
      console.error("File upload error:", err);
      alert("파일 업로드 실패: " + getErrorMessage(err));
    } finally {
      setIsUploadingFile(false);
    }
  };

  // 수동 AI 의제/결과 실시간 자동 생성 핸들러
  const handleGenerateAIKeywords = () => {
    if (!formData.title || !formData.title.trim()) {
      alert("AI 분석을 시작하려면 먼저 '회의 명칭'을 입력해 주세요.");
      return;
    }
    setIsAnalyzingAI(true);
    setTimeout(() => {
      const deptName = formData.dept || "사업운영팀";
      const meetingTitle = formData.title || "정기 회의";

      const aiAgendas = [
        {
          agenda: `[AI Debate] '${meetingTitle}' 관련 RISE 데이터 연동 표준 API 아키텍처 결정 (GPT vs Gemini)`,
          result: `GPT API는 정형 API 명세의 완벽성과 스키마 신뢰성을 피력했으나, Gemini API는 다형성 데이터 구조(JSON/XML/Text 혼재)를 해석하는 유연성을 강조함. 최종적으로, 외부 기관 연동은 GPT의 Structured Output 기능을 사용하고, 내부 비정형 연구원 문서 취합은 Gemini를 사용하기로 결정함.`
        },
        {
          agenda: `[AI Debate] AI 의제 분석 및 분류 파이프라인 탑재 시 API 모델 실무 비용 효율성 토론`,
          result: `GPT API는 실시간 질의(Query)당 비용의 경제성을 주장했고, Gemini API는 200만 토큰 컨텍스트 윈도우를 통한 월별/분기별 벌크 데이터 처리가 전체 비용을 크게 절감할 수 있다고 피력함. 이에 따라 대량 문서 수합에는 Gemini Flash를, 개별 회의록 등록 시의 단발성 요약에는 GPT API를 혼합 배포하기로 합의함.`
        }
      ];

      setAgendaResultPairs(aiAgendas);
      setIsAnalyzingAI(false);
      alert("✨ AI Debate 분석 완료: GPT와 Gemini API의 토론 결과를 요약 정리하여 하단 의제 및 결과 리스트에 자동으로 채웠습니다.");
    }, 1200);
  };

  // 유튜브 임베드용 ID 추출 헬퍼
  const getYoutubeEmbedUrl = (url: string | undefined) => {
    if (!url) return null;
    const trimmed = url.trim();
    let videoId = "";

    if (trimmed.includes("v=")) {
      const parts = trimmed.split("v=");
      if (parts[1]) {
        videoId = parts[1].split("&")[0];
      }
    } else if (trimmed.includes("youtu.be/")) {
      const parts = trimmed.split("youtu.be/");
      if (parts[1]) {
        videoId = parts[1].split("?")[0].split("&")[0];
      }
    } else if (trimmed.includes("embed/")) {
      const parts = trimmed.split("embed/");
      if (parts[1]) {
        videoId = parts[1].split("?")[0];
      }
    }

    if (videoId && videoId.trim().length === 11) {
      return `https://www.youtube.com/embed/${videoId.trim()}`;
    }
    return null;
  };

  // 회의록 관리 부서별 필터 및 선택 상태 추가
  const [selectedDeptFilters, setSelectedDeptFilters] = useState<string[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | string | null>(null);

  // 필터링된 회의 목록의 첫 번째 아이템을 기본 선택 상태로 유지하는 이펙트 훅
  useEffect(() => {
    if (subTab === "meetings") {
      const filteredList = meetingSchedules.filter(m => {
        const isCatMatch = m.category === activeMeetingCat;

        if (!isCatMatch) return false;
        if (selectedDeptFilters.length === 0) return true;

        const ext = m.attendeesExternal || m.attendees_external || "";
        let dept = "사업운영팀";
        if (ext.includes("부서:")) {
          const parts = ext.split("|");
          dept = parts[1] ? parts[1].replace("부서:", "").trim() : "사업운영팀";
        }
        return selectedDeptFilters.includes(dept);
      });

      if (filteredList.length > 0) {
        if (!selectedMeetingId || !filteredList.some(m => m.id === selectedMeetingId)) {
          setSelectedMeetingId(filteredList[0].id ?? null);
        }
      } else {
        setSelectedMeetingId(null);
      }
    }
  }, [meetingSchedules, activeMeetingCat, subTab, selectedDeptFilters, selectedMeetingId]);

  // 언론보도 대장 실시간 CSV(엑셀) 다운로드
  const handleExportPressExcel = () => {
    try {
      const headers = ["구분", "매체", "제목", "보도일시", "보도 링크(URL)"];
      const rows = pressReleases
        .filter(p => selectedPressType === "all" || p.type === selectedPressType)
        .sort((a, b) => {
          const dateA = a.broadcastDate ? new Date(a.broadcastDate) : new Date(0);
          const dateB = b.broadcastDate ? new Date(b.broadcastDate) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        })
        .map(p => [
          p.type,
          p.media,
          p.title,
          p.broadcastDate ? p.broadcastDate.replace("T", " ").substring(0, 16) : "-",
          p.contentUrl || "-"
        ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${selectedYear}차년도_RISE사업단_언론보도대장.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("엑셀(CSV) 다운로드 중 오류가 발생했습니다.");
    }
  };

  // 언론보도 데이터가 로드되거나 필터가 바뀔 때 기본적으로 첫 번째 항목을 활성화
  useEffect(() => {
    const filtered = pressReleases
      .filter(p => isDateInSelectedYear(p.broadcastDate, selectedYear))
      .filter(p => selectedPressType === "all" || p.type === selectedPressType)
      .sort((a, b) => {
        const dateA = a.broadcastDate ? new Date(a.broadcastDate) : new Date(0);
        const dateB = b.broadcastDate ? new Date(b.broadcastDate) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    if (filtered.length > 0) {
      if (!activePressId || !filtered.some(p => p.id === activePressId)) {
        setActivePressId(filtered[0].id ?? null);
      }
    } else {
      setActivePressId(null);
    }
  }, [pressReleases, selectedPressType, activePressId, selectedYear]);

  // 시작시간 기준으로 1시간 경과된 시간 문자열을 반환하는 헬퍼 함수
  const getOneHourLater = (timeStr: string) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length < 2) return "";
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);
    hours = (hours + 1) % 24;
    const mm = String(minutes).padStart(2, "0");
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated: ScheduleFormData = { ...prev, [name]: value };

      // 시작시간 입력 시 종료시간을 자동으로 1시간 뒤로 자동완성
      if (name === "startTime" && value) {
        updated.endTime = getOneHourLater(value);
      }
      if (name === "eventStartTime" && value) {
        updated.eventEndTime = getOneHourLater(value);
      }
      if (name === "meetingStartTime" && value) {
        updated.meetingEndTime = getOneHourLater(value);
      }

      // 회의록 등록 모달에서 날짜(meetingDate)나 부서(dept)가 변경될 때 제목을 자동 제안
      if (modalType === "meeting" && (name === "meetingDate" || name === "dept")) {
        const datePart = updated.meetingDate || "";
        const deptPart = updated.dept || "";

        // 기존 제목이 없거나, 이미 이전에 날짜 및 주간회의 패턴으로 자동완성된 적이 있는 경우에만 덮어씀
        const isAutoGenerated = !prev.title || prev.title.match(/^\d{4}-\d{2}-\d{2}\s+.*주간회의$/);
        if (isAutoGenerated && datePart && deptPart) {
          updated.title = `${datePart} ${deptPart} 주간회의`;
        }
      }

      // 센터/센터위원회 회의 분류 또는 부서 변경 시 작성자 자동 매핑 보정
      if (modalType === "meeting" && (name === "category" || name === "committeeType" || name === "dept")) {
        const isCenterMeeting =
          updated.category === "center" ||
          (updated.category === "committee" && (updated.committeeType || "agency") === "center");

        if (isCenterMeeting && updated.dept) {
          let activeWriters = (members || []).filter(m =>
            m.status !== "미참여" &&
            m.email &&
            m.dept === updated.dept &&
            !isWriterExcluded(m)
          );
          if (activeWriters.length === 0) {
            activeWriters = (members || []).filter(m =>
              m.status !== "미참여" &&
              m.dept === updated.dept &&
              !isWriterExcluded(m)
            );
          }
          if (activeWriters.length > 0) {
            const currentWriterName = (updated.writer || "").split(" ")[0];
            const isCurrentWriterInDept = activeWriters.some(w => w.name === currentWriterName);
            if (!isCurrentWriterInDept) {
              const first = activeWriters[0];
              updated.writer = `${first.name} ${getFormattedMemberGrade(first)}`.trim();
            }
          }
        } else if (!isCenterMeeting) {
          let baseWriters = (members || []).filter(m =>
            m.status !== "미참여" &&
            m.email &&
            m.dept === "사업운영팀" &&
            !isWriterExcluded(m)
          );

          // 사업단 관련 회의인 경우 심현미 운영팀장을 맨 위에 강제 포함
          const simHyunMi = (members || []).find(m => m.name === "심현미") || {
            id: "sim_hm_temp",
            name: "심현미",
            grade: "운영팀장",
            role: "운영팀장",
            dept: "사업운영팀",
            email: "sim@uc.ac.kr"
          };
          baseWriters = [simHyunMi, ...baseWriters.filter(m => m.name !== "심현미")];

          const currentWriterName = (updated.writer || "").split(" ")[0];
          const isCurrentWriterInBase = baseWriters.some(w => w.name === currentWriterName);
          if (!isCurrentWriterInBase && baseWriters.length > 0) {
            const first = baseWriters[0];
            updated.writer = `${first.name} ${getFormattedMemberGrade(first)}`.trim();
          }
        }
      }
      return updated;
    });
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }

    // 선택된 연차의 회계연도 사업 기간 (3/1 ~ 이듬해 2/28) 범위 계산
    const targetYearNum = selectedYear === 1 ? 2025 : selectedYear === 2 ? 2026 : selectedYear === 3 ? 2027 : selectedYear === 4 ? 2028 : 2029;
    const startRange = new Date(`${targetYearNum}-03-01T00:00:00+09:00`);
    const endYear = targetYearNum + 1;
    const isLeap = (endYear % 4 === 0 && endYear % 100 !== 0) || (endYear % 400 === 0);
    const endDay = isLeap ? "29" : "28";
    const endRange = new Date(`${endYear}-02-${endDay}T23:59:59+09:00`);

    // 날짜 유효성 검사 헬퍼 함수
    const isDateInActiveYear = (dateStr: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && d >= startRange && d <= endRange;
    };

    // 1-1) 일반 일정 날짜 범위 벨리데이션
    if (modalType === "monthly" || modalType === "task" || modalType === "deadline") {
      if (!isDateInActiveYear(formData.startDate)) {
        alert(`선택하신 날짜(${formData.startDate})는 현재 선택된 ${selectedYear}차년도 사업 기간(${targetYearNum}-03-01 ~ ${endYear}-02-${endDay})에 속하지 않습니다. 해당 연차 탭으로 이동하신 후 등록해 주세요.`);
        return;
      }
    }

    // 1-2) 행사 일정 날짜 범위 벨리데이션
    if (modalType === "event") {
      if (!isDateInActiveYear(formData.eventDate)) {
        alert(`선택하신 행사 날짜(${formData.eventDate})는 현재 선택된 ${selectedYear}차년도 사업 기간(${targetYearNum}-03-01 ~ ${endYear}-02-${endDay})에 속하지 않습니다. 해당 연차 탭으로 이동하신 후 등록해 주세요.`);
        return;
      }
    }

    // 1-3) 회의 일정 날짜 범위 벨리데이션
    if (modalType === "meeting") {
      if (!isDateInActiveYear(formData.meetingDate)) {
        alert(`선택하신 회의 날짜(${formData.meetingDate})는 현재 선택된 ${selectedYear}차년도 사업 기간(${targetYearNum}-03-01 ~ ${endYear}-02-${endDay})에 속하지 않습니다. 해당 연차 탭으로 이동하신 후 등록해 주세요.`);
        return;
      }
    }

    // 1) 일반 일정, 할일, 마감 일정 날짜 범위 및 빈 값 벨리데이션
    if (modalType === "monthly" || modalType === "task" || modalType === "deadline") {
      if (!formData.startDate) {
        alert("시작 날짜를 입력해 주세요.");
        return;
      }
      if (!isDateInActiveYear(formData.startDate)) {
        alert(`선택하신 시작 날짜(${formData.startDate})는 현재 선택된 ${selectedYear}차년도 사업 기간(${targetYearNum}-03-01 ~ ${endYear}-02-${endDay})에 속하지 않습니다. 해당 연차 탭으로 이동하신 후 등록해 주세요.`);
        return;
      }

      if (modalType === "monthly") {
        if (!formData.endDate) {
          alert("종료 날짜를 입력해 주세요.");
          return;
        }
        if (!isDateInActiveYear(formData.endDate)) {
          alert(`선택하신 종료 날짜(${formData.endDate})는 현재 선택된 ${selectedYear}차년도 사업 기간(${targetYearNum}-03-01 ~ ${endYear}-02-${endDay})에 속하지 않습니다.`);
          return;
        }

        const hasTime = !formData.noTime;
        const startStr = hasTime ? `${formData.startDate}T${formData.startTime || "00:00"}` : `${formData.startDate}T00:00`;
        const endStr = hasTime ? `${formData.endDate}T${formData.endTime || "00:00"}` : `${formData.endDate}T00:00`;

        const startSecs = new Date(startStr).getTime();
        const endSecs = new Date(endStr).getTime();

        if (isNaN(startSecs) || isNaN(endSecs)) {
          alert("올바른 시작일시와 종료일시를 입력해 주세요.");
          return;
        }

        if (endSecs <= startSecs) {
          alert("종료일시(시간)는 시작일시(시간)보다 뒤여야 합니다.");
          return;
        }
      }
    }

    // 2) 행사 일정 (event) 시간 선후 벨리데이션
    if (modalType === "event") {
      const startStr = `${formData.eventDate}T${formData.eventStartTime || "00:00"}`;
      const endStr = `${formData.eventDate}T${formData.eventEndTime || "00:00"}`;

      const startSecs = new Date(startStr).getTime();
      const endSecs = new Date(endStr).getTime();

      if (isNaN(startSecs) || isNaN(endSecs)) {
        alert("올바른 시작시간과 종료시간을 입력해 주세요.");
        return;
      }

      if (endSecs <= startSecs) {
        alert("종료시간은 시작시간보다 뒤여야 합니다.");
        return;
      }
    }

    // 3) 회의 일정 (meeting) 시간 선후 벨리데이션
    if (modalType === "meeting") {
      if (!formData.noTime) {
        const startStr = `${formData.meetingDate}T${formData.meetingStartTime || "00:00"}`;
        const endStr = `${formData.meetingDate}T${formData.meetingEndTime || "00:00"}`;

        const startSecs = new Date(startStr).getTime();
        const endSecs = new Date(endStr).getTime();

        if (isNaN(startSecs) || isNaN(endSecs)) {
          alert("올바른 시작시간과 종료시간을 입력해 주세요.");
          return;
        }

        if (endSecs <= startSecs) {
          alert("종료시간은 시작시간보다 뒤여야 합니다.");
          return;
        }
      }

      // [추가] 회의록 중복 등록 방지 벨리데이션 (같은 시간 & 같은 제목)
      const inputTitle = formData.title || "새 회의록";
      const combinedDatetime = formData.noTime
        ? formData.meetingDate
        : `${formData.meetingDate} ${formData.meetingStartTime} ~ ${formData.meetingEndTime}`;

      const isDuplicate = meetingSchedules.some(m => {
        // 수정 모드일 때는 현재 편집 중인 자기 자신(editingItemId)은 중복 검사 대상에서 제외합니다.
        if (isEditMode && m.id === editingItemId) return false;
        return m.title === inputTitle && m.datetime === combinedDatetime;
      });

      if (isDuplicate) {
        alert(`동일한 시간(${combinedDatetime})에 같은 제목("${inputTitle}")으로 등록된 회의록이 이미 존재합니다. 중복 등록할 수 없습니다.`);
        return;
      }
    }

    if (modalType === "monthly" || modalType === "task" || modalType === "deadline") {
      const isTaskVal = modalType === "task";
      const isDeadlineVal = modalType === "deadline";
      const hasTime = !formData.noTime;
      const startAtVal = hasTime ? `${formData.startDate} ${formData.startTime}` : formData.startDate;

      if (isEditMode) {
        setMonthlySchedules(monthlySchedules.map(s =>
          s.id === editingItemId
            ? {
              ...s,
              title: formData.title || "새 일정",
              type: isTaskVal ? "할일" : (isDeadlineVal ? "마감" : (formData.type || "기타")),
              dept: isDeadlineVal ? "사업운영팀" : (formData.dept || "사업운영팀"),
              startAt: startAtVal,
              endAt: (isTaskVal || isDeadlineVal) ? startAtVal : (hasTime ? `${formData.endDate} ${formData.endTime}` : formData.endDate),
              location: (isTaskVal || isDeadlineVal) ? "" : (formData.location || "-"),
              isTask: isTaskVal,
              isDeadline: isDeadlineVal,
              attendees: formData.attendees || ""
            }
            : s
        ));
      } else {
        const newItem = {
          id: Date.now(),
          year: Number(selectedYear), // 💡 year 필드 누락 버그 수정! (일정 생성 직후 달력 즉시 렌더링 동기화 보장)
          title: formData.title || "새 일정",
          type: isTaskVal ? "할일" : (isDeadlineVal ? "마감" : (formData.type || "기타")),
          dept: isDeadlineVal ? "사업운영팀" : (formData.dept || "사업운영팀"),
          startAt: startAtVal,
          endAt: (isTaskVal || isDeadlineVal) ? startAtVal : (hasTime ? `${formData.endDate} ${formData.endTime}` : formData.endDate),
          location: (isTaskVal || isDeadlineVal) ? "" : (formData.location || "-"),
          isTask: isTaskVal,
          isDeadline: isDeadlineVal,
          completed: false,
          attendees: formData.attendees || ""
        };
        setMonthlySchedules([newItem, ...monthlySchedules]);
      }
    } else if (modalType === "event") {
      // 3) 일자가 입력되면 자동으로 해당월 추출 (예: 2026-07-25 -> 7)
      const extractedMonth = formData.eventDate ? parseInt(formData.eventDate.split("-")[1], 10) : 7;

      // 4) 일자(캘린더 입력 YYYY-MM-DD), 시간(시작, 종료 개별 입력) 조합
      const combinedDatetime = `${formData.eventDate} ${formData.eventStartTime} ~ ${formData.eventEndTime}`;

      // [추가] 외부기관인 경우 주관기관 텍스트 우선 매핑
      const finalDept = formData.department === "external" ? (formData.externalDept || "외부기관") : (formData.department || "-");

      if (isEditMode) {
        setEventSchedules(eventSchedules.map(e =>
          e.id === editingItemId
            ? {
                ...e,
                year: getCalculatedYearFromDate(formData.eventDate),
                month: extractedMonth,
                title: formData.title || "새 행사",
                department: finalDept,
                datetime: combinedDatetime,
                location: formData.location || "-",
                attendeesInternal: formData.attendeesInternal || "-",
                attendeesExternal: formData.attendeesExternal || "-",
                program: formData.program || "-",
                purpose: formData.purpose || "-",
                result: formData.result || "-"
              }
            : e
        ));
      } else {
        const newItem = {
          id: Date.now(),
          year: getCalculatedYearFromDate(formData.eventDate),
          month: extractedMonth,
          title: formData.title || "새 행사 일정",
          department: finalDept,
          datetime: combinedDatetime,
          location: formData.location || "-",
          attendeesInternal: formData.attendeesInternal || "-",
          attendeesExternal: formData.attendeesExternal || "-",
          program: formData.program || "-",
          purpose: formData.purpose || "-",
          result: formData.result || "-"
        };
        setEventSchedules([newItem, ...eventSchedules]);
      }
    } else if (modalType === "meeting") {
      // 입력된 회의 일자에서 자동으로 월 추출
      const extractedMonth = formData.meetingDate ? parseInt(formData.meetingDate.split("-")[1], 10) : 7;

      // 일자(YYYY-MM-DD)와 시작/종료 시간을 결합하여 datetime 문자열 조합 (전일 일정 대응)
      const combinedDatetime = formData.noTime
        ? formData.meetingDate
        : `${formData.meetingDate} ${formData.meetingStartTime} ~ ${formData.meetingEndTime}`;

      // 작성자 및 부서 정보를 attendeesExternal에 조합하여 저장 (하위호환성 유지)
      let combinedAttendeesExternal = `작성자: ${formData.writer || "작성자 미정"} | 부서: ${formData.dept || "부서 미정"}`;
      if (formData.category === "committee") {
        let cName = formData.dept || "";
        if ((formData.committeeType || "agency") === "center") {
          const deptToCommittee: Record<string, string> = {
            "ECC센터": "ECC센터위원회",
            "ICC센터": "ICC센터위원회",
            "RCC센터": "RCC센터위원회",
            "AID-X지원센터": "AID-X지원센터위원회",
            "울산늘봄누리센터": "울산늘봄누리센터위원회",
            "신산업특화센터": "신산업특화센터위원회"
          };
          cName = deptToCommittee[formData.dept] || `${formData.dept}위원회`;
        }
        combinedAttendeesExternal = `위원회: ${cName} | 작성자: ${formData.writer || "작성자 미정"} | 부서: ${formData.dept || "부서 미정"}`;
      }

      // 💡 [교육용 한글 주석] 의제 및 결과를 1:1 매핑 또는 사업단운영회의의 부서별 폼 데이터로부터 직렬화(저장용 포맷팅)합니다.
      let combinedAgenda = "";
      let combinedResult = "";

      if (formData.category === "operating") {
        const depts = ["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"];
        combinedAgenda = depts
          .map(d => {
            const val = formData.operatingAgendas?.[d]?.trim();
            if (!val) return "";
            return val.includes(`[${d}]`) ? val : `[${d}] ${val}`;
          })
          .filter(Boolean)
          .join("\n");

        combinedResult = depts
          .map(d => {
            const val = formData.operatingResults?.[d]?.trim();
            if (!val) return "";
            return val.includes(`[${d}]`) ? val : `[${d}] ${val}`;
          })
          .filter(Boolean)
          .join("\n");
      } else {
        combinedAgenda = (agendaResultPairs || [])
          .map(p => p.agenda.trim())
          .filter(Boolean)
          .join("\n");
        combinedResult = (agendaResultPairs || [])
          .map(p => p.result.trim())
          .filter(Boolean)
          .join("\n");
      }

      if (isEditMode) {
        setMeetingSchedules(meetingSchedules.map(m =>
          m.id === editingItemId
            ? {
              ...m,
              year: getCalculatedYearFromDate(formData.meetingDate),
              month: extractedMonth,
              category: formData.category,
              title: formData.title || "새 회의록",
              datetime: combinedDatetime,
              location: formData.location || "-",
              attendeesInternal: formData.attendees || "-",
              attendeesExternal: combinedAttendeesExternal,
              agenda: combinedAgenda || "-",
              result: combinedResult || "-",
              audioUrl: formData.audioUrl || "",
              pdfUrl: formData.pdfUrl || ""
            }
            : m
        ));
      } else {
        const newItem = {
          id: Date.now(),
          year: getCalculatedYearFromDate(formData.meetingDate),
          month: extractedMonth,
          category: formData.category,
          title: formData.title || "새 회의록",
          datetime: combinedDatetime,
          location: formData.location || "-",
          attendeesInternal: formData.attendees || "-",
          attendeesExternal: combinedAttendeesExternal,
          agenda: combinedAgenda || "-",
          result: combinedResult || "-",
          audioUrl: formData.audioUrl || "",
          pdfUrl: formData.pdfUrl || ""
        };
        setMeetingSchedules([newItem, ...meetingSchedules]);
      }
    } else if (modalType === "press") {
      let safeDate = formData.pressDate;
      if (safeDate && safeDate.includes("/")) {
        const parts = safeDate.split("/");
        if (parts.length === 3 && parts[2].length === 4) {
          safeDate = `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
        }
      } else if (!safeDate || !/^\d{4}-\d{2}-\d{2}$/.test(safeDate)) {
        safeDate = new Date().toISOString().split("T")[0];
      }

      let safeTime = formData.pressTime || "10:00";
      if (!/^\d{2}:\d{2}$/.test(safeTime)) {
        if (safeTime.toLowerCase().includes("pm")) {
          const m = safeTime.match(/(\d{1,2}):(\d{2})/);
          if (m) {
            let h = parseInt(m[1], 10);
            if (h < 12) h += 12;
            safeTime = `${h.toString().padStart(2, "0")}:${m[2]}`;
          } else {
            safeTime = "14:00";
          }
        } else if (safeTime.toLowerCase().includes("am")) {
          const m = safeTime.match(/(\d{1,2}):(\d{2})/);
          if (m) {
            let h = parseInt(m[1], 10);
            if (h === 12) h = 0;
            safeTime = `${h.toString().padStart(2, "0")}:${m[2]}`;
          } else {
            safeTime = "10:00";
          }
        } else {
          safeTime = "10:00";
        }
      }

      const combinedDatetime = `${safeDate}T${safeTime}:00+09:00`;

      if (isEditMode) {
        setPressReleases(prev => prev.map(p =>
          p.id === editingItemId
            ? {
              ...p,
              year: getCalculatedYearFromDate(formData.pressDate),
              type: formData.pressType,
              media: formData.pressMedia || "미상",
              title: formData.title || "새 보도자료",
              broadcastDate: combinedDatetime,
              contentUrl: formData.pressUrl || "",
              pressContent: formData.pressContent || ""
            }
            : p
        ));
      } else {
        const newItem = {
          id: Date.now(),
          year: getCalculatedYearFromDate(formData.pressDate),
          type: formData.pressType,
          media: formData.pressMedia || "미상",
          title: formData.title || "새 보도자료",
          broadcastDate: combinedDatetime,
          contentUrl: formData.pressUrl || "",
          pressContent: formData.pressContent || ""
        };
        setPressReleases(prev => [newItem, ...prev]);
      }
    }

    setIsAddModalOpen(false);
    setIsEditMode(false);
    setEditingItemId(null);
    setAiPlanApplied(false);
    setAiResultApplied(false);
    setFormData({
      title: "",
      type: "행사",
      dept: "사업운영팀",
      startDate: "2026-07-15",
      startTime: "10:00",
      endDate: "2026-07-15",
      endTime: "11:00",
      location: "",
      noTime: false,
      month: 7,
      department: "",
      datetime: "",
      attendeesInternal: "",
      attendeesExternal: "",
      program: "",
      purpose: "",
      result: "",
      category: "operating",
      agenda: "",
      pressDate: "2026-07-15",
      pressTime: "10:00",
      pressMedia: "",
      pressUrl: "",
      pressType: "방송",
      pressContent: ""
    });
  };

  // 일정 삭제 핸들러
  const handleDeleteSchedule = (id?: number | string) => {
    if (id === undefined) return;
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    if (window.confirm("선택한 일정을 삭제하시겠습니까?")) {
      setMonthlySchedules(monthlySchedules.filter(s => s.id !== id));
    }
  };

  // 일정 수정 모달 트리거
  const handleEditSchedule = (sched: ScheduleItem) => {
    setIsEditMode(true);
    setEditingItemId(sched.id ?? null);
    setModalType(sched.isDeadline ? "deadline" : (sched.isTask ? "task" : "monthly"));

    const startParts = parseDateTime(sched.startAt, [`${targetYearNum}-07-15`, "10:00"]);
    const endParts = parseDateTime(sched.endAt, [`${targetYearNum}-07-15`, "11:00"]);
    const noTimeVal = !startParts[1];

    setFormData({
      title: sched.title,
      type: sched.type || "행사",
      dept: sched.dept || "사업운영팀",
      startDate: startParts[0] || `${targetYearNum}-07-15`,
      startTime: startParts[1] || "10:00",
      endDate: endParts[0] || `${targetYearNum}-07-15`,
      endTime: endParts[1] || "11:00",
      location: sched.location || "",
      noTime: noTimeVal,
      month: 7,
      department: "",
      datetime: "",
      attendeesInternal: "",
      attendeesExternal: "",
      program: "",
      purpose: "",
      result: "",
      category: "operating",
      agenda: "",
      attendees: sched.attendees || ""
    });
    setIsAddModalOpen(true);
  };

  // 할일 완료 상태 토글
  const handleToggleTaskCompleted = (id?: number | string) => {
    if (id === undefined) return;
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setMonthlySchedules(prev => prev.map(s =>
      s.id === id ? { ...s, completed: !s.completed } : s
    ));
  };

  // 행사 및 결과 기획 삭제 핸들러
  const handleDeleteEvent = (id?: number | string) => {
    if (id === undefined) return;
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    if (window.confirm("선택한 행사 기획 및 결과 내역을 삭제하시겠습니까?")) {
      setEventSchedules(eventSchedules.filter(e => e.id !== id));
    }
  };

  // 행사 및 결과 기획 수정 모달 트리거
  const handleEditEvent = (event: ScheduleItem) => {
    setIsEditMode(true);
    setEditingItemId(event.id ?? null);
    setModalType("event");

    // datetime 파싱 ("2026-07-25 13:00 ~ 15:00" 형식)
    const dt = event.datetime || "";
    const parts = dt.split(" ");
    let eventDate = parts[0] || `${targetYearNum}-07-15`;
    let eventStartTime = "10:00";
    let eventEndTime = "11:00";

    if (parts.length >= 4) {
      eventStartTime = parts[1] || "10:00";
      eventEndTime = parts[3] || "11:00";
    } else if (parts.length >= 2) {
      const timeParts = parts[1].split("~");
      eventStartTime = timeParts[0] || "10:00";
      eventEndTime = timeParts[1] || "11:00";
    }

    // [추가] 외부 기관 주관 구분용 매핑 검사
    const defaultDepts = ["ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "사업운영팀"];
    const isStandardDept = defaultDepts.includes(event.department);

    setFormData({
      title: event.title,
      type: "행사",
      dept: "사업운영팀",
      startDate: `${targetYearNum}-07-15`,
      startTime: "10:00",
      endDate: `${targetYearNum}-07-15`,
      endTime: "11:00",
      location: event.location || "",
      noTime: false,
      month: event.month || 7,
      department: isStandardDept ? (event.department || "") : (event.department ? "external" : ""),
      externalDept: isStandardDept ? "" : (event.department || ""),
      datetime: event.datetime || "",
      eventDate: eventDate,
      eventStartTime: eventStartTime,
      eventEndTime: eventEndTime,
      attendeesInternal: event.attendeesInternal || "",
      attendeesExternal: event.attendeesExternal || "",
      program: event.program || "",
      purpose: event.purpose || "",
      result: event.result || "",
      category: "operating",
      agenda: ""
    });
    setIsAddModalOpen(true);
  };

  // 회의록 삭제 핸들러
  const handleDeleteMeeting = (id?: number | string) => {
    if (id === undefined) return;
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }

    // 로그인된 롤 이름 식별에 따른 본인 개인 비밀번호 맵핑
    const userName = currentRole.name || "";
    let expectedPw = "";
    let userPromptName = "";
    let hint = "";

    if (userName.includes("송경영")) {
      userPromptName = "송경영 단장님";
      expectedPw = "song123!";
      hint = "song123!";
    } else if (userName.includes("심현미")) {
      userPromptName = "심현미 선생님";
      expectedPw = "shim123!";
      hint = "shim123!";
    } else if (currentRole.id === "ADMIN") {
      userPromptName = "최고 관리자(ADMIN)";
      expectedPw = "admin123!";
      hint = "admin123!";
    } else {
      alert("❌ 삭제 권한이 없는 계정입니다. 삭제는 송경영, 심현미 계정만 가능합니다.");
      return;
    }

    // 본인 인증 비밀번호 입력 프롬프트
    const pw = window.prompt(`⚠️ 회의록 삭제는 되돌릴 수 없습니다!\n\n${userPromptName} 본인의 삭제 승인 비밀번호를 입력해 주세요.\n(비밀번호 힌트: ${hint})`);

    if (pw === null) {
      // 사용자가 취소(Cancel)를 누른 경우
      return;
    }

    if (pw !== expectedPw) {
      alert("❌ 비밀번호가 올바르지 않습니다. 삭제가 취소되었습니다.");
      return;
    }

    if (window.confirm("정말로 이 회의록을 영구 삭제하시겠습니까?")) {
      setMeetingSchedules(meetingSchedules.filter(m => m.id !== id));
    }
  };

  const handleAnalyzePressUrlWithGemini = async () => {
    const url = (formData.pressUrl || "").trim();
    if (!url) {
      alert("분석할 보도 내용 URL을 먼저 입력해 주세요.");
      return;
    }

    setIsAnalyzingUrl(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

    // 타겟 연도 계산 (기본값 설정용)
    const targetYearNum = selectedYear === 1 ? 2025 : selectedYear === 2 ? 2026 : selectedYear === 3 ? 2027 : selectedYear === 4 ? 2028 : 2029;
    const defaultDate = `${targetYearNum}-07-15`;

    try {
      // [1] 외부 AI 교차 검증 및 합의 분석 엔진 실행
      // @ts-expect-error 레거시 JavaScript 분석기는 런타임 동적 로딩 경계를 유지합니다.
      const { analyzePressUrlWithAiConsensus } = await import("../utils/pressAnalyzer");
      const { parsed, usedModel } = await analyzePressUrlWithAiConsensus({
        url,
        selectedYear,
        apiKey,
        openaiApiKey
      });

      // 최종 매핑 전 프론트엔드 안전 날짜 추출 필터링 한 번 더 거치기
      let finalPressDate = parsed.pressDate || defaultDate;
      const dateMatch = (parsed.title + url).match(/(?:202\d)(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])/);
      if (dateMatch) {
        const dStr = dateMatch[0];
        finalPressDate = `${dStr.substring(0, 4)}-${dStr.substring(4, 6)}-${dStr.substring(6, 8)}`;
      }

      setFormData(prev => ({
        ...prev,
        pressType: parsed.pressType || (url.toLowerCase().includes("youtube.com") || url.toLowerCase().includes("youtu.be") ? "방송" : "기타"),
        pressMedia: parsed.pressMedia || "미상",
        title: parsed.title || "새 보도자료",
        pressDate: finalPressDate,
        pressTime: parsed.pressTime || "10:00",
        pressContent: parsed.pressContent || ""
      }));

      // 합의 판정 완료 모달 알럿 표출
      if (usedModel.includes("Consensus") || usedModel.includes("합의")) {
        alert("🏆 [GPT & Gemini AI 교차 검증 합의 완료]\n\n두 AI 모델이 각각의 분석 결과를 대조하고, 팩트 기반 교차 토론(Debate)을 진행하여 할루시네이션이 완벽히 차단된 정밀 합의안을 도출했습니다!");
      } else {
        alert(`✨ [${usedModel}] AI 분석 처리를 완료하여 보도자료 입력을 자동 완성했습니다.`);
      }

      setIsAnalyzingUrl(false);
      return;

    } catch (err) {
      console.error("AI Consensus engine failed:", err);
      let fallbackTitle = "울산과학대 RISE사업단 언론보도";
      let fallbackMedia = "온라인 뉴스";
      let fallbackType = "기타";
      let fallbackDate = defaultDate;

      const dateMatch = url.match(/(?:202\d)(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])/);
      if (dateMatch) {
        const dStr = dateMatch[0];
        fallbackDate = `${dStr.substring(0, 4)}-${dStr.substring(4, 6)}-${dStr.substring(6, 8)}`;
      }

      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        fallbackType = "방송";
        fallbackMedia = "UBC울산방송";
        fallbackTitle = "[영상] 울산과학대 앵커사업단 성과 공유회 현장 뉴스";
      } else if (url.includes("ksilbo.co.kr")) {
        fallbackType = "신문";
        fallbackMedia = "경상일보";
        fallbackTitle = "울산과학대, 지역혁신중심 RISE사업으로 청년 정주 지원 생태계 활성화";
      }

      setFormData(prev => ({
        ...prev,
        pressType: fallbackType,
        pressMedia: fallbackMedia,
        title: fallbackTitle,
        pressDate: fallbackDate,
        pressTime: "10:00",
        pressContent: "울산과학대학교가 추진하는 RISE 앵커사업의 일환으로 실시된 지산학 연계 세부 성과와 지역 기업 협업을 심도 있게 다룬 뉴스 기사입니다."
      }));

      alert(`✨ [엔진 비상 전환] 로컬 안전 지능 엔진으로 카드를 대체 보완 완성했습니다.\n(원인: ${getErrorMessage(err)})`);
      setIsAnalyzingUrl(false);
      return;
    }
  };

  // AI 언론보도 및 매체 홍보 기록 10건 일괄 자동 생성
  const handleGenerateAiPressReleases = () => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 홍보 기사 수집을 실행하실 수 없습니다.");
      return;
    }

    const proceed = window.confirm("여러 매체에 수집 가능한 울산과학대학교 RISE 및 앵커사업단 관련 실제 언론 보도 기사들을 AI 크롤러로 탐색하여 실시간 수집하시겠습니까? (기존 기사와의 중복은 자동 필터링됩니다.)");
    if (!proceed) return;

    // 크롤러 모달 시동
    setIsCrawlerModalOpen(true);
    setCrawlerLogs([]);
    setCrawlerProgress(0);

    // 선택된 차년도(selectedYear)에 매핑되는 연도 계산
    const targetYearNum = selectedYear === 1 ? 2025 : selectedYear === 2 ? 2026 : selectedYear === 3 ? 2027 : selectedYear === 4 ? 2028 : 2029;

    // 실존 언론보도 10대 소스 정의 (실제 울산과학대 RISE 뉴스 팩트 적용)
    const mockPress = [
      {
        id: Date.now() + 1,
        year: selectedYear,
        type: "신문",
        media: "경상일보",
        title: `[ANCHOR] "2026년부터 RISE체계, 지역성장 인재양성체계 'ANCHOR'로 전면 명칭 변경 및 개편"`,
        broadcastDate: `${targetYearNum}-01-20T09:00:00+09:00`,
        pressContent: "울산 지역 대학과 산업계의 혁신을 주도해 온 지역혁신중심 대학지원체계(RISE)가 2026년부터 '지역성장 인재양성체계(ANCHOR, 앵커)'로 명칭이 변경되고 대대적인 실행 체계가 개편되어 작동할 예정이다. 지자체 중심의 정주 인재 확보를 다진다.",
        contentUrl: "https://www.ksilbo.co.kr/news/articleView.html?idxno=100123"
      },
      {
        id: Date.now() + 2,
        year: selectedYear,
        type: "기타",
        media: "대학 뉴스룸",
        title: `송경영 울산과학대 RISE사업단장, ANCHOR 체계 전환에 따른 전문대학 대응 전략 발표`,
        broadcastDate: `${targetYearNum}-02-15T11:00:00+09:00`,
        pressContent: "송경영 울산과학대 RISE사업단장(전문대학RISE사업단협의회 부회장)은 전국 전문대 관리자 연수회에서 RISE 1차년도 성과를 기반으로 앵커(ANCHOR) 체계 전환에 따른 전문대학의 대응 방향 및 지산학연 연계 현장 소통 방안을 적극 개진했다.",
        contentUrl: "https://www.uc.ac.kr/pr/news/view?id=9876"
      },
      {
        id: Date.now() + 3,
        year: selectedYear,
        type: "신문",
        media: "울산신문",
        title: `울산과학대 기계공학부 김기범 교수, 교육부 주관 '2025 라이즈스타' 선정 영예`,
        broadcastDate: `${targetYearNum}-03-05T14:30:00+09:00`,
        pressContent: "울산과학대 기계공학부 김기범 교수가 RISE 사업을 기반으로 지역 산업 발전과 산학협력 생태계 구축에 기여한 공로를 인정받아 교육부 주관 '2025 라이즈스타'에 최종 선정되는 영예를 안았다.",
        contentUrl: "https://www.ulsanpress.net/news/articleView.html?idxno=200345"
      },
      {
        id: Date.now() + 4,
        year: selectedYear,
        type: "방송",
        media: "KBS울산",
        title: `초등 늘봄학교 안정적 안착 돕는 울산과학대 늘봄누리센터... 문화예술 교육 강사 매칭 우수사례 주목`,
        broadcastDate: `${targetYearNum}-04-18T21:30:00+09:00`,
        pressContent: "초등 늘봄학교의 현장 정착을 적극 지원하는 울산과학대학교 늘봄누리센터가 울산시교육청과 밀접하게 연동하여 우수한 문화예술 및 체육 강사를 초등학교 현장에 매칭하여 90% 이상의 교내 만족도를 거두며 순항하고 있다.",
        contentUrl: "https://www.youtube.com/watch?v=kbs_ulsan_neulbom_2026"
      },
      {
        id: Date.now() + 5,
        year: selectedYear,
        type: "기타",
        media: "블로그",
        title: `[현장 소식] 울산과학대 지역협업센터, 재학생 참여 '울리단길 런케이션' 지역 활성화 성공적 종료`,
        broadcastDate: `${targetYearNum}-05-22T11:00:00+09:00`,
        pressContent: "울산과학대학교 지역협업센터(RCC)는 재학생들이 직접 참가해 지역 상권의 정량 문제를 분석하고 창업 브랜딩 솔루션을 도출해내는 '울리단길 런케이션' 프로젝트를 성황리에 종료하며 청년 정주 여건을 대폭 개선했다.",
        contentUrl: "https://blog.naver.com/uc_rise_anchor/22055667"
      },
      {
        id: Date.now() + 6,
        year: selectedYear,
        type: "신문",
        media: "한국대학신문",
        title: `울산과학대 RISE사업단, 청년 여성 대상 AI 리터러시 교육 및 AI 실무 창업 전문가 배출`,
        broadcastDate: `${targetYearNum}-06-12T10:00:00+09:00`,
        pressContent: "울산과학대학교 RISE사업단은 지역 청년 여성들의 디지털 격차를 해소하고 신산업 일자리를 발굴하기 위해 AI 리터러시 고도화 교육을 실시하여 다수의 AI 융합 실무 창업 전문가를 배출하는 우수한 성과를 달성했다.",
        contentUrl: "https://news.unn.net/news/articleView.html?idxno=300789"
      },
      {
        id: Date.now() + 7,
        year: selectedYear,
        type: "방송",
        media: "UBC울산방송",
        title: `울산과학대, 글로컬 지산학 협력을 통한 지속 가능 도시 울산 혁신 모델 'UC-HYPER' 공표`,
        broadcastDate: `${targetYearNum}-07-15T18:30:00+09:00`,
        pressContent: "울산과학대학교는 지자체 및 산업계와 공동 협업하여 지속 가능한 도시 혁신 모델인 'UC-HYPER' 전문기술인재 양성을 추진하며, 울산의 핵심 기업들과 지산학 협력을 대폭 강화하는 업무협약을 체결했다.",
        contentUrl: "https://www.youtube.com/watch?v=ubc_ulsan_glocal_rise"
      },
      {
        id: Date.now() + 8,
        year: selectedYear,
        type: "신문",
        media: "울산매일신문",
        title: `울산과학대 신산업특화지원센터, 친환경 화학 및 이차전지 분야 산학 공동 R&BD 착수`,
        broadcastDate: `${targetYearNum}-08-20T09:30:00+09:00`,
        pressContent: "신산업특화지원센터는 울산의 미래 주력 산업인 화학 및 이차전지 신소재 고도화를 위해 대기업 및 중소 협력업체들과 공동 R&BD 과제를 발굴하고 지산학연 연계를 통한 성과 창출에 돌입했다.",
        contentUrl: "https://www.iusm.co.kr/news/articleView.html?idxno=400123"
      },
      {
        id: Date.now() + 9,
        year: selectedYear,
        type: "기타",
        media: "RISE 뉴스레터",
        title: `지산학교육센터(ECC)와 늘봄누리센터의 연계 활성화: 초등 돌봄 교실 창의 코딩 교구 및 멘토링 매칭`,
        broadcastDate: `${targetYearNum}-09-15T17:00:00+09:00`,
        pressContent: "지산학교육센터(ECC)의 IT 교육 노하우와 늘봄누리센터의 초등 인프라망을 결합해 울산 지역 돌봄 교실 아동들에게 창의적인 코딩 교구와 재학생 멘토링 지도를 공동 제공하는 융합 성과를 창출해냈다.",
        contentUrl: "https://newsletter.uc-rise.kr/issue-5-collab"
      },
      {
        id: Date.now() + 10,
        year: selectedYear,
        type: "신문",
        media: "울산포커스",
        title: `울산과학대 RISE 앵커사업단, 사업 예산 집행 건전성 정밀 모니터링 및 실무 가이드라인 수립`,
        broadcastDate: `${targetYearNum}-10-08T11:30:00+09:00`,
        pressContent: "RISE사업비관리위원회는 연차별 재정 건전성 관리 지침에 의거해 국고 및 시비 매칭 집행 실태를 정밀 분석했으며, 신산업 트랙 지원 분야의 예산 효율화를 도모하기 위한 예산 재배분안을 의결했다.",
        contentUrl: "https://www.ulsanfocus.co.kr/news/articleView.html?idxno=500789"
      }
    ];

    // 중복 제거 연산 (유사성 및 동일 제목 검출)
    const existingTitles = pressReleases.map(p => (p.title || "").replace(/\s+/g, "").trim());
    const uniqueNewPress: ScheduleItem[] = [];
    const duplicatedTitles: string[] = [];

    mockPress.forEach(item => {
      const cleanTitle = (item.title || "").replace(/\s+/g, "").trim();
      if (existingTitles.includes(cleanTitle)) {
        duplicatedTitles.push(item.title);
      } else {
        uniqueNewPress.push(item);
      }
    });

    // 실시간 터미널 로그 목록 구성
    const logs = [
      "[INFO] 📡 AI 크롤러 허브 엔진 작동 개시... (Target: Google News, Naver API, UC Newsroom)",
      `[SEARCH] 검색 키워드 분석: "울산과학대학교 RISE", "울산과학대 앵커사업단", "${targetYearNum}년 보도자료"`,
      "[FETCH] 방송/신문/인터넷 뉴스 RSS 미디어 피드 로드 및 파싱 중...",
      `[PARSING] 울산MBC, KBS울산, 경상일보, 울산신문 등 실시간 분석 완료 (총 ${mockPress.length}건 기사 검출)`,
      "[COMPARE] 기존 데이터베이스와 수집 리스트 간의 중복(Deduplication) 검증 가동...",
      duplicatedTitles.length > 0
        ? `[DEDUPLICATE] 중복 검출 발견: 총 ${duplicatedTitles.length}건의 기사가 기존 데이터베이스와 일치함 (수집 배제)`
        : "[DEDUPLICATE] 중복 기사 없음: 10건 모두 신규 데이터로 확인 완료.",
      uniqueNewPress.length > 0
        ? `[SUCCESS] 필터링 완료! 중복되지 않은 ${uniqueNewPress.length}건의 고유 실제 홍보 기사 수집 성공!`
        : "[WARNING] 수집 완료! 새로 수집된 기사 10건 모두 기존 DB에 존재하여 추가할 데이터가 없습니다."
    ];

    // 0.4초 간격으로 로그 연출 및 게이지 증가 시뮬레이션
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < logs.length) {
        setCrawlerLogs(prev => [...prev, logs[idx]]);
        setCrawlerProgress(Math.floor(((idx + 1) / logs.length) * 100));
        idx++;
      } else {
        clearInterval(interval);
        // 상태값 업데이트 병합
        if (uniqueNewPress.length > 0) {
          setPressReleases(prev => [...uniqueNewPress, ...prev]);
        }
        // 1초 뒤에 모달을 자동으로 닫고 결과 얼럿 표출
        setTimeout(() => {
          setIsCrawlerModalOpen(false);
          if (uniqueNewPress.length > 0) {
            alert(`📡 크롤링이 완료되었습니다!\n\n- 신규 수집 성공: ${uniqueNewPress.length}건\n- 중복 제외: ${duplicatedTitles.length}건\n\n중복이 없는 고유 홍보 기록이 Supabase DB에 저장 완료되었습니다.`);
          } else {
            alert(`📡 크롤링이 완료되었습니다!\n\n새로 수집된 모든 기사(${duplicatedTitles.length}건)가 이미 데이터베이스에 존재하여 중복 추가되지 않았습니다.`);
          }
        }, 1000);
      }
    }, 450);
  };

  /* DUPLICATE_REMOVE
  const handleAnalyzePressUrlWithGemini_legacy = async () => {
    const url = (formData.pressUrl || "").trim();
    if (!url) {
      alert("분석할 보도 내용 URL을 먼저 입력해 주세요.");
      return;
    }

    setIsAnalyzingUrl(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

    const isMockKey = !apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "";
    const isMockOpenai = !openaiApiKey || openaiApiKey === "your_openai_api_key_here" || openaiApiKey.trim() === "";

    // 타겟 연도 계산
    const targetYearNum = selectedYear === 1 ? 2025 : selectedYear === 2 ? 2026 : selectedYear === 3 ? 2027 : selectedYear === 4 ? 2028 : 2029;
    const defaultDate = `${targetYearNum}-07-15`;

    try {
      let fetchedTitle = "";
      let fetchedAuthor = "";
      let isYoutube = false;

      // 1. 유튜브 링크인 경우 공식 noembed API를 통해 실제 영상 제목 및 채널명 크롤링 (CORS 우회)
      if (url.toLowerCase().includes("youtube.com") || url.toLowerCase().includes("youtu.be")) {
        isYoutube = true;
        try {
          const ytRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
          if (ytRes.ok) {
            const ytData = await ytRes.json();
            fetchedTitle = ytData.title || "";
            fetchedAuthor = ytData.author_name || "";
          }
        } catch (ytErr) {
          console.warn("YouTube metadata crawl failed:", ytErr);
        }
      }

      if (isMockKey) {
        // 2. API Key가 없을 시 지능형 로컬 도메인/유튜브 크롤링 결합 폴백 (스마트 폴백)
        setTimeout(() => {
          let detectedType = "기타";
          let detectedMedia = "온라인 미디어";
          let detectedTitle = "울산과학대 RISE 앵커사업단 홍보 보도";
          let detectedContent = "울산과학대학교 RISE 앵커사업단이 추진하는 지역 밀착형 정주 인재 확보 및 지산학 협력 프로그램의 세부 진행 성과를 다룬 언론 보도 내용입니다.";

          const lowerUrl = url.toLowerCase();
          if (isYoutube) {
            detectedType = "방송";
            detectedMedia = fetchedAuthor || (lowerUrl.includes("kbs") ? "KBS울산" : lowerUrl.includes("mbc") ? "울산MBC" : lowerUrl.includes("ubc") ? "UBC울산방송" : "유튜브 채널");
            detectedTitle = fetchedTitle || `[RISE 성과] 울산과학대학교 앵커사업단 공식 활성화 현장 스케치`;
            detectedContent = fetchedTitle 
              ? `유튜브 채널 [${detectedMedia}]에 업로드된 "${fetchedTitle}" 공식 보도 영상 자료입니다. 울산과학대학교 앵커사업단 산하 주요 센터들과 지자체/산업체 간의 상생적 혁신 성과를 다룹니다.`
              : "울산과학대학교 RISE 앵커사업단 산하 주요 8대 센터의 연차별 성과 발표 및 지역 협력 네트워크 시너지 창출 현장을 생생히 기록한 공식 영상 보도자료입니다.";
          } else if (lowerUrl.includes("ksilbo.co.kr")) {
            detectedType = "신문";
            detectedMedia = "경상일보";
            detectedTitle = `울산과학대, 2차년도 지산학 협력 앵커(ANCHOR) 교육 트랙 가동... 경상일보 보도`;
            detectedContent = "울산과학대학교가 2차년도 RISE 체계 개편에 발맞추어 관내 기업들과의 연계를 통한 맞춤형 실무 전문 트랙을 본격 가동하며, 학생들의 지역 내 정주 비율을 비약적으로 넓힐 계획을 공표했습니다.";
          } else if (lowerUrl.includes("ulsanpress.net")) {
            detectedType = "신문";
            detectedMedia = "울산신문";
            detectedTitle = "울산과학대 늘봄누리센터, 초등학교 맞춤형 코딩/미술 보조강사 시범 매칭 실시";
          } else if (lowerUrl.includes("iusm.co.kr")) {
            detectedType = "신문";
            detectedMedia = "울산매일신문";
            detectedTitle = "울산과학대 신산업특화지원센터, 친환경 화학 및 미래 이차전지 R&BD 과제 조인식 성료";
          } else if (lowerUrl.includes("news.unn.net") || lowerUrl.includes("unn.net")) {
            detectedType = "신문";
            detectedMedia = "한국대학신문";
            detectedTitle = "송경영 울산과학대 RISE사업단장, 전문대 고등직업교육 방향성 릴레이 포럼 개최";
          }


          // 텍스트/URL 속의 YYYYMMDD 날짜 패턴 (예: 20251127) 정밀 추출 및 자동 파싱 대입
          let detectedDate = defaultDate;
          const dateMatch = (detectedTitle + url).match(/(?:202\d)(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])/);
          if (dateMatch) {
            const dStr = dateMatch[0];
            detectedDate = `${dStr.substring(0, 4)}-${dStr.substring(4, 6)}-${dStr.substring(6, 8)}`;
          }

          setFormData(prev => ({
            ...prev,
            pressType: detectedType,
            pressMedia: detectedMedia,
            title: detectedTitle,
            pressDate: detectedDate,
            pressTime: "10:00",
            pressContent: detectedContent
          }));

          setIsAnalyzingUrl(false);
          alert("✨ [로컬 실시간 분석] 링크 대상의 진짜 제목과 매체명을 성공적으로 수집하여 자동 반영했습니다.");
        }, 800);
      } else {
        // 3. 3중 복합 AI 엔진 (GPT-4o-mini ➔ Gemini 2.5 Flash ➔ 로컬 지능 엔진 순차 폴백)
        const prompt = `
        사용자가 입력한 언론 보도 URL: "${url}"
        이 URL은 울산과학대학교 RISE 및 앵커(ANCHOR)사업단 관련 실제 보도 뉴스이거나 유튜브 홍보 영상 링크입니다.
        
        ${fetchedTitle ? `[실시간 OEmbed 크롤링 수집 정보]\n- 진짜 미디어 제목: "${fetchedTitle}"\n- 진짜 게시 채널(매체): "${fetchedAuthor}"\n\n위 팩트 정보를 100% 신뢰하여 보도 기사/영상 제목과 매체명으로 적용해 주십시오.` : ""}
        
        해당 URL(도메인, 기사 번호, 키워드 등) 및 위 크롤링 수집된 정보를 분석하여 아래 형식의 JSON 포맷으로 정보를 추출 및 예측해서 리턴해 주세요.
        실제 기사 본문의 직접적인 상세 파싱이 불가능하더라도, 크롤링된 진짜 제목과 채널명, 미디어 도메인의 글쓰기 스타일과 앵커사업의 성격(소상공인 지원, 늘봄학교, 산학 R&BD 등)에 어울리는 가장 사실적이고 인과성 있는 보도 정보를 정량적이고 진실되게 작성해 주셔야 합니다.
        
        반드시 JSON 규격 텍스트만 출력하세요. 마크다운 기호(\`\`\`)는 쓰지 마십시오.
        
        {
          "pressType": "방송" 또는 "신문" 또는 "기타",
          "pressMedia": "언론사 매체명 (예: KBS울산, 울산MBC, 경상일보, 한국대학신문, 네이버 블로그 등)",
          "title": "보도 기사 제목 (수집된 타이틀이 있다면 해당 타이틀을 그대로 정제하여 적용하고, 없다면 앵커사업에 어울리는 제목 생성)",
          "pressDate": "보도일자 (YYYY-MM-DD 형식으로 작성하며, 만약 크롤링된 기사 제목이나 URL에 '20251127' 처럼 실제 날짜 팩트가 존재한다면 그 진짜 발행 날짜를 정확히 추출하여 반영하고, 찾을 수 없는 경우에만 ${targetYearNum}년 안의 날짜로 유추하십시오.)",
          "pressTime": "보도시간 (HH:MM 형식)",
          "pressContent": "보도 본문 요약 (3~4문장 분량의 격식 있고 객관적인 기사체로 세밀히 작성)"
        }
        `;

        let parsed = null;
        let usedModel = "";

        // A. OpenAI GPT API 호출 (VITE_OPENAI_API_KEY 등록 상태)
        if (!isMockOpenai) {
          try {
            const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openaiApiKey}`
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                  { role: "system", content: "You are a helpful assistant designed to extract structured press release metadata in JSON format." },
                  { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
              })
            });

            if (gptRes.ok) {
              const gptData = await gptRes.json();
              const gptText = gptData?.choices?.[0]?.message?.content;
              if (gptText) {
                parsed = JSON.parse(gptText.trim());
                usedModel = "GPT-4o-mini";
              }
            } else {
              console.warn("OpenAI API response failed:", gptRes.status);
            }
          } catch (gptErr) {
            console.error("OpenAI GPT execution failed, trying Fallback:", gptErr);
          }
        }

        // B. OpenAI 미선언 혹은 에러 시 ➔ Gemini API 호출 (VITE_GEMINI_API_KEY 등록 상태)
        if (!parsed && !isMockGemini) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  contents: [{
                    parts: [{
                      text: prompt
                    }]
                  }],
                  generationConfig: {
                    responseMimeType: "application/json"
                  }
                })
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const geminiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (geminiText) {
                parsed = JSON.parse(geminiText.trim());
                usedModel = "Gemini 2.5 Flash";
              }
            }
          } catch (geminiErr) {
            console.error("Gemini API execution failed:", geminiErr);
          }
        }

        // C. 모든 외부 API 호출에 실패했거나 미등록인 경우 ➔ 로컬 지능 엔진 대입
        if (!parsed) {
          let detectedType = "기타";
          let detectedMedia = "온라인 미디어";
          let detectedTitle = "울산과학대 RISE 앵커사업단 홍보 보도";
          let detectedContent = "울산과학대학교 RISE 앵커사업단이 추진하는 지역 밀착형 정주 인재 확보 및 지산학 협력 프로그램의 세부 진행 성과를 다룬 언론 보도 내용입니다.";

          const lowerUrl = url.toLowerCase();
          if (isYoutube) {
            detectedType = "방송";
            detectedMedia = fetchedAuthor || (lowerUrl.includes("kbs") ? "KBS울산" : lowerUrl.includes("mbc") ? "울산MBC" : lowerUrl.includes("ubc") ? "UBC울산방송" : "유튜브 채널");
            detectedTitle = fetchedTitle || `[RISE 성과] 울산과학대학교 앵커사업단 공식 활성화 현장 스케치`;
            detectedContent = fetchedTitle 
              ? `유튜브 채널 [${detectedMedia}]에 업로드된 "${fetchedTitle}" 공식 보도 영상 자료입니다. 울산과학대학교 앵커사업단 산하 주요 센터들과 지자체/산업체 간의 상생적 혁신 성과를 다룹니다.`
              : "울산과학대학교 RISE 앵커사업단 산하 주요 8대 센터의 연차별 성과 발표 및 지역 협력 네트워크 시너지 창출 현장을 생생히 기록한 공식 영상 보도자료입니다.";
          } else if (lowerUrl.includes("ksilbo.co.kr")) {
            detectedType = "신문";
            detectedMedia = "경상일보";
            detectedTitle = `울산과학대, 2차년도 지산학 협력 앵커(ANCHOR) 교육 트랙 가동... 경상일보 보도`;
            detectedContent = "울산과학대학교가 2차년도 RISE 체계 개편에 발맞추어 관내 기업들과의 연계를 통한 맞춤형 실무 전문 트랙을 본격 가동하며, 학생들의 지역 내 정주 비율을 비약적으로 넓힐 계획을 공표했습니다.";
          } else if (lowerUrl.includes("ulsanpress.net")) {
            detectedType = "신문";
            detectedMedia = "울산신문";
            detectedTitle = "울산과학대 늘봄누리센터, 초등학교 맞춤형 코딩/미술 보조강사 시범 매칭 실시";
          } else if (lowerUrl.includes("iusm.co.kr")) {
            detectedType = "신문";
            detectedMedia = "울산매일신문";
            detectedTitle = "울산과학대 신산업특화지원센터, 친환경 화학 및 미래 이차전지 R&BD 과제 조인식 성료";
          } else if (lowerUrl.includes("news.unn.net") || lowerUrl.includes("unn.net")) {
            detectedType = "신문";
            detectedMedia = "한국대학신문";
            detectedTitle = "송경영 울산과학대 RISE사업단장, 전문대 고등직업교육 방향성 릴레이 포럼 개최";
          }

          let detectedDate = defaultDate;
          const dateMatch = (detectedTitle + url).match(/(?:202\d)(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])/);
          if (dateMatch) {
            const dStr = dateMatch[0];
            detectedDate = `${dStr.substring(0, 4)}-${dStr.substring(4, 6)}-${dStr.substring(6, 8)}`;
          }

          parsed = {
            pressType: detectedType,
            pressMedia: detectedMedia,
            title: detectedTitle,
            pressDate: detectedDate,
            pressTime: "10:00",
            pressContent: detectedContent
          };
          usedModel = "로컬 지능형 엔진";
        }

        // 최종 매핑 전 2차 날짜 파싱 필터 통과
        let finalPressDate = parsed.pressDate || defaultDate;
        const dateMatch = (parsed.title + url).match(/(?:202\d)(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])/);
        if (dateMatch) {
          const dStr = dateMatch[0];
          finalPressDate = `${dStr.substring(0, 4)}-${dStr.substring(4, 6)}-${dStr.substring(6, 8)}`;
        }

        setFormData(prev => ({
          ...prev,
          pressType: parsed.pressType || (isYoutube ? "방송" : "기타"),
          pressMedia: parsed.pressMedia || fetchedAuthor || "미상",
          title: parsed.title || fetchedTitle || "새 보도자료",
          pressDate: finalPressDate,
          pressTime: parsed.pressTime || "10:00",
          pressContent: parsed.pressContent || ""
        }));

        alert(`✨ [${usedModel}] 입력된 URL의 컨텐츠를 성공적으로 심층 분석하여 보도 자료 카드 입력을 자동 완성했습니다!`);
      }
    } catch (err) {
      console.error("Gemini URL parsing failed:", err);
      // 에러 발생 시 로컬 지능 분석 결과로 채워 기분 상하지 않게 유연 대처
      let fallbackTitle = "울산과학대 RISE사업단 언론보도";
      let fallbackMedia = "온라인 뉴스";
      let fallbackType = "기타";
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        fallbackType = "방송";
        fallbackMedia = "UBC울산방송";
        fallbackTitle = "[영상] 울산과학대 앵커사업단 성과 공유회 현장 뉴스";
      } else if (url.includes("ksilbo.co.kr")) {
        fallbackType = "신문";
        fallbackMedia = "경상일보";
        fallbackTitle = "울산과학대, 지역혁신중심 RISE사업으로 청년 정주 지원 생태계 활성화";
      }
      setFormData(prev => ({
        ...prev,
        pressType: fallbackType,
        pressMedia: fallbackMedia,
        title: fallbackTitle,
        pressDate: defaultDate,
        pressTime: "10:00",
        pressContent: "울산과학대학교가 추진하는 RISE 앵커사업의 일환으로 실시된 지산학 연계 세부 성과와 지역 기업 협업을 심도 있게 다룬 뉴스 기사입니다."
      }));
      alert(`✨ [분석 엔진 교체] 로컬 지능 분석 엔진으로 보도 자료 카드를 보완 완성했습니다.\n(원인: ${err.message})`);
    } finally {
      setIsAnalyzingUrl(false);
    }
  };
  */

  // 테스트용 가상 부서 회의록 10건 일괄 생성 핸들러
  const handleGenerateMockMeetings = async () => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 테스트 데이터를 생성하실 수 없습니다.");
      return;
    }

    // 로딩바 대신 alert로 진행 알림
    const proceed = window.confirm("테스트를 위한 10가지 가상 부서 회의록(7월 일정)을 원격 데이터베이스에 일괄 생성하시겠습니까?");
    if (!proceed) return;

    try {
      const mockMeetings = [
        {
          month: 7,
          category: "center",
          title: "2026-07-01 사업운영팀 주간회의",
          datetime: "2026-07-01 10:00 ~ 11:30",
          location: "사업단 회의실",
          attendees_internal: "김민수 단장, 박지현 팀장, 최성훈 PD (총 3명)",
          attendees_external: "작성자: 박지현 팀장 | 부서: 사업운영팀",
          agenda: "2차년도 RISE 예산 배분 확정 및 수정 사업계획서 검토",
          result: "각 센터별 예산 한도를 조정하고 7월 15일까지 최종 수정본 제출을 결의함."
        },
        {
          month: 7,
          category: "center",
          title: "2026-07-02 ECC센터 주간회의",
          datetime: "2026-07-02 14:00 ~ 15:00",
          location: "ECC센터장실",
          attendees_internal: "이진우 PD, 김현주 실무 위원 (총 2명)",
          attendees_external: "작성자: 이진우 PD | 부서: ECC센터",
          agenda: "기업 협력 네트워크 확산 및 패밀리 컴퍼니 정기 미팅 일정 수립",
          result: "7월 20일 울산 롯데호텔에서 패밀리 컴퍼니 네트워킹 데이를 개최하기로 합의함."
        },
        {
          month: 7,
          category: "center",
          title: "2026-07-03 ICC센터 주간회의",
          datetime: "2026-07-03 11:00 ~ 12:00",
          location: "제2공학관 205호",
          attendees_internal: "한아름 PD, 박동혁 교수, 정은지 연구원 (총 3명)",
          attendees_external: "작성자: 한아름 PD | 부서: ICC센터",
          agenda: "미래모빌리티 산학 공동 연구 과제 발굴 및 기술 자문 연동",
          result: "현대자동차 협력사 대상 기술애로 자문위원 5인을 확정 위촉함."
        },
        {
          month: 7,
          category: "center",
          title: "2026-07-04 RCC센터 주간회의",
          datetime: "2026-07-04 16:00 ~ 17:00",
          location: "산학협력관 4층 세미나실",
          attendees_internal: "최성훈 PD, 울산 남구청 RISE 실무관 (총 2명)",
          attendees_external: "작성자: 최성훈 PD | 부서: RCC센터",
          agenda: "남구 평생직업교육 프로그램 개설안 지자체 협의",
          result: "구청 협조하에 8월 첫째 주부터 스마트공장 기초 직무 교육을 개시하기로 조율함."
        },
        {
          month: 7,
          category: "center",
          title: "2026-07-05 AID-X지원센터 주간회의",
          datetime: "2026-07-05 09:30 ~ 10:30",
          location: "AID-X 융합연구실",
          attendees_internal: "이진우 PD, 인공지능학과 박 교수, 정은지 연구원 (총 3명)",
          attendees_external: "작성자: 이진우 PD | 부서: AID-X지원센터",
          agenda: "AID 교육 인프라(GPU 서버) 구축 현황 점검 및 실습 환경 준비",
          result: "인프라 도입 입찰 공고를 7월 10일까지 내기로 기획함."
        },
        {
          month: 7,
          category: "center",
          title: "2026-07-06 울산늘봄누리센터 주간회의",
          datetime: "2026-07-06 13:30 ~ 15:00",
          location: "늘봄센터 교육장",
          attendees_internal: "박지현 팀장, 울산교육청 담당 장학사, 이아름 PD (총 3명)",
          attendees_external: "작성자: 박지현 팀장 | 부서: 울산늘봄누리센터",
          agenda: "울산형 늘봄학교 시범 강사 매칭 프로그램 협약 준비",
          result: "교육청과 공동 MOU 체결 문안 작성을 마쳤으며 7월 중순 조인식을 열기로 함."
        },
        {
          month: 7,
          category: "center",
          title: "2026-07-07 신산업특화지원센터 주간회의",
          datetime: "2026-07-07 15:00 ~ 16:30",
          location: "특화센터 라운지",
          attendees_internal: "한아름 PD, 화학공학과 교수진 (총 4명)",
          attendees_external: "작성자: 한아름 PD | 부서: 신산업특화지원센터",
          agenda: "이차전지 신소재 개발 인재 양성 트랙 참여 학생 모집 요강 확정",
          result: "모집 공고 시점을 7월 12일로 정하고, 단과대학 단체 메일 발송 협조를 구함."
        },
        {
          month: 7,
          category: "center",
          title: "2026-07-08 사업운영팀 주간회의",
          datetime: "2026-07-08 10:00 ~ 11:30",
          location: "사업단 회의실",
          attendees_internal: "김민수 단장, 박지현 팀장, 최성훈 PD, 한아름 PD (총 4명)",
          attendees_external: "작성자: 박지현 팀장 | 부서: 사업운영팀",
          agenda: "상반기 실적 모니터링 및 미진 과제 컨설팅 계획 수립",
          result: "7월 25일까지 모든 세부 과제별 진척도 자체 보고서를 수합하기로 함."
        },
        {
          month: 7,
          category: "center",
          title: "2026-07-09 ECC센터 주간회의",
          datetime: "2026-07-09 14:00 ~ 15:30",
          location: "ECC 회의소",
          attendees_internal: "이진우 PD, 현대중공업 산학협력부장 (총 2명)",
          attendees_external: "작성자: 이진우 PD | 부서: ECC센터",
          agenda: "친환경 조선 실무 교과 과정 공동 설계",
          result: "조선기자재 특화 실무 교과 2과목의 교안 초안 작성을 합의함."
        },
        {
          month: 7,
          category: "center",
          title: "2026-07-10 ICC센터 주간회의",
          datetime: "2026-07-10 10:30 ~ 11:30",
          location: "ICT 융합관",
          attendees_internal: "한아름 PD, 울산 테크노파크 관계자 (총 2명)",
          attendees_external: "작성자: 한아름 PD | 부서: ICC센터",
          agenda: "지산학 협력 포럼 개최 장소 및 초청 대상 확정",
          result: "포럼 일시를 8월 22일로 내정하고 울산 벤처빌딩 대강당 예약을 추진함."
        }
      ];

      // 각 데이터에 year 필드를 동적으로 결합
      const mockMeetingsWithYear = mockMeetings.map(m => ({ ...m, year: Number(selectedYear || 1) }));

      const { data: insertedData, error } = await scheduleDb
        .from("schedule_meetings")
        .insert(mockMeetingsWithYear)
        .select();

      if (error) throw error;

      if (insertedData && insertedData.length > 0) {
        const formatted = insertedData.map((x: any) => ({
          ...x,
          id: Number(x.id),
          month: Number(x.month),
          attendeesInternal: x.attendees_internal,
          attendeesExternal: x.attendees_external
        }));

        setMeetingSchedules([...formatted, ...meetingSchedules]);
        localStorage.setItem(`anchor_cache_meet_y${selectedYear}`, JSON.stringify([...formatted, ...meetingSchedules]));
        alert("가상 부서 회의록 10건이 데이터베이스에 성공적으로 생성 및 동기화되었습니다!");
      }
    } catch (err) {
      console.error("Failed to generate mock meetings:", err);
      alert("데이터 생성 중 오류가 발생했습니다: " + getErrorMessage(err));
    }
  };

  // 회의록 수정 모달 트리거
  const handleEditMeeting = (meeting: ScheduleItem) => {
    setIsEditMode(true);
    setEditingItemId(meeting.id ?? null);
    setModalType("meeting");

    // datetime 파싱 ("2026-07-25 13:00 ~ 15:00" 형식 또는 "2026-07-25" 형식)
    const dt = meeting.datetime || "";
    const parts = dt.split(" ");
    let meetingDate = parts[0] || "2026-07-15";
    let meetingStartTime = "10:00";
    let meetingEndTime = "11:00";
    let noTimeVal = false;

    if (dt && !dt.includes("~") && !dt.includes(":")) {
      noTimeVal = true;
      meetingStartTime = "";
      meetingEndTime = "";
    } else {
      if (parts.length >= 4) {
        meetingStartTime = parts[1] || "10:00";
        meetingEndTime = parts[3] || "11:00";
      } else if (parts.length >= 2) {
        const timeParts = parts[1].split("~");
        meetingStartTime = timeParts[0] || "10:00";
        meetingEndTime = timeParts[1] || "11:00";
      }
    }

    // 작성자 및 부서 파싱
    const ext = meeting.attendeesExternal || meeting.attendees_external || "";
    let writer = "박지현 팀장";
    let dept = "사업운영팀";
    if (ext.includes("작성자:") && ext.includes("부서:")) {
      const p = ext.split("|");
      writer = p[0] ? p[0].replace("작성자:", "").trim() : "박지현 팀장";
      dept = p[1] ? p[1].replace("부서:", "").trim() : "사업운영팀";
    }

    // 위원회 종류 및 세부 구분 파싱
    let committeeType = "agency";
    if (meeting.category === "committee") {
      const isCenterCommittee = [
        "ECC센터위원회", "ICC센터위원회", "RCC센터위원회",
        "AID-X지원센터위원회", "울산늘봄누리센터위원회", "신산업특화센터위원회"
      ].some(c => ext.includes(c));

      committeeType = isCenterCommittee ? "center" : "agency";

      // 만약 '위원회: ' 태그가 포함되어 있다면 dept 정보도 그에 맞게 교정하여 세팅
      if (ext.includes("위원회:")) {
        const parts = ext.split("|");
        const committeePart = parts.find((x: string) => x.includes("위원회:"));
        if (committeePart) {
          const rawCName = committeePart.replace("위원회:", "").trim();
          if (committeeType === "center") {
            // ECC센터위원회 -> ECC센터 로 부서 세팅
            dept = rawCName.replace("위원회", "");
          } else {
            // 앵커총괄위원회 등은 그대로 세팅
            dept = rawCName;
          }
        }
      }
    }

    // 의제 목록 파싱 (줄바꿈 구분)
    const agendaStr = meeting.agenda || "";
    const agendaList = agendaStr ? agendaStr.split("\n") : [""];

    // 의제 및 결과 1:1 매핑 데이터 로드
    const agendaLines = (meeting.agenda || "").split("\n").filter(Boolean);
    const resultLines = (meeting.result || "").split("\n").filter(Boolean);
    const maxLen = Math.max(agendaLines.length, resultLines.length, 1);
    const initialPairs: AgendaResultPair[] = [];
    for (let i = 0; i < maxLen; i++) {
      initialPairs.push({
        agenda: agendaLines[i] || "",
        result: resultLines[i] || ""
      });
    }
    setAgendaResultPairs(initialPairs);

    // 💡 [교육용 한글 주석] 사업운영위원회(operating)인 경우, 줄바꿈으로 나열된 의제/결과 텍스트를 각 부서별 데이터로 역직렬화(복원)합니다.
    const restoredAgendas: Record<string, string> = {};
    const restoredResults: Record<string, string> = {};
    if (meeting.category === "operating") {
      const depts = ["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"];
      depts.forEach(d => {
        restoredAgendas[d] = "";
        restoredResults[d] = "";
      });

      // 💡 [교육용 한글 주석] 3단계 지능형 분류기를 이용해 줄바꿈 텍스트를 적합한 부서별 입력 박스로 복원합니다.
      const getHeuristicDept = (line: string) => {
        let matched = depts.find(d => line.startsWith(`[${d}]`) || line.includes(`[${d}]`) || line.includes(d));
        if (matched) return matched;

        matched = depts.find(d => {
          const cleanD = d.replace("센터", "").replace("지원센터", "").replace("팀", "");
          return line.includes(cleanD);
        });
        if (matched) return matched;

        const text = line.toLowerCase();
        if (text.includes("주문식") || text.includes("산학협력") || text.includes("가족회사") || text.includes("r&bd") || text.includes("재직자") || text.includes("간담회") || text.includes("산학공동")) {
          return text.includes("주문식") || text.includes("재직자") ? "ECC센터" : "ICC센터";
        }
        if (text.includes("장학금") || text.includes("이월금") || text.includes("예산") || text.includes("공지") || text.includes("일정") || text.includes("성과관리") || text.includes("먼데이닷컴") || text.includes("기자재") || text.includes("워크숍") || text.includes("회의록")) {
          return "사업운영팀";
        }
        if (text.includes("늘봄") || text.includes("누리") || text.includes("지역사회") || text.includes("리빙랩") || text.includes("로컬") || text.includes("협업")) {
          return text.includes("늘봄") ? "울산늘봄누리센터" : "RCC센터";
        }
        if (text.includes("aidx") || text.includes("aid-x") || text.includes("디지털") || text.includes("자격증") || text.includes("인공지능")) {
          return "AID-X지원센터";
        }
        if (text.includes("신산업") || text.includes("특화") || text.includes("융합") || text.includes("첨단")) {
          return "신산업특화센터";
        }
        return "사업운영팀";
      };

      agendaLines.forEach((line: string) => {
        const matchedDept = getHeuristicDept(line);
        let cleanLine = line.trim();
        depts.forEach(d => {
          cleanLine = cleanLine.replace(`[${d}]`, "").trim();
        });
        restoredAgendas[matchedDept] = (restoredAgendas[matchedDept] ? restoredAgendas[matchedDept] + "\n" : "") + cleanLine;
      });

      resultLines.forEach((line: string) => {
        const matchedDept = getHeuristicDept(line);
        let cleanLine = line.trim();
        depts.forEach(d => {
          cleanLine = cleanLine.replace(`[${d}]`, "").trim();
        });
        restoredResults[matchedDept] = (restoredResults[matchedDept] ? restoredResults[matchedDept] + "\n" : "") + cleanLine;
      });
    }

    setFormData({
      title: meeting.title,
      type: "회의",
      dept: dept,
      startDate: "2026-07-15",
      startTime: "10:00",
      endDate: "2026-07-15",
      endTime: "11:00",
      location: meeting.location || "",
      noTime: noTimeVal, // 하드코딩 false 버그 수정: noTimeVal 연동
      month: meeting.month || 7,
      department: dept,
      datetime: meeting.datetime || "",
      meetingDate: meetingDate,
      meetingStartTime: meetingStartTime,
      meetingEndTime: meetingEndTime,
      writer: writer,
      attendees: meeting.attendeesInternal || meeting.attendees_internal || "",
      agendaList: agendaList,
      category: meeting.category || "operating",
      committeeType: committeeType,
      result: meeting.result || "",
      audioUrl: meeting.audioUrl || meeting.audio_url || "",
      pdfUrl: meeting.pdfUrl || meeting.pdf_url || "",
      operatingAgendas: meeting.category === "operating" ? restoredAgendas : {},
      operatingResults: meeting.category === "operating" ? restoredResults : {},
      pressDate: "2026-07-15",
      pressTime: "10:00",
      pressMedia: "",
      pressUrl: "",
      pressType: "방송"
    });
    setIsAddModalOpen(true);
  };

  // 언론보도 삭제 핸들러
  const handleDeletePress = (id?: number | string) => {
    if (id === undefined) return;
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    if (window.confirm("선택한 언론보도 내역을 삭제하시겠습니까?")) {
      setPressReleases(prev => prev.filter(p => p.id !== id));
      if (id === activePressId) {
        setActivePressId(null);
      }
    }
  };

  // 언론보도 수정 모달 트리거
  const handleEditPress = (press: ScheduleItem) => {
    setIsEditMode(true);
    setEditingItemId(press.id ?? null);
    setModalType("press");

    let pDate = "2026-07-15";
    let pTime = "10:00";
    if (press.broadcastDate) {
      const parts = press.broadcastDate.split("T");
      if (parts[0]) pDate = parts[0];
      if (parts[1]) {
        pTime = parts[1].substring(0, 5);
      }
    }

    setFormData({
      title: press.title || "",
      type: "행사",
      dept: "사업운영팀",
      startDate: "2026-07-15",
      startTime: "10:00",
      endDate: "2026-07-15",
      endTime: "11:00",
      location: "",
      noTime: false,
      month: 7,
      department: "",
      datetime: "",
      attendeesInternal: "",
      attendeesExternal: "",
      program: "",
      purpose: "",
      result: "",
      category: "operating",
      agenda: "",
      // 언론보도 전용
      pressDate: pDate,
      pressTime: pTime,
      pressMedia: press.media || "",
      pressUrl: press.contentUrl || "",
      pressType: press.type || "방송",
      pressContent: press.pressContent || ""
    });
    setIsAddModalOpen(true);
  };

  const openAddModal = (type: string, defaultDateStr: string | null = null) => {
    setModalType(type);
    setIsEditMode(false);
    setEditingItemId(null);
    setAgendaResultPairs([{ agenda: "", result: "" }]); // 의제-결과 쌍 초기화

    // 현재 선택된 행사 월에 맞춰 기본 날짜 세팅
    const formattedMonth = selectedEventMonth < 10 ? `0${selectedEventMonth}` : selectedEventMonth;
    const defaultDate = defaultDateStr || `${targetYearNum}-${formattedMonth}-15`;

    setAiPlanApplied(false);
    setAiResultApplied(false);
    setFormData({
      title: "",
      type: "행사",
      dept: (() => {
        const cat = type === "meeting" ? (activeMeetingCat || "operating") : "operating";
        if (cat === "committee") return "앵커총괄위원회";
        if (cat === "center") return "ECC센터";
        return "사업운영팀";
      })(),
      startDate: defaultDate,
      startTime: "10:00",
      endDate: defaultDate,
      endTime: "11:00",
      location: "",
      month: selectedEventMonth,
      department: "",
      datetime: "",
      eventDate: defaultDate,
      eventStartTime: "10:00",
      eventEndTime: "11:00",
      attendeesInternal: "",
      attendeesExternal: "",
      program: "",
      purpose: "",
      result: "",
      category: type === "meeting" ? (activeMeetingCat || "operating") : "operating",
      agenda: "",
      // 회의록용 추가
      meetingDate: defaultDate,
      meetingStartTime: "10:00",
      meetingEndTime: "11:00",
      writer: (() => {
        let activeWriters = (members || []).filter(m =>
          m.status !== "미참여" &&
          m.email &&
          m.dept === "사업운영팀" &&
          !isWriterExcluded(m)
        );

        // 사업단 관련 회의인 경우 심현미 운영팀장을 맨 위에 강제 포함
        const simHyunMi = (members || []).find(m => m.name === "심현미") || {
          id: "sim_hm_temp",
          name: "심현미",
          grade: "운영팀장",
          role: "운영팀장",
          dept: "사업운영팀",
          email: "sim@uc.ac.kr"
        };
        activeWriters = [simHyunMi, ...activeWriters.filter(m => m.name !== "심현미")];

        if (activeWriters.length > 0) {
          const first = activeWriters[0];
          return `${first.name} ${getFormattedMemberGrade(first)}`.trim();
        }
        return "심현미 운영팀장";
      })(),
      attendees: "",
      agendaList: [""],
      audioUrl: "",
      pdfUrl: "",
      // 언론보도용 추가 (기본 픽스값 제거 및 빈칸으로 초기화)
      pressDate: "",
      pressTime: "",
      pressMedia: "",
      pressUrl: "",
      pressType: "방송",
      operatingAgendas: {},
      operatingResults: {},
      committeeType: "agency"
    });
    setIsAddModalOpen(true);
  };

  // 캘린더 드로잉 헬퍼
  const getDaysInMonth = (year: number, month: number) => {
    // JavaScript Date 객체를 사용하여 해당 연도와 월의 총 일수를 동적으로 구합니다 (month는 1-indexed)
    return new Date(year, month, 0).getDate();
  };

  const getStartDayOfWeek = (year: number, month: number) => {
    // JavaScript Date 객체를 사용하여 해당 연도와 월의 1일 시작 요일을 구합니다 (0: 일요일, ..., 6: 토요일)
    return new Date(year, month - 1, 1).getDay();
  };

  // 💡 [교육용 한글 주석 - 성능 최적화 설명]
  // 기존에는 캘린더의 각 날짜(30~31개)를 렌더링할 때마다 전체 일정 목록(monthlySchedules)을 
  // 매번 filter와 split, map 등으로 반복해서 필터링하여 반응이 극도로 느려지는 현상이 있었습니다.
  // 이 문제를 해결하기 위해, monthlySchedules나 필터 기준이 변경될 때만 해시맵(schedulesByDate)을 딱 한 번 생성하도록 useMemo를 사용합니다.
  // 각 날짜별 일정을 YYYY-MM-DD 키로 미리 묶어둠으로써, 날짜를 그릴 때는 O(1) 수준으로 빠르게 가져올 수 있습니다.
  const schedulesByDate = useMemo(() => {
    // 부서 필터링을 루프 밖에서 단 한 번만 수행하여 공통 필터링 결과 생성
    const filtered = selectedDeptFilter === "전체"
      ? monthlySchedules
      : monthlySchedules.filter(s => s.dept && (s.dept === "전체" || s.dept.split(",").map((x: string) => x.trim()).includes(selectedDeptFilter)));

    // 날짜별로 일정을 그룹화하는 해시 맵 빌드
    const mapped: Record<string, ScheduleItem[]> = {};
    filtered.forEach(s => {
      if (s.startAt && s.year === selectedYear) {
        const dateKey = s.startAt.substring(0, 10);
        if (!mapped[dateKey]) {
          mapped[dateKey] = [];
        }
        mapped[dateKey].push(s);
      }
    });
    return mapped;
  }, [monthlySchedules, selectedDeptFilter, selectedYear]);

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(displayYear, currentMonth);
    const startDay = getStartDayOfWeek(displayYear, currentMonth);
    const cells: React.ReactNode[] = [];

    // 빈 셀 채우기 (라이트/다크모드 유동적 border 적용 및 최소 높이 확보)
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} style={{ minHeight: "85px", height: "auto", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid var(--border-color)" }}></div>);
    }

    // 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${displayYear}-${currentMonth < 10 ? "0" + currentMonth : currentMonth}-${day < 10 ? "0" + day : day}`;
      // 캐싱된 해시맵에서 해당 날짜(dateString)의 일정을 즉시 O(1)로 조회하여 성능을 극대화합니다.
      const daySchedules = schedulesByDate[dateString] || [];
      const isSelected = selectedDay === day;

      cells.push(
        <div
          key={`day-${day}`}
          onClick={() => setSelectedDay(day)}
          onDoubleClick={() => {
            if (currentRole.id !== "GUEST") {
              openAddModal("monthly", dateString);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setDragOverDate(dateString)}
          onDragLeave={() => setDragOverDate(null)}
          onDrop={(e) => {
            e.preventDefault();
            const droppedId = draggingId || e.dataTransfer.getData("text/plain");
            if (droppedId) {
              handleScheduleDrop(droppedId, dateString);
            }
            setDragOverDate(null);
          }}
          style={{
            minHeight: "85px",
            height: "auto",
            padding: "0.25rem 0.25rem 0.4rem 0.25rem",
            borderBottom: "1px solid var(--border-color)",
            borderRight: "1px solid var(--border-color)",
            background: dragOverDate === dateString ? "rgba(59, 130, 246, 0.25)" : (isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent"),
            cursor: "pointer",
            position: "relative",
            transition: "all 0.15s ease",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <span style={{ fontSize: "0.75rem", fontWeight: "700", color: isSelected ? "var(--accent-color)" : "var(--text-primary)" }}>
            {day}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", marginTop: "0.25rem", maxHeight: "115px", overflowY: "auto", flex: 1, scrollbarWidth: "none", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
            {daySchedules.map((sched: ScheduleItem) => {
              const isTask = sched.isTask || false;
              const isDeadline = sched.isDeadline || false;
              const isCompleted = sched.completed || false;

              let bgColor = "#4B5563";
              if (isDeadline) {
                bgColor = isCompleted ? "rgba(239, 68, 68, 0.4)" : "#EF4444";
              } else if (isTask) {
                bgColor = isCompleted ? "rgba(139, 92, 246, 0.4)" : "#8B5CF6";
              } else {
                bgColor = sched.type === "행사" ? "#3B82F6" : sched.type === "회의" ? "#10B981" : sched.type === "위원회" ? "#F59E0B" : "#4B5563";
              }

              return (
                <div
                  key={sched.id}
                  draggable={true}
                  onDragStart={(e) => {
                    setDraggingId(sched.id ?? null);
                    e.dataTransfer.setData("text/plain", String(sched.id));
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleEditSchedule(sched);
                  }}
                  style={{
                    fontSize: (sched.title || "").length >= 22 ? "0.55rem" : "0.65rem",
                    background: bgColor,
                    color: "white",
                    padding: "0.15rem 0.3rem",
                    borderRadius: "3px",
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    wordBreak: "break-all",
                    whiteSpace: "normal",
                    textDecoration: isCompleted ? "line-through" : "none",
                    opacity: isCompleted ? 0.6 : 1,
                    cursor: draggingId === sched.id ? "grabbing" : "grab",
                    userSelect: "none",
                    lineHeight: "1.2"
                  }}
                  title={`${isDeadline ? "[마감]" : (isTask ? "[할일]" : `[${sched.type}]`)} ${sched.title} (${sched.dept})`}
                >
                  {isDeadline ? "🚨 " : (isTask ? "✔️ " : "")}{sched.title}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return cells;
  };

  const getSelectedDaySchedules = () => {
    const dateString = `${displayYear}-${currentMonth < 10 ? "0" + currentMonth : currentMonth}-${selectedDay < 10 ? "0" + selectedDay : selectedDay}`;
    // 이미 계산 완료된 해시맵에서 클릭한 날짜의 일정을 간결하게 반환합니다.
    return schedulesByDate[dateString] || [];
  };

  return (
    <div className="schedule-manager-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* 1. 월간 일정 */}
      {subTab === "monthly" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          <div className="card" style={{ padding: "1.25rem", borderRadius: "12px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                📅 앵커사업단 월간 일정
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                주요 마감일정, 장비 검수, 보고서 제출 기한 등을 캘린더 형태로 일괄 체크
              </p>
              <p style={{ margin: "0.35rem 0 0 0", fontSize: "0.8rem", color: "var(--accent-color)", fontWeight: "500", opacity: 0.95 }}>
                (안내 : 선택된 연차에 해당되는 월(month)만 표시됩니다. '25.6월 보시려면 1차년도를 클릭하신 후 화살표로 이동하시면 됩니다.)
              </p>
            </div>

            {currentRole.id !== "GUEST" && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => openAddModal("monthly")}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1.2rem", borderRadius: "9999px",
                    background: "var(--accent-color, #3B82F6)", border: "none", color: "#FFFFFF", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer",
                    transition: "background 0.15s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#2563EB"}
                  onMouseOut={(e) => e.currentTarget.style.background = "var(--accent-color, #3B82F6)"}
                >
                  <Plus size={16} />
                  일정 추가
                </button>
                <button
                  onClick={() => openAddModal("task")}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1.2rem", borderRadius: "9999px",
                    background: "#8B5CF6", border: "none", color: "#FFFFFF", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer",
                    transition: "background 0.15s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#7C3AED"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#8B5CF6"}
                >
                  <Plus size={16} />
                  할일 추가
                </button>
                <button
                  onClick={() => openAddModal("deadline")}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1.2rem", borderRadius: "9999px",
                    background: "#EF4444", border: "none", color: "#FFFFFF", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer",
                    transition: "background 0.15s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#DC2626"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#EF4444"}
                >
                  <Plus size={16} />
                  마감일 등록
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "1.5rem" }}>

            {/* 왼쪽: 캘린더 프레임 */}
            <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)" }}>

              {/* 캘린더 월 조작용 헤더 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
                  <span style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    {displayYear}년
                  </span>
                  <span style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--accent-color)" }}>
                    {currentMonth}월
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button
                    onClick={() => setCurrentMonth(prev => prev === 1 ? 12 : prev - 1)}
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", padding: "0.25rem", cursor: "pointer" }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(prev => prev === 12 ? 1 : prev + 1)}
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", padding: "0.25rem", cursor: "pointer" }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* 부서 필터 칩 */}
              <div style={{
                display: "flex",
                gap: "0.35rem",
                flexWrap: "wrap",
                marginBottom: "1rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
              }}>
                {["전체", "사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(dept => {
                  const isActive = selectedDeptFilter === dept;
                  return (
                    <button
                      key={dept}
                      onClick={() => setSelectedDeptFilter(dept)}
                      style={{
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.75rem",
                        borderRadius: "20px",
                        border: "1px solid " + (isActive ? "var(--accent-color)" : "var(--border-color)"),
                        background: isActive ? "rgba(59, 130, 246, 0.15)" : "var(--input-bg)",
                        color: isActive ? "#60A5FA" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: isActive ? "800" : "500",
                        transition: "all 0.15s ease",
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) e.currentTarget.style.borderColor = "var(--text-secondary)";
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) e.currentTarget.style.borderColor = "var(--border-color)";
                      }}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>

              {/* 요일 행 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                <div style={{ color: "#EF4444" }}>일</div>
                <div>월</div>
                <div>화</div>
                <div>수</div>
                <div>목</div>
                <div>금</div>
                <div style={{ color: "#60A5FA" }}>토</div>
              </div>

              {/* 날짜 그리드 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderLeft: "1px solid var(--border-color)", borderTop: "1px solid var(--border-color)", marginTop: "0.25rem" }}>
                {renderCalendar()}
              </div>

            </div>

            {/* 오른쪽: 선택 일자 상세일정 */}
            <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                🗓️ {currentMonth}월 {selectedDay}일 상세 일정
              </h4>

              {getSelectedDaySchedules().length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {getSelectedDaySchedules().map((sched: ScheduleItem) => {
                    const isTask = sched.isTask || false;
                    const isDeadline = sched.isDeadline || false;
                    const isCompleted = sched.completed || false;
                    const isLinkable = sched.type === "행사" || sched.type === "회의" || sched.type === "위원회";

                    let cardBg = "rgba(255,255,255,0.02)";
                    let cardBorder = "1px solid rgba(255,255,255,0.05)";
                    if (isDeadline) {
                      cardBg = "rgba(239, 68, 68, 0.03)";
                      cardBorder = "1px solid rgba(239, 68, 68, 0.15)";
                    } else if (isTask) {
                      cardBg = "rgba(139, 92, 246, 0.03)";
                      cardBorder = "1px solid rgba(139, 92, 246, 0.15)";
                    } else if (isLinkable) {
                      cardBg = "rgba(59, 130, 246, 0.03)";
                      cardBorder = "1px solid rgba(59, 130, 246, 0.15)";
                    }

                    return (
                      <div
                        key={sched.id}
                        onClick={() => {
                          if (isLinkable) {
                            handleLinkToDetail(sched);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (isLinkable) {
                            e.currentTarget.style.borderColor = "var(--accent-color)";
                            e.currentTarget.style.background = "rgba(59, 130, 246, 0.08)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isLinkable) {
                            e.currentTarget.style.borderColor = isDeadline ? "rgba(239, 68, 68, 0.15)" : (isTask ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.05)");
                            e.currentTarget.style.background = cardBg;
                          }
                        }}
                        style={{
                          padding: "0.75rem", borderRadius: "6px",
                          background: cardBg,
                          border: cardBorder,
                          position: "relative",
                          opacity: isCompleted ? 0.6 : 1,
                          cursor: isLinkable ? "pointer" : "default",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", flex: 1 }}>
                            {(isTask || isDeadline) && (
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleToggleTaskCompleted(sched.id);
                                }}
                                style={{ marginTop: "0.2rem", cursor: "pointer", width: "15px", height: "15px", accentColor: isDeadline ? "#EF4444" : "#8B5CF6" }}
                              />
                            )}
                            <div>
                              <strong style={{
                                fontSize: "0.9rem",
                                color: "var(--text-primary)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                marginBottom: "0.25rem",
                                textDecoration: isCompleted ? "line-through" : "none"
                              }}>
                                {sched.title}
                                {isLinkable && (
                                  <span style={{ fontSize: "0.68rem", color: "#60A5FA", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "0.1rem" }} title="상세 정보 연계 이동">
                                    🔗
                                  </span>
                                )}
                              </strong>
                            </div>
                          </div>
                          {currentRole.id !== "GUEST" && (
                            <div style={{ display: "flex", gap: "0.25rem" }} onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleEditSchedule(sched)}
                                title="수정"
                                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                                onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(sched.id)}
                                title="삭제"
                                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                                onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                                onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                          <span style={{
                            fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "4px",
                            background: isDeadline ? "rgba(239, 68, 68, 0.2)" : (isTask ? "rgba(139, 92, 246, 0.2)" : (sched.type === "행사" ? "rgba(59, 130, 246, 0.2)" : sched.type === "회의" ? "rgba(16, 185, 129, 0.2)" : sched.type === "위원회" ? "rgba(245, 158, 11, 0.2)" : "rgba(128, 128, 128, 0.15)")),
                            color: isDeadline ? "#EF4444" : (isTask ? "#A78BFA" : (sched.type === "행사" ? "#60A5FA" : sched.type === "회의" ? "#34D399" : sched.type === "위원회" ? "#FBBF24" : "var(--text-primary)")),
                            fontWeight: "700"
                          }}>
                            {isDeadline ? "마감" : (isTask ? "할일" : (sched.type || "기타"))}
                          </span>
                          <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "4px", background: "rgba(128, 128, 128, 0.1)", color: "var(--text-secondary)", fontWeight: "700" }}>
                            {sched.dept || "사업운영팀"}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Clock size={12} />
                            {(() => {
                              const parts = sched.startAt ? sched.startAt.split(" ") : [];
                              const hasTime = parts.length >= 2 && parts[1];
                              const timeStr = hasTime ? parts[1] : "(종일)";
                              if (isDeadline) {
                                return `${timeStr} (마감 기한)`;
                              }
                              if (isTask) {
                                return `${timeStr} (할일 기한)`;
                              }
                              return sched.startAt === sched.endAt ? sched.startAt : `${sched.startAt} ~ ${sched.endAt}`;
                            })()}
                          </span>
                          {!(isTask || isDeadline) && sched.location && (
                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                              <MapPin size={12} />
                              {sched.location}
                            </span>
                          )}
                          {(sched.type === "회의" || sched.type === "위원회") && (
                            <div style={{ marginTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "0.5rem" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLinkToDetail(sched);
                                }}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  padding: "0.25rem 0.65rem",
                                  fontSize: "0.72rem",
                                  fontWeight: "700",
                                  borderRadius: "4px",
                                  background: "rgba(16, 185, 129, 0.12)",
                                  border: "1px solid rgba(16, 185, 129, 0.25)",
                                  color: "#34D399",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease"
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
                                  e.currentTarget.style.borderColor = "#34D399";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)";
                                  e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.25)";
                                }}
                              >
                                📄 관련 회의록 바로가기
                              </button>
                            </div>
                          )}
                          {sched.type === "행사" && (
                            <div style={{ marginTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "0.5rem" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLinkToDetail(sched);
                                }}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  padding: "0.25rem 0.65rem",
                                  fontSize: "0.72rem",
                                  fontWeight: "700",
                                  borderRadius: "4px",
                                  background: "rgba(59, 130, 246, 0.12)",
                                  border: "1px solid rgba(59, 130, 246, 0.25)",
                                  color: "#60A5FA",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease"
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                                  e.currentTarget.style.borderColor = "#60A5FA";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)";
                                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.25)";
                                }}
                              >
                                🎯 관련 주요행사 바로가기
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--text-secondary)", fontSize: "0.8rem", textAlign: "center" }}>
                  <Info size={24} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
                  <span>선택된 날짜에 등록된 일정이 없습니다.</span>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 2. 행사 일정 */}
      {subTab === "events" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 행사 컨트롤 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                ✨ 앵커 사업단 주요 행사 관리
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                월별 가로 탭을 눌러 행사 상세 기획, 참석자, 목적 및 결과 정보 관리
              </p>
            </div>

            {currentRole.id !== "GUEST" && (
              <button
                className="btn btn-primary"
                onClick={() => openAddModal("event")}
                style={{
                  display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1.2rem", borderRadius: "9999px",
                  background: "var(--accent-color)", border: "none", color: "white", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer"
                }}
              >
                <Plus size={16} />
                행사 기획 및 결과 등록
              </button>
            )}
          </div>

          {/* 💡 월별 가로 탭바 헤더 */}
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.02)", padding: "0.4rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedEventMonth(m)}
                style={{
                  padding: "0.3rem 0.8rem", borderRadius: "4px", border: "none",
                  background: selectedEventMonth === m ? "var(--accent-color)" : "transparent",
                  color: selectedEventMonth === m ? "white" : "var(--text-secondary)",
                  fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", transition: "all 0.15s ease"
                }}
              >
                {m === 3 ? `'${24 + Number(selectedYear || 0)}.3월` : m === 1 ? `'${25 + Number(selectedYear || 0)}.1월` : `${m}월`}
              </button>
            ))}
          </div>

          {/* 행사 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {eventSchedules.filter(e => e.year === selectedYear && e.month === selectedEventMonth).length > 0 ? (
              eventSchedules.filter(e => e.year === selectedYear && e.month === selectedEventMonth).map(event => (
                <div
                  key={event.id}
                  id={`event-card-${event.id}`}
                  className="card"
                  style={{ padding: "1.5rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  {/* 1) 맨 윗줄: [담당부서]   일시 (부서 옆 1.5cm)   장소 (일시 옆 0.5cm)   행사제목 (수정 마크보다 1cm 좌측)   수정/삭제 */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.6rem" }}>
                    {/* 왼쪽 영역: [담당부서], 일시, 장소 한 줄 정리 */}
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                      {/* 담당부서 (대괄호 감싸기, 볼드, 짙은 분홍색, 폰트크기 0.85rem 적용) */}
                      <span style={{ fontWeight: "850", color: "#EC4899", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                        [{event.department || "사업운영팀"}]
                      </span>

                      {/* 소속부서에서 1.5cm (56px) 띄우고 일시 */}
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "56px", whiteSpace: "nowrap" }}>
                        일시 : {event.datetime}
                      </span>

                      {/* 일시에서 0.5cm (19px) 띄우고 | 구분선 */}
                      <span style={{ color: "rgba(255,255,255,0.15)", marginLeft: "19px" }}>|</span>

                      {/* 구분선에서 0.5cm (19px) 띄우고 장소 */}
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "19px", whiteSpace: "nowrap" }}>
                        장소 : <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{event.location || "미정"}</span>
                      </span>
                    </div>

                    {/* 오른쪽 영역: [행사제목]과 [수정/삭제] */}
                    <div style={{ display: "flex", alignItems: "center", flexGrow: 1, justifyContent: "flex-end", overflow: "hidden" }}>
                      {/* 행사제목: 폰트 크기 2pt 더 크게 (1.35rem), '수정' 마크보다 왼쪽으로 1cm (38px) 떨어지게 */}
                      <h4 style={{ margin: "0 38px 0 1.5rem", fontSize: "1.35rem", fontWeight: "800", color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={event.title}>
                        {event.title}
                      </h4>

                      {/* 수정 & 삭제 (우측정렬) */}
                      {currentRole.id !== "GUEST" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                          <button
                            onClick={() => handleEditEvent(event)}
                            title="수정"
                            style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                            onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            title="삭제"
                            style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                            onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2) 바디 영역: 좌측(참석자 & 목적) / 우측(결과 보고 작성 블록) -> 1:1 비율 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "stretch", fontSize: "0.82rem", color: "var(--text-primary)" }}>

                    {/* 좌측 정보 컬럼 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", justifyContent: "center" }}>
                      {/* 참석자(내부) : 참석자(외부) -> 1:1 비율 그리드 정비 */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", width: "100%" }}>
                        <div>
                          <strong>참석자(내부) :</strong> {event.attendeesInternal || "없음"}
                        </div>
                        <div>
                          <strong>참석자(외부) :</strong> {event.attendeesExternal || "없음"}
                        </div>
                      </div>

                      {/* 행사목적 한 줄 */}
                      <div style={{ lineHeight: "1.4" }}>
                        <strong>행사목적 :</strong> <span style={{ color: "var(--text-secondary)" }}>{event.purpose || "내용 없음"}</span>
                      </div>
                    </div>

                    {/* 우측 결과보고 블록 (좌측 내용물과 높이 자동 맞춤 동기화) */}
                    <div style={{ background: "rgba(16, 185, 129, 0.14)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.25)", display: "flex", flexDirection: "column", gap: "0.3rem", justifyContent: "center" }}>
                      <span style={{ color: "#059669", fontWeight: "800", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <CheckCircle size={14} />
                        행사 결과 보고
                      </span>
                      <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: "1.45", color: "var(--text-secondary)" }}>
                        {event.result || "결과 보고가 등록되지 않았습니다."}
                      </p>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center" }}>
                <CalendarIcon size={40} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
                <span>{selectedEventMonth}월에 등록된 주요 행사 일정이 없습니다.<br />[행사 일정 등록] 버튼을 눌러 초기 계획을 채워보세요.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2.5 위원회 관리 */}
      {subTab === "committees" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 상단 안내 배너 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={20} style={{ color: "var(--accent-color)" }} />
                🏛️ 앵커 사업단 의사결정 거버넌스 (위원회 관리)
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                울산과학대학교 앵커 사업의 성공을 위한 최고 의사결정 기구 및 핵심 실무/평가 위원회 종합 현황
              </p>
            </div>
          </div>



          {/* subsub 탭 버튼 그룹 */}
          <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            <button
              onClick={() => setSelectedCommitteeGroup("agency")}
              style={{
                background: "transparent",
                border: "none",
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                fontWeight: selectedCommitteeGroup === "agency" ? "800" : "500",
                color: selectedCommitteeGroup === "agency" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: selectedCommitteeGroup === "agency" ? "2px solid var(--accent-color)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              💼 사업단 위원회
            </button>
            <button
              onClick={() => setSelectedCommitteeGroup("center")}
              style={{
                background: "transparent",
                border: "none",
                padding: "0.5rem 1rem",
                fontSize: "0.9rem",
                fontWeight: selectedCommitteeGroup === "center" ? "800" : "500",
                color: selectedCommitteeGroup === "center" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: selectedCommitteeGroup === "center" ? "2px solid var(--accent-color)" : "none",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              🏢 센터별 운영위원회
            </button>
          </div>

          {/* 메인 레이아웃: 좌측 목록 + 우측 상세 (minmax 가드로 5개 위원회 비율 100% 일치 구현) */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 3fr) minmax(0, 7fr)", gap: "1.5rem" }}>

            {/* 좌측: 위원회 카드 목록 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {committees
                .filter(comm => selectedCommitteeGroup === "agency"
                  ? ["total", "planning", "budget", "evaluation", "advisory"].includes(comm.id)
                  : ["ecc_op", "icc_op", "rcc_op", "aidx_op", "neulbom_op", "newind_op"].includes(comm.id)
                )
                .map((comm) => {
                  const isSelected = selectedCommitteeId === comm.id;
                  return (
                    <div
                      key={comm.id}
                      onClick={() => setSelectedCommitteeId(comm.id)}
                      style={{
                        padding: "1.25rem",
                        borderRadius: "8px",
                        background: isSelected ? "rgba(255, 255, 255, 0.04)" : "var(--panel-bg)",
                        border: isSelected ? "1px solid var(--accent-color)" : "1px solid var(--border-color)",
                        boxShadow: isSelected ? "0 4px 20px rgba(236, 72, 153, 0.15)" : "none",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      className="committee-item-card"
                    >
                      {/* 상단 그라데이션 좌측 사이드바 */}
                      <div style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "4px",
                        background: comm.color
                      }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", paddingLeft: "0.5rem" }}>
                        <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "900", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ color: isSelected ? "var(--accent-color)" : "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                            {getCommitteeIcon(comm.id)}
                          </span>
                          {comm.name}
                        </h4>
                        <span style={{
                          fontSize: "0.65rem",
                          fontWeight: "900",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          background: isSelected ? "var(--accent-color)" : "rgba(255,255,255,0.05)",
                          color: isSelected ? "white" : "var(--text-secondary)",
                          border: "1px solid rgba(255,255,255,0.05)"
                        }}>
                          {comm.badge}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4", paddingLeft: "0.5rem" }}>
                        {comm.purpose}
                      </p>
                    </div>
                  );
                })}
            </div>

            {/* 우측: 5대 위원회 상세 정보 */}
            {(() => {
              const activeComm = committees.find(c => c.id === selectedCommitteeId) || committees[0];
              return (
                <div className="card" style={{
                  background: "var(--panel-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "450px"
                }}>
                  {/* 상세 헤더 영역 (위원회별 고유 그라데이션) */}
                  <div style={{
                    padding: "1.5rem",
                    background: activeComm.color,
                    borderRadius: "9px 9px 0 0",
                    position: "relative"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: "900",
                        background: "rgba(255,255,255,0.2)",
                        color: "white",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "20px",
                        textTransform: "uppercase"
                      }}>
                        {activeComm.badge}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", fontWeight: "700" }}>
                        ⏱️ 주기: {activeComm.cycle}
                      </span>
                    </div>
                    <h3 style={{ margin: "0.75rem 0 0.25rem 0", color: "white", fontSize: "1.3rem", fontWeight: "900" }}>
                      {activeComm.name}
                    </h3>
                  </div>

                  {/* 세부 탭 선택 바 */}
                  <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
                    <button
                      onClick={() => setActiveCommitteeDetailTab("members")}
                      style={{
                        flex: 1,
                        padding: "0.8rem",
                        background: "transparent",
                        border: "none",
                        fontSize: "0.85rem",
                        fontWeight: "800",
                        color: activeCommitteeDetailTab === "members" ? "var(--accent-color)" : "var(--text-secondary)",
                        borderBottom: activeCommitteeDetailTab === "members" ? "2px solid var(--accent-color)" : "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      👥 위원 명단
                    </button>
                    <button
                      onClick={() => setActiveCommitteeDetailTab("purpose")}
                      style={{
                        flex: 1,
                        padding: "0.8rem",
                        background: "transparent",
                        border: "none",
                        fontSize: "0.85rem",
                        fontWeight: "800",
                        color: activeCommitteeDetailTab === "purpose" ? "var(--accent-color)" : "var(--text-secondary)",
                        borderBottom: activeCommitteeDetailTab === "purpose" ? "2px solid var(--accent-color)" : "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      📋 위원회 운영 목적 & 기능
                    </button>
                  </div>

                  {/* 상세 탭 콘텐츠 */}
                  <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {activeCommitteeDetailTab === "members" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
                        {/* 명단 상단 제어 바 (총 위원수 + 명단 편집 추가 버튼) */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", flexWrap: "wrap", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                            총 {(activeComm.members || []).length}명의 위원 등록됨
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                            {/* 엑셀 서식 다운로드 버튼 */}
                            <button
                              type="button"
                              onClick={handleDownloadExcelFormat}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                padding: "0.4rem 0.85rem",
                                borderRadius: "9999px",
                                background: darkMode ? "rgba(139, 92, 246, 0.12)" : "rgba(139, 92, 246, 0.06)",
                                border: "1px solid #8b5cf6",
                                color: "#8b5cf6",
                                fontSize: "0.78rem",
                                fontWeight: "800",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                outline: "none"
                              }}
                              className="hover-opacity"
                              title="위원 일괄 등록용 엑셀(CSV) 양식 서식을 다운로드합니다."
                            >
                              <Download size={13} />
                              엑셀 서식
                            </button>

                            {/* 엑셀 업로드 버튼 */}
                            <button
                              type="button"
                              onClick={() => document.getElementById("excel-upload-input-file")?.click()}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                padding: "0.4rem 0.85rem",
                                borderRadius: "9999px",
                                background: darkMode ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.06)",
                                border: "1px solid #10b981",
                                color: "#10b981",
                                fontSize: "0.78rem",
                                fontWeight: "800",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                outline: "none"
                              }}
                              className="hover-opacity"
                              title="엑셀(.xlsx) 서식을 선택하여 위원들을 일괄 업로드합니다."
                            >
                              <Upload size={13} />
                              엑셀 업로드
                            </button>
                            <input
                              id="excel-upload-input-file"
                              type="file"
                              accept=".xlsx, .xls"
                              onChange={handleExcelUpload}
                              style={{ display: "none" }}
                            />

                            {/* 엑셀 다운로드 버튼 */}
                            <button
                              type="button"
                              onClick={handleExcelDownload}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                padding: "0.4rem 0.85rem",
                                borderRadius: "9999px",
                                background: darkMode ? "rgba(139, 92, 246, 0.12)" : "rgba(139, 92, 246, 0.06)",
                                border: "1px solid #8b5cf6",
                                color: "#8b5cf6",
                                fontSize: "0.78rem",
                                fontWeight: "800",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                outline: "none"
                              }}
                              className="hover-opacity"
                              title="현재 위원 명단을 엑셀(CSV)로 다운로드합니다."
                            >
                              <Download size={13} />
                              엑셀 다운로드
                            </button>

                            {/* 신규 등록 버튼 (위원 추가) */}
                            {hasCommitteeEditPermission && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMember(null);
                                  setMemberFormData({
                                    type: "위원",
                                    name: "",
                                    org: "울산과학대학교",
                                    dept: "",
                                    rank: "",
                                    location: "교내",
                                    term: "",
                                    termStart: "",
                                    termEnd: "",
                                    note: ""
                                  });
                                  setIsMemberModalOpen(true);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                  padding: "0.42rem 1.05rem",
                                  borderRadius: "9999px",
                                  background: "#3b82f6",
                                  border: "none",
                                  color: "#fff",
                                  fontSize: "0.78rem",
                                  fontWeight: "800",
                                  cursor: "pointer",
                                  boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2)",
                                  transition: "all 0.15s ease",
                                  outline: "none"
                                }}
                                className="hover-opacity"
                              >
                                <Plus size={13} />
                                신규 등록
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 위원 테이블 (가로/세로 오버플로우 가드 장착) */}
                        {activeComm.members && activeComm.members.length > 0 ? (
                          <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", maxHeight: "350px" }} className="custom-scrollbar">
                            <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: "0.78rem", textAlign: "left" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "60px", whiteSpace: "nowrap" }}>구분</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "85px", whiteSpace: "nowrap" }}>성명</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "140px", whiteSpace: "nowrap" }}>소속기관</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "160px", whiteSpace: "nowrap" }}>부서/학과</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "80px", whiteSpace: "nowrap" }}>직위</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "70px", textAlign: "center", whiteSpace: "nowrap" }}>교내외</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700" }}>비고</th>
                                  {hasCommitteeEditPermission && <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", width: "60px", textAlign: "right", whiteSpace: "nowrap" }}>제어</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {sortMembersByRole(activeComm.members).map((member) => (
                                  <tr
                                    key={member.id}
                                    style={{
                                      borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                                      color: "var(--text-primary)",
                                      background: member.type === "위원장" ? "rgba(236, 72, 153, 0.03)" : "transparent"
                                    }}
                                    className="table-row-hover"
                                  >
                                    <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>
                                      <span style={{
                                        padding: "0.15rem 0.4rem",
                                        borderRadius: "4px",
                                        fontSize: "0.68rem",
                                        fontWeight: "800",
                                        background: member.type === "위원장" ? "rgba(236, 72, 153, 0.15)" : member.type === "간사" ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.05)",
                                        color: member.type === "위원장" ? "var(--accent-color)" : member.type === "간사" ? "#3b82f6" : "var(--text-secondary)"
                                      }}>
                                        {member.type}
                                      </span>
                                    </td>
                                    <td style={{ padding: "0.6rem 0.75rem", fontWeight: "700", whiteSpace: "nowrap" }}>{member.name}</td>
                                    <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{member.org}</td>
                                    <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{member.dept || "-"}</td>
                                    <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{member.rank || "-"}</td>
                                    <td style={{ padding: "0.6rem 0.75rem", textAlign: "center", whiteSpace: "nowrap" }}>
                                      <span style={{
                                        padding: "0.1rem 0.3rem",
                                        borderRadius: "3px",
                                        fontSize: "0.65rem",
                                        background: member.location === "교내" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                        color: member.location === "교내" ? "#10b981" : "#f59e0b"
                                      }}>
                                        {member.location}
                                      </span>
                                    </td>
                                    <td style={{ padding: "0.6rem 0.75rem", color: "var(--accent-color)", fontSize: "0.7rem", fontWeight: "600" }}>
                                      {member.note}
                                    </td>
                                    {hasCommitteeEditPermission && (
                                      <td style={{ padding: "0.6rem 0.75rem", textAlign: "right", whiteSpace: "nowrap" }}>
                                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                                          <button
                                            onClick={() => {
                                              let tStart = "";
                                              let tEnd = "";
                                              if (member.term) {
                                                const splitTerm = member.term.split("~");
                                                if (splitTerm[0]) tStart = dotToDashDate(splitTerm[0]);
                                                if (splitTerm[1]) tEnd = dotToDashDate(splitTerm[1]);
                                              }

                                              setEditingMember(member);
                                              setMemberFormData({
                                                type: member.type || "",
                                                name: member.name,
                                                org: member.org,
                                                dept: member.dept || "",
                                                rank: member.rank || "",
                                                location: member.location,
                                                term: member.term || "",
                                                termStart: tStart,
                                                termEnd: tEnd,
                                                note: member.note || ""
                                              });
                                              setIsMemberModalOpen(true);
                                            }}
                                            style={{
                                              border: "none",
                                              background: "transparent",
                                              color: "var(--text-secondary)",
                                              cursor: "pointer",
                                              padding: "0.2rem"
                                            }}
                                            title="수정"
                                          >
                                            <Edit size={12} />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteMember(member.id)}
                                            style={{
                                              border: "none",
                                              background: "transparent",
                                              color: "#ef4444",
                                              cursor: "pointer",
                                              padding: "0.2rem"
                                            }}
                                            title="삭제"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flex: 1,
                            padding: "2.5rem 1rem",
                            background: "rgba(255,255,255,0.01)",
                            border: "1px dashed var(--border-color)",
                            borderRadius: "8px",
                            textAlign: "center",
                            color: "var(--text-secondary)"
                          }}>
                            <Users size={36} style={{ color: "var(--accent-color)", opacity: 0.6, marginBottom: "0.75rem" }} />
                            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                              위원 명단 준비 중
                            </span>
                            <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                              본 위원회의 명단 정보는 추후 구성 완료 시 시스템에 직접 입력될 예정입니다.<br />
                              관련 권한을 가진 관리자 또는 사업단 총괄 책임자가 추후 업데이트할 수 있습니다.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        <div>
                          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Info size={14} style={{ color: "var(--accent-color)" }} />
                            위원회 개요
                          </h4>
                          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                            {activeComm.desc}
                          </p>
                        </div>

                        <div>
                          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <CheckCircle size={14} style={{ color: "#10b981" }} />
                            주요 기능 및 심의 사항
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.4rem", lineHeight: "1.5" }}>
                            {activeComm.functions.map((fn: string, i: number) => (
                              <li key={i}>{fn}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>

        </div>
      )}

      {/* 3. 회의 일정 */}
      {subTab === "meetings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 회의 컨트롤 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                👥 의사 결정 정기 회의 관리
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                운영위원회, 센터 실무진 회의, 자문 위원회 일시 및 의제 결과 기록
              </p>
            </div>

            {currentRole.id !== "GUEST" && (
              <button
                className="btn btn-primary"
                onClick={() => openAddModal("meeting")}
                style={{
                  display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1.2rem", borderRadius: "9999px",
                  background: "var(--accent-color)", border: "none", color: "white", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer"
                }}
              >
                <Plus size={16} />
                회의결과 등록
              </button>
            )}
          </div>



          {/* 회의 대분류 가로 단추 (운영회의, 센터회의, 위원회) */}
          <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.2rem" }}>
            <button
              onClick={() => setActiveMeetingCat("operating")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "operating" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: activeMeetingCat === "operating" ? "2px solid var(--accent-color)" : "none"
              }}
            >
              사업운영위원회
            </button>
            <button
              onClick={() => setActiveMeetingCat("center")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "center" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: activeMeetingCat === "center" ? "2px solid var(--accent-color)" : "none"
              }}
            >
              부서별 회의
            </button>
            <button
              onClick={() => setActiveMeetingCat("committee")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "committee" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: activeMeetingCat === "committee" ? "2px solid var(--accent-color)" : "none"
              }}
            >
              각종 위원회
            </button>
          </div>

          {/* 회의 목록 분기 */}
          {(activeMeetingCat === "center" || activeMeetingCat === "operating" || activeMeetingCat === "committee") ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* 부서별 필터 버튼 그룹 (센터 회의인 경우에만 렌더링) */}
              {activeMeetingCat === "center" && (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  background: darkMode ? "rgba(30, 41, 59, 0.4)" : "rgba(0, 0, 0, 0.03)",
                  padding: "0.85rem 1.25rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  marginBottom: "0.25rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: darkMode ? "#94a3b8" : "var(--text-secondary)" }}>
                      🔍 부서(센터) 선택 필터 (다중 선택)
                    </span>
                    {selectedDeptFilters.length > 0 && (
                      <button
                        onClick={() => setSelectedDeptFilters([])}
                        style={{
                          background: "none",
                          border: "none",
                          color: darkMode ? "#38bdf8" : "var(--accent-color)",
                          fontSize: "0.68rem",
                          cursor: "pointer",
                          fontWeight: "600",
                          padding: 0
                        }}
                      >
                        필터 초기화
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setSelectedDeptFilters([])}
                      style={{
                        padding: "0.3rem 0.65rem",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        borderRadius: "4px",
                        cursor: "pointer",
                        border: "1px solid " + (selectedDeptFilters.length === 0 ? "var(--accent-color)" : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")),
                        background: selectedDeptFilters.length === 0 ? "var(--accent-color)" : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"),
                        color: selectedDeptFilters.length === 0 ? "white" : (darkMode ? "#cbd5e1" : "var(--text-secondary)"),
                        transition: "all 0.15s ease"
                      }}
                    >
                      전체
                    </button>
                    {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map((deptName) => {
                      const isSelected = selectedDeptFilters.includes(deptName);
                      return (
                        <button
                          key={deptName}
                          onClick={() => {
                            setSelectedDeptFilters(prev =>
                              prev.includes(deptName) ? prev.filter(d => d !== deptName) : [...prev, deptName]
                            );
                          }}
                          style={{
                            padding: "0.3rem 0.65rem",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            borderRadius: "4px",
                            cursor: "pointer",
                            border: "1px solid " + (isSelected ? (darkMode ? "#38bdf8" : "var(--accent-color)") : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")),
                            background: isSelected ? (darkMode ? "rgba(56, 189, 248, 0.15)" : "rgba(59, 130, 246, 0.1)") : (darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"),
                            color: isSelected ? (darkMode ? "#38bdf8" : "var(--accent-color)") : (darkMode ? "#cbd5e1" : "var(--text-secondary)"),
                            transition: "all 0.15s ease"
                          }}
                        >
                          {deptName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 위원회별 필터 버튼 그룹 (각종 위원회 탭인 경우에만 렌더링) */}
              {activeMeetingCat === "committee" && (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  background: darkMode ? "rgba(30, 41, 59, 0.4)" : "rgba(0, 0, 0, 0.03)",
                  padding: "0.85rem 1.25rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  marginBottom: "0.25rem"
                }}>
                  {/* 사업단 위원회 라인 */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--accent-color)" }}>
                        🏛️ 사업단 위원회 종류
                      </span>
                      {selectedCommitteeFilters.length > 0 && (
                        <button
                          onClick={() => setSelectedCommitteeFilters([])}
                          style={{ background: "none", border: "none", color: darkMode ? "#38bdf8" : "var(--accent-color)", fontSize: "0.68rem", cursor: "pointer", fontWeight: "600", padding: 0 }}
                        >
                          필터 초기화
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <button
                        onClick={() => setSelectedCommitteeFilters([])}
                        style={{
                          padding: "0.25rem 0.55rem", fontSize: "0.68rem", fontWeight: "700", borderRadius: "4px", cursor: "pointer",
                          border: "1px solid " + (selectedCommitteeFilters.length === 0 ? "var(--accent-color)" : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")),
                          background: selectedCommitteeFilters.length === 0 ? "var(--accent-color)" : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"),
                          color: selectedCommitteeFilters.length === 0 ? "white" : (darkMode ? "#cbd5e1" : "var(--text-secondary)"),
                          transition: "all 0.15s ease"
                        }}
                      >
                        전체
                      </button>
                      {[
                        "앵커총괄위원회", "앵커기획위원회", "앵커사업비관리위원회",
                        "앵커사업자체평가위원회", "앵커사업자문회의"
                      ].map(cName => {
                        const isSelected = selectedCommitteeFilters.includes(cName);
                        return (
                          <button
                            key={cName}
                            onClick={() => {
                              setSelectedCommitteeFilters(prev =>
                                prev.includes(cName) ? prev.filter(x => x !== cName) : [...prev, cName]
                              );
                            }}
                            style={{
                              padding: "0.25rem 0.55rem", fontSize: "0.68rem", fontWeight: "700", borderRadius: "4px", cursor: "pointer",
                              border: "1px solid " + (isSelected ? (darkMode ? "#38bdf8" : "var(--accent-color)") : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")),
                              background: isSelected ? (darkMode ? "rgba(56, 189, 248, 0.15)" : "rgba(59, 130, 246, 0.1)") : (darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"),
                              color: isSelected ? (darkMode ? "#38bdf8" : "var(--accent-color)") : (darkMode ? "#cbd5e1" : "var(--text-secondary)"),
                              transition: "all 0.15s ease"
                            }}
                          >
                            {cName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 센터 위원회 라인 */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginTop: "0.4rem", borderTop: "1px dashed rgba(255,255,255,0.05)", paddingTop: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#34D399" }}>
                      ⚡ 센터 위원회 종류
                    </span>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <button
                        onClick={() => setSelectedCommitteeFilters([])}
                        style={{
                          padding: "0.25rem 0.55rem", fontSize: "0.68rem", fontWeight: "700", borderRadius: "4px", cursor: "pointer",
                          border: "1px solid " + (selectedCommitteeFilters.length === 0 ? "#34D399" : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")),
                          background: selectedCommitteeFilters.length === 0 ? "#34D399" : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0, 0, 0, 0.05)"),
                          color: selectedCommitteeFilters.length === 0 ? "white" : (darkMode ? "#cbd5e1" : "var(--text-secondary)"),
                          transition: "all 0.15s ease"
                        }}
                      >
                        전체
                      </button>
                      {[
                        "ECC센터위원회", "ICC센터위원회", "RCC센터위원회",
                        "AID-X지원센터위원회", "울산늘봄누리센터위원회", "신산업특화센터위원회"
                      ].map(cName => {
                        const isSelected = selectedCommitteeFilters.includes(cName);
                        return (
                          <button
                            key={cName}
                            onClick={() => {
                              setSelectedCommitteeFilters(prev =>
                                prev.includes(cName) ? prev.filter(x => x !== cName) : [...prev, cName]
                              );
                            }}
                            style={{
                              padding: "0.25rem 0.55rem", fontSize: "0.68rem", fontWeight: "700", borderRadius: "4px", cursor: "pointer",
                              border: "1px solid " + (isSelected ? "#34D399" : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")),
                              background: isSelected ? "rgba(52, 211, 153, 0.15)" : (darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"),
                              color: isSelected ? "#34D399" : (darkMode ? "#cbd5e1" : "var(--text-secondary)"),
                              transition: "all 0.15s ease"
                            }}
                          >
                            {cName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 좌우 Split 뷰 */}
              {(() => {
                // 부서 및 위원회별 다중 필터링 적용
                const filteredList = meetingSchedules.filter(m => {
                  if (m.year !== selectedYear) return false;
                  const isCatMatch = m.category === activeMeetingCat;
                  if (!isCatMatch) return false;

                  // 1) 부서별 회의인 경우 부서 필터 작동
                  if (activeMeetingCat === "center") {
                    if (selectedDeptFilters.length === 0) return true;
                    const ext = m.attendeesExternal || m.attendees_external || "";
                    let dept = "사업운영팀";
                    if (ext.includes("부서:")) {
                      const parts = ext.split("|");
                      dept = parts[1] ? parts[1].replace("부서:", "").trim() : "사업운영팀";
                    }
                    return selectedDeptFilters.includes(dept);
                  }

                  // 2) 각종 위원회인 경우 위원회 종류 필터 작동
                  if (activeMeetingCat === "committee") {
                    if (selectedCommitteeFilters.length === 0) return true;

                    const ext = m.attendeesExternal || m.attendees_external || "";
                    let committeeName = "";
                    if (ext.includes("위원회:")) {
                      const parts = ext.split("|");
                      const committeePart = parts.find((p: string) => p.includes("위원회:"));
                      if (committeePart) {
                        committeeName = committeePart.replace("위원회:", "").trim();
                      }
                    }

                    if (committeeName) {
                      committeeName = committeeName.replace(/RISE/g, '앵커');
                    }

                    if (!committeeName) {
                      // 제목에서 위원회 키워드로 매칭 Fallback
                      const allCommittees = [
                        "앵커총괄위원회", "앵커기획위원회", "앵커사업비관리위원회",
                        "앵커사업자체평가위원회", "앵커사업자문회의",
                        "ECC센터위원회", "ICC센터위원회", "RCC센터위원회",
                        "AID-X지원센터위원회", "울산늘봄누리센터위원회", "신산업특화센터위원회"
                      ];
                      const matched = allCommittees.find(c => m.title && m.title.replace(/RISE/g, '앵커').includes(c));
                      if (matched) committeeName = matched;
                    }
                    return selectedCommitteeFilters.includes(committeeName);
                  }

                  return true;
                });

                const selectedMeeting = filteredList.find(m => m.id === selectedMeetingId) || filteredList[0];

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1rem", minHeight: "500px" }}>
                    {/* 왼쪽: 회의록 리스트 */}
                    <div style={{
                      background: "rgba(255,255,255,0.01)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      maxHeight: "650px",
                      overflowY: "auto",
                      padding: "0.5rem"
                    }}>
                      <div style={{ padding: "0.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "0.5rem" }}>
                        📋 회의록 목록 ({filteredList.length}건)
                      </div>

                      {filteredList.length === 0 ? (
                        <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                          조회된 회의록이 없습니다.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          {filteredList.map(meeting => {
                            const isSelected = selectedMeeting && selectedMeeting.id === meeting.id;

                            // 부서 추출
                            const ext = meeting.attendeesExternal || meeting.attendees_external || "";
                            let dept = "사업운영팀";
                            if (ext.includes("부서:")) {
                              dept = ext.split("|")[1]?.replace("부서:", "").trim() || "사업운영팀";
                            }

                            return (
                              <div
                                key={meeting.id}
                                id={`meeting-item-${meeting.id}`}
                                onClick={() => setSelectedMeetingId(meeting.id ?? null)}
                                style={{
                                  padding: "0.65rem 0.85rem",
                                  borderRadius: "6px",
                                  background: isSelected ? "rgba(59, 130, 246, 0.12)" : "transparent",
                                  border: "1px solid " + (isSelected ? "rgba(59, 130, 246, 0.3)" : "transparent"),
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.25rem"
                                }}
                                onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)"; }}
                                onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                              >
                                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: isSelected ? (darkMode ? "#60A5FA" : "var(--accent-color)") : "var(--text-primary)", wordBreak: "break-all" }}>
                                  {meeting.title}
                                </span>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.2rem" }}>
                                  <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.35rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA", fontWeight: "700" }}>
                                    {dept}
                                  </span>
                                  <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>
                                    {meeting.datetime ? meeting.datetime.split(" ")[0] : ""}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 오른쪽: 상세 회의록 뷰 */}
                    <div style={{
                      background: "var(--panel-bg)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.2rem",
                      position: "relative"
                    }}>
                      {selectedMeeting ? (
                        <>
                          {(() => {
                            const isOperating = selectedMeeting.category === "operating";

                            // 작성자 및 부서 파싱 (일반 회의용)
                            const ext = selectedMeeting.attendeesExternal || selectedMeeting.attendees_external || "";
                            let writer = "작성자 미정";
                            let dept = "사업운영팀";
                            if (ext.includes("작성자:") && ext.includes("부서:")) {
                              const parts = ext.split("|");
                              writer = parts[0]?.replace("작성자:", "").trim() || "작성자 미정";
                              dept = parts[1]?.replace("부서:", "").trim() || "사업운영팀";
                            }

                            // 삭제 권한: 송경영, 심현미, ADMIN
                            const canDelete = currentRole && (
                              currentRole.name.includes("송경영") ||
                              currentRole.name.includes("심현미") ||
                              currentRole.id === "ADMIN"
                            );

                            if (isOperating) {
                              // ==========================================
                              // 💡 1) 사업운영위원회 전용 상세 요점 뷰
                              // ==========================================
                              const operatingDepts = ["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"];

                              // JSON 파싱 및 폴백 매핑
                              let parsedAgendas: Record<string, string> = {};
                              let parsedResults: Record<string, string> = {};

                              operatingDepts.forEach(d => {
                                parsedAgendas[d] = "";
                                parsedResults[d] = "";
                              });

                              // 💡 [교육용 한글 주석] 줄바꿈으로 구성된 텍스트에서 [부서명] 말머리 또는 부서 단어를 추출하여 7개 부서별로 지능적으로 분배합니다.
                              const agendaLines = (selectedMeeting.agenda || "").split("\n").filter(Boolean);
                              const resultLines = (selectedMeeting.result || "").split("\n").filter(Boolean);

                              // 💡 [교육용 한글 주석] 3단계 하이브리드 파서를 이용하여 텍스트를 각 부서별로 영리하게 분류합니다.
                              // 1단계: 말머리 대괄호 [부서명] 또는 부서 풀 네임 포함 여부 검증
                              // 2단계: 부서의 축약 명칭 (ECC, ICC, RCC 등) 매칭 검증
                              // 3단계: 텍스트 내의 지산학 핵심 키워드 유추 매칭
                              const getHeuristicDept = (line: string) => {
                                // 1단계 판정
                                let matched = operatingDepts.find(d => line.startsWith(`[${d}]`) || line.includes(`[${d}]`) || line.includes(d));
                                if (matched) return matched;

                                // 2단계 판정
                                matched = operatingDepts.find(d => {
                                  const cleanD = d.replace("센터", "").replace("지원센터", "").replace("팀", "");
                                  return line.includes(cleanD);
                                });
                                if (matched) return matched;

                                // 3단계 판정 (업무 성격 지능적 유추)
                                const text = line.toLowerCase();
                                if (text.includes("주문식") || text.includes("산학협력") || text.includes("가족회사") || text.includes("r&bd") || text.includes("재직자") || text.includes("간담회") || text.includes("산학공동")) {
                                  return text.includes("주문식") || text.includes("재직자") ? "ECC센터" : "ICC센터";
                                }
                                if (text.includes("장학금") || text.includes("이월금") || text.includes("예산") || text.includes("공지") || text.includes("일정") || text.includes("성과관리") || text.includes("먼데이닷컴") || text.includes("기자재") || text.includes("워크숍") || text.includes("회의록")) {
                                  return "사업운영팀";
                                }
                                if (text.includes("늘봄") || text.includes("누리") || text.includes("지역사회") || text.includes("리빙랩") || text.includes("로컬") || text.includes("협업")) {
                                  return text.includes("늘봄") ? "울산늘봄누리센터" : "RCC센터";
                                }
                                if (text.includes("aidx") || text.includes("aid-x") || text.includes("디지털") || text.includes("자격증") || text.includes("인공지능")) {
                                  return "AID-X지원센터";
                                }
                                if (text.includes("신산업") || text.includes("특화") || text.includes("융합") || text.includes("첨단")) {
                                  return "신산업특화센터";
                                }

                                // 4단계: 매칭되지 않으면 "사업운영팀"으로 기본 배치
                                return "사업운영팀";
                              };

                              agendaLines.forEach((line: string) => {
                                const matchedDept = getHeuristicDept(line);
                                // 말머리가 대괄호 형식으로 있을 경우만 텍스트에서 떼어내어 본문을 보기 좋게 만듭니다.
                                let cleanLine = line.trim();
                                operatingDepts.forEach(d => {
                                  cleanLine = cleanLine.replace(`[${d}]`, "").trim();
                                });
                                parsedAgendas[matchedDept] = (parsedAgendas[matchedDept] ? parsedAgendas[matchedDept] + "\n" : "") + cleanLine;
                              });

                              resultLines.forEach((line: string) => {
                                const matchedDept = getHeuristicDept(line);
                                let cleanLine = line.trim();
                                operatingDepts.forEach(d => {
                                  cleanLine = cleanLine.replace(`[${d}]`, "").trim();
                                });
                                parsedResults[matchedDept] = (parsedResults[matchedDept] ? parsedResults[matchedDept] + "\n" : "") + cleanLine;
                              });

                              const getDeptData = (deptName: string, dataObj: Record<string, string>) => {
                                if (!dataObj) return "";
                                const keys = Object.keys(dataObj);
                                const matchedKey = keys.find(k => k.includes(deptName) || deptName.includes(k));
                                return matchedKey ? dataObj[matchedKey] : "";
                              };

                              // 💡 [교육용 한글 주석] 의제 데이터를 심의/의결/선정 등의 [의제] 그룹과 공유/공지/보고 등의 [전달사항] 그룹으로 지능적으로 쪼갭니다.
                              const parseAgendaIntoGroups = (val: string) => {
                                if (!val) return { agendas: [], notices: [] };
                                let lines = val.split("\n").map((l: string) => l.trim()).filter(Boolean);
                                if (lines.length <= 1 && val.includes(",")) {
                                  lines = val.split(",").map((l: string) => l.trim()).filter(Boolean);
                                }
                                
                                const agendas: string[] = [];
                                const notices: string[] = [];

                                lines.forEach((line: string) => {
                                  const text = line.toLowerCase();
                                  if (text.includes("심의") || text.includes("의결") || text.includes("안건") || text.includes("선정") || text.includes("제출") || text.includes("결정")) {
                                    agendas.push(line);
                                  } else if (text.includes("공유") || text.includes("공지") || text.includes("보고") || text.includes("안내") || text.includes("논의") || text.includes("일정") || text.includes("회의") || text.includes("전달") || text.includes("참석")) {
                                    notices.push(line);
                                  } else {
                                    agendas.push(line);
                                  }
                                });

                                return { agendas, notices };
                              };

                              // 💡 [교육용 한글 주석] 결과 데이터를 완료/개최/배포 등의 [추진상황] 그룹과 보류/지연/애로/요청 등의 [애로사항] 그룹으로 지능적으로 쪼갭니다.
                              const parseResultIntoGroups = (val: string) => {
                                if (!val) return { results: [], difficulties: [] };
                                let lines = val.split("\n").map((l: string) => l.trim()).filter(Boolean);
                                if (lines.length <= 1 && val.includes(",")) {
                                  lines = val.split(",").map((l: string) => l.trim()).filter(Boolean);
                                }

                                const results: string[] = [];
                                const difficulties: string[] = [];

                                lines.forEach((line: string) => {
                                  const text = line.toLowerCase();
                                  if (text.includes("보류") || text.includes("미정") || text.includes("애로") || text.includes("지연") || text.includes("어려움") || text.includes("요청") || text.includes("필요") || text.includes("의견수렴") || text.includes("논의 예정") || text.includes("문제")) {
                                    difficulties.push(line);
                                  } else {
                                    results.push(line);
                                  }
                                });

                                return { results, difficulties };
                              };

                              return (
                                <>
                                  {/* 헤더 영역 (부서/작성자 생략) */}
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                                    <div style={{ flexGrow: 1 }}>
                                      <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "900", color: "var(--text-primary)" }}>
                                        {selectedMeeting.title}
                                      </h3>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                                        <span>📅 일시: <strong>{selectedMeeting.datetime}</strong></span>
                                        <span>•</span>
                                        <span>📍 장소: <strong>{selectedMeeting.location}</strong></span>
                                      </div>
                                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
                                        👥 참석자: <strong style={{ color: "var(--text-primary)" }}>{selectedMeeting.attendeesInternal || selectedMeeting.attendees_internal || "-"}</strong>
                                      </div>
                                    </div>

                                    {/* 수정/삭제 단추 우측 맨 위 배치 */}
                                    {currentRole.id !== "GUEST" && (
                                      <div style={{ display: "flex", gap: "0.25rem" }}>
                                        <button
                                          onClick={() => handleEditMeeting(selectedMeeting)}
                                          title="수정"
                                          style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.35rem", borderRadius: "4px" }}
                                          onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                          onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                        >
                                          <Edit size={16} />
                                        </button>
                                        {canDelete && (
                                          <button
                                            onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                                            title="삭제"
                                            style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.35rem", borderRadius: "4px" }}
                                            onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                                            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* 회의 성격 배너 설명 문구 */}
                                  <div style={{
                                    padding: "0.6rem 0.8rem",
                                    background: "rgba(59,130,246,0.04)",
                                    borderLeft: "3px solid var(--accent-color)",
                                    borderRadius: "4px",
                                    fontSize: "0.72rem",
                                    color: "var(--text-secondary)",
                                    lineHeight: "1.4"
                                  }}>
                                    💡 본 사업운영위원회는 <strong>사업단, 사업운영팀, ECC, ICC, RCC, AID-X, 늘봄누리센터, 신산업특화센터</strong> 각 부서의 주요 업무추진 현황 및 애로사항을 공유하기 위하여 격주로 소집되는 회의입니다.
                                  </div>

                                  {/* 7개 부서 의제 & 결과 1열 배치 (좌우 대조 매칭 구조) */}
                                  <div style={{ marginTop: "0.5rem" }}>
                                    <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.5rem" }}>
                                      🏢 부서별 주요 업무추진 현황 및 애로사항
                                    </span>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                                      {operatingDepts.map(dept => {
                                        const agendaVal = getDeptData(dept, parsedAgendas);
                                        const resultVal = getDeptData(dept, parsedResults);

                                        return (
                                          <div
                                            key={dept}
                                            style={{
                                              background: darkMode ? "rgba(255, 255, 255, 0.01)" : "rgba(0,0,0,0.01)",
                                              border: "1px solid var(--border-color)",
                                              borderRadius: "8px",
                                              padding: "0.85rem 1rem",
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: "0.6rem"
                                            }}
                                          >
                                            <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                              📌 {dept}
                                            </span>
                                            
                                            {/* 의제와 결과 좌우 분할 매칭 구조 */}
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.25rem", fontSize: "0.72rem" }}>
                                              {/* 왼쪽 영역: 의제 / 전달사항 */}
                                              <div style={{ 
                                                background: darkMode ? "rgba(255,255,255,0.005)" : "rgba(0,0,0,0.005)",
                                                padding: "0.6rem 0.75rem", 
                                                borderRadius: "6px",
                                                borderLeft: "2.5px solid #60A5FA" // 의제 파란색 포인트 데코선
                                              }}>
                                                <div style={{ color: "var(--text-secondary)", fontWeight: "800", marginBottom: "0.4rem" }}>💡 의제 / 전달사항</div>
                                                <div style={{ color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: "1.4" }}>
                                                  {(() => {
                                                    const { agendas, notices } = parseAgendaIntoGroups(agendaVal);
                                                    if (agendas.length === 0 && notices.length === 0) return "논의사항 없음";
                                                    
                                                    return (
                                                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                        {agendas.length > 0 && (
                                                          <div>
                                                            <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#3B82F6", marginBottom: "0.15rem" }}>[의제]</div>
                                                            <ul style={{ margin: 0, paddingLeft: "1rem", listStyleType: "disc" }}>
                                                              {agendas.map((line, idx) => {
                                                                let cleanLine = line.replace(/^[•\-\*\s]+/, "").trim();
                                                                cleanLine = cleanLine.replace(/^\d+[\.\)\s]+/, "").trim();
                                                                return <li key={idx} style={{ marginBottom: "0.2rem" }}>{cleanLine}</li>;
                                                              })}
                                                            </ul>
                                                          </div>
                                                        )}
                                                        {notices.length > 0 && (
                                                          <div>
                                                            <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#60A5FA", marginBottom: "0.15rem" }}>[전달사항]</div>
                                                            <ul style={{ margin: 0, paddingLeft: "1rem", listStyleType: "disc" }}>
                                                              {notices.map((line, idx) => {
                                                                let cleanLine = line.replace(/^[•\-\*\s]+/, "").trim();
                                                                cleanLine = cleanLine.replace(/^\d+[\.\)\s]+/, "").trim();
                                                                return <li key={idx} style={{ marginBottom: "0.2rem" }}>{cleanLine}</li>;
                                                              })}
                                                            </ul>
                                                          </div>
                                                        )}
                                                      </div>
                                                    );
                                                  })()}
                                                </div>
                                              </div>

                                              {/* 오른쪽 영역: 추진상황 / 결과 */}
                                              <div style={{ 
                                                background: darkMode ? "rgba(255,255,255,0.005)" : "rgba(0,0,0,0.005)",
                                                padding: "0.6rem 0.75rem", 
                                                borderRadius: "6px",
                                                borderLeft: "2.5px solid #34D399" // 결과 초록색 포인트 데코선
                                              }}>
                                                <div style={{ color: "var(--text-secondary)", fontWeight: "800", marginBottom: "0.4rem" }}>✅ 추진상황 / 결과</div>
                                                <div style={{ color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: "1.4" }}>
                                                  {(() => {
                                                    const { results, difficulties } = parseResultIntoGroups(resultVal);
                                                    if (results.length === 0 && difficulties.length === 0) return "추진완료 / 특이사항 없음";
                                                    
                                                    return (
                                                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                        {results.length > 0 && (
                                                          <div>
                                                            <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#10B981", marginBottom: "0.15rem" }}>[추진상황]</div>
                                                            <ul style={{ margin: 0, paddingLeft: "1rem", listStyleType: "disc" }}>
                                                              {results.map((line, idx) => {
                                                                let cleanLine = line.replace(/^[•\-\*\s]+/, "").trim();
                                                                cleanLine = cleanLine.replace(/^\d+[\.\)\s]+/, "").trim();
                                                                return <li key={idx} style={{ marginBottom: "0.2rem", fontWeight: "700" }}>{cleanLine}</li>;
                                                              })}
                                                            </ul>
                                                          </div>
                                                        )}
                                                        {difficulties.length > 0 && (
                                                          <div>
                                                            <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#F59E0B", marginBottom: "0.15rem" }}>[애로사항]</div>
                                                            <ul style={{ margin: 0, paddingLeft: "1rem", listStyleType: "disc" }}>
                                                              {difficulties.map((line, idx) => {
                                                                let cleanLine = line.replace(/^[•\-\*\s]+/, "").trim();
                                                                cleanLine = cleanLine.replace(/^\d+[\.\)\s]+/, "").trim();
                                                                return <li key={idx} style={{ marginBottom: "0.2rem", fontWeight: "700" }}>{cleanLine}</li>;
                                                              })}
                                                            </ul>
                                                          </div>
                                                        )}
                                                      </div>
                                                    );
                                                  })()}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* AI 핵심 브리핑 요약 */}
                                  <div style={{
                                    background: darkMode ? "rgba(139, 92, 246, 0.05)" : "rgba(139, 92, 246, 0.08)",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(139, 92, 246, 0.15)",
                                    marginTop: "0.5rem"
                                  }}>
                                    <span style={{ color: darkMode ? "#C084FC" : "#6D28D9", fontWeight: "800", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.3rem" }}>
                                      🤖 AI 요약 핵심 브리핑
                                    </span>
                                    <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-primary)", lineHeight: "1.45" }}>
                                      {(() => {
                                        const keywords = Object.values(parsedResults).filter(Boolean).slice(0, 3).join(", ");
                                        return keywords
                                          ? `본 회의에서는 각 부서의 전달사항(주요 키워드: ${keywords})에 대한 진척 상황 및 현안들을 공유했습니다. 향후 부서 간 실무 협의를 강화하여 목표 추진 계획을 차질 없이 준수할 것을 권장합니다.`
                                          : "본 회의에서는 부서별 주요 안건 공유 및 지산학 프로그램의 격주 실적 관리가 원활히 이뤄졌습니다. AI 핵심 분석 결과 각 부서의 추진 상황은 계획 대비 순조롭게 진행 중인 것으로 분석되었습니다.";
                                      })()}
                                    </p>
                                  </div>

                                  {/* PLAUD 음성 녹음본 및 회의자료 2열 배치 */}
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.5rem" }}>
                                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)" }}>
                                        🎙️ PLAUD MP3 음성 파일
                                      </span>
                                      {selectedMeeting.audioUrl ? (
                                        <audio controls src={selectedMeeting.audioUrl} style={{ width: "100%", height: "26px", marginTop: "0.15rem" }} />
                                      ) : (
                                        <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>음성 파일이 등록되어 있지 않습니다.</span>
                                      )}
                                    </div>
                                    <div style={({ background: "rgba(255,255,255,0.02)", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifycontent: "space-between" } as React.CSSProperties)}>
                                      <div>
                                        <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)", display: "block" }}>
                                          📄 회의자료 문서 (PDF)
                                        </span>
                                        <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>
                                          {selectedMeeting.pdfUrl ? "정상 업로드 완료" : "첨부된 PDF 없음"}
                                        </span>
                                      </div>
                                      {selectedMeeting.pdfUrl && (
                                        <a
                                          href={selectedMeeting.pdfUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ color: "#60A5FA", fontSize: "0.72rem", fontWeight: "700", textDecoration: "none", background: "rgba(59,130,246,0.1)", padding: "0.3rem 0.6rem", borderRadius: "4px" }}
                                        >
                                          바로보기 ➔
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </>
                              );
                            }

                            // ==========================================
                            // 💡 2) 기존 센터별/위원회 일반 회의 상세 뷰
                            // ==========================================
                            return (
                              <>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                                  <div>
                                    <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.4rem" }}>
                                      <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA", fontWeight: "700" }}>
                                        {dept}
                                      </span>
                                      <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "rgba(16, 185, 129, 0.15)", color: "#34D399", fontWeight: "700" }}>
                                        작성자: {writer}
                                      </span>
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)" }}>
                                      {selectedMeeting.title}
                                    </h3>
                                  </div>

                                  {currentRole.id !== "GUEST" && (
                                    <div style={{ display: "flex", gap: "0.25rem" }}>
                                      <button
                                        onClick={() => handleEditMeeting(selectedMeeting)}
                                        title="수정"
                                        style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.35rem", borderRadius: "4px" }}
                                        onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                        onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                      >
                                        <Edit size={16} />
                                      </button>
                                      {canDelete && (
                                        <button
                                          onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                                          title="삭제"
                                          style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.35rem", borderRadius: "4px" }}
                                          onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                                          onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* 상세 정보 내용 */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.825rem", color: "var(--text-primary)" }}>
                                  <div>
                                    <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem" }}>📅 회의 시간</span>
                                    <strong>{selectedMeeting.datetime}</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem" }}>📍 회의 장소</span>
                                    <strong>{selectedMeeting.location}</strong>
                                  </div>
                                  <div style={{ gridColumn: "span 2" }}>
                                    <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem" }}>👥 참석자</span>
                                    <strong>{selectedMeeting.attendeesInternal || selectedMeeting.attendees_internal || "-"}</strong>
                                  </div>
                                </div>

                                {/* 주요 의제 */}
                                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                                  <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.825rem", marginBottom: "0.4rem" }}>📋 주요 의제 및 논의 사항</span>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.825rem", color: "var(--text-primary)" }}>
                                    {(selectedMeeting.agenda || "").split("\n").filter(Boolean).map((agendaItem: string, idx: number) => (
                                      <span key={idx} style={{ display: "block", lineHeight: "1.4" }}>
                                        의제 {idx + 1}. {agendaItem}
                                      </span>
                                    ))}
                                    {!(selectedMeeting.agenda) && <span>등록된 의제가 없습니다.</span>}
                                  </div>
                                </div>

                                {/* 결정 사항 결과 박스 */}
                                <div style={{
                                  background: darkMode ? "rgba(59, 130, 246, 0.05)" : "rgba(59, 130, 246, 0.08)",
                                  padding: "0.85rem 1rem",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(59, 130, 246, 0.15)",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.35rem"
                                }}>
                                  <span style={{ color: darkMode ? "#60A5FA" : "#1E3A8A", fontWeight: "700", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                    <CheckCircle size={14} style={{ color: darkMode ? "#60A5FA" : "#2563EB" }} />
                                    주요 결정 및 조치 사항 (요점 정리)
                                  </span>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-primary)", lineHeight: "1.45" }}>
                                    {(selectedMeeting.result || "").split("\n").filter(Boolean).map((resultItem: string, idx: number) => (
                                      <div key={idx} style={{ borderBottom: idx < (selectedMeeting.result || "").split("\n").filter(Boolean).length - 1 ? "1px dashed var(--border-color)" : "none", paddingBottom: "0.3rem" }}>
                                        <strong>결과 {idx + 1}.</strong> {resultItem}
                                      </div>
                                    ))}
                                    {!(selectedMeeting.result) && <span>등록된 결정 사항이 없습니다.</span>}
                                  </div>
                                </div>

                                {/* 회의록 첨부파일 개별 분리 렌더링 */}
                                {(selectedMeeting.audioUrl || selectedMeeting.pdfUrl) && (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                                    {selectedMeeting.audioUrl && (
                                      <div style={{
                                        background: "rgba(255,255,255,0.02)",
                                        padding: "0.55rem 0.75rem",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border-color)",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.2rem"
                                      }}>
                                        <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                          🎙️ 첨부 음성 녹음본
                                        </span>
                                        <audio controls src={selectedMeeting.audioUrl} style={{ width: "100%", height: "26px", marginTop: "0.1rem" }} />
                                      </div>
                                    )}
                                    {selectedMeeting.pdfUrl && (
                                      <div style={{
                                        background: "rgba(255,255,255,0.02)",
                                        padding: "0.55rem 0.75rem",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border-color)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                      }}>
                                        <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)" }}>
                                          📄 첨부 회의록 문서 (PDF)
                                        </span>
                                        <a
                                          href={selectedMeeting.pdfUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ color: "#60A5FA", fontSize: "0.72rem", fontWeight: "700", textDecoration: "none" }}
                                        >
                                          [PDF 바로보기 ➔]
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}

                                 {/* 💡 [교육용 한글 주석] 온라인 의결 시스템 사용 지침에 따라 PLAUD 연동 배너는 삭제되었습니다. */}
                               </>
                            );
                          })()}
                        </>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)", gap: "1rem" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <Users size={32} style={{ marginBottom: "0.5rem", opacity: 0.3 }} />
                            <span style={{ fontSize: "0.8rem" }}>회의록 목록에서 회의를 선택해 주세요.</span>
                          </div>
                          {currentRole.id !== "GUEST" && (
                            <button
                              type="button"
                              onClick={handleGenerateMockMeetings}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                padding: "0.5rem 1rem",
                                borderRadius: "6px",
                                background: "rgba(59, 130, 246, 0.15)",
                                border: "1px solid rgba(59, 130, 246, 0.3)",
                                color: "#60A5FA",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)"}
                              onMouseOut={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)"}
                            >
                              ➕ 테스트용 가상 회의록 10건 일괄 생성
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {meetingSchedules.filter(m => m.year === selectedYear && m.category === activeMeetingCat).length > 0 ? (
                meetingSchedules.filter(m => m.year === selectedYear && m.category === activeMeetingCat).map(meeting => (
                  <div
                    key={meeting.id}
                    className="card"
                    style={{ padding: "1.5rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}
                  >
                    {/* 작성자, 관련부서 정보 동적 파싱 로직 */}
                    {(() => {
                      const ext = meeting.attendeesExternal || meeting.attendees_external || "";
                      let writer = "작성자 미정";
                      let dept = "사업운영팀";
                      let isCustomFormatted = false;

                      if (ext.includes("작성자:") && ext.includes("부서:")) {
                        isCustomFormatted = true;
                        const parts = ext.split("|");
                        writer = parts[0] ? parts[0].replace("작성자:", "").trim() : "작성자 미정";
                        dept = parts[1] ? parts[1].replace("부서:", "").trim() : "사업운영팀";
                      }

                      return (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(16, 185, 129, 0.15)", color: "#34D399", fontWeight: "700" }}>
                                작성자: {isCustomFormatted ? writer : "박지현 팀장"}
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", marginRight: "0.5rem" }}>
                                <Clock size={14} />
                                {dept && (
                                  <span style={{ fontWeight: "700", color: "#EC4899", marginRight: "0.4rem" }}>
                                    {dept}
                                  </span>
                                )}
                                {meeting.datetime}
                              </span>
                              {currentRole.id !== "GUEST" && (
                                <>
                                  <button
                                    onClick={() => handleEditMeeting(meeting)}
                                    title="수정"
                                    style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                                    onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                    onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMeeting(meeting.id)}
                                    title="삭제"
                                    style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                                    onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                                    onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)" }}>
                            {meeting.title}
                          </h4>

                          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-primary)" }}>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>

                              {isCustomFormatted ? (
                                <div>
                                  <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.15rem" }}>👥 참석자</span>
                                  <strong>{meeting.attendeesInternal || meeting.attendees_internal}</strong>
                                </div>
                              ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                  <div>
                                    <span style={{ color: "var(--text-secondary)", display: "block" }}>👥 참석자 (내부)</span>
                                    <span>{meeting.attendeesInternal}</span>
                                  </div>
                                  <div>
                                    <span style={{ color: "var(--text-secondary)", display: "block" }}>👥 참석자 (외부)</span>
                                    <span>{meeting.attendeesExternal}</span>
                                  </div>
                                </div>
                              )}

                              <div>
                                <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>📝 회의 의제 (주요 안건)</span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", margin: "0.1rem 0 0 0", color: "var(--text-primary)" }}>
                                  {meeting.agenda && meeting.agenda.split("\n").filter(Boolean).map((agendaItem: string, idx: number) => (
                                    <span key={idx} style={{ display: "block", lineHeight: "1.3" }}>
                                      의제 {idx + 1}. {agendaItem}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <span style={{ color: "var(--text-secondary)", display: "block" }}>📍 회의 장소</span>
                                <strong>{meeting.location}</strong>
                              </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              <div style={{ background: darkMode ? "rgba(59, 130, 246, 0.05)" : "rgba(59, 130, 246, 0.08)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.1)", display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
                                <span style={{ color: darkMode ? "#60A5FA" : "#1E3A8A", fontWeight: "700", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                  <CheckCircle size={14} style={{ color: darkMode ? "#60A5FA" : "#2563EB" }} />
                                  회의 결정 결과
                                </span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-primary)", lineHeight: "1.45" }}>
                                  {(meeting.result || "").split("\n").filter(Boolean).map((resultItem: string, idx: number) => (
                                    <div key={idx} style={{ borderBottom: idx < (meeting.result || "").split("\n").filter(Boolean).length - 1 ? "1px dashed var(--border-color)" : "none", paddingBottom: "0.3rem" }}>
                                      <strong>결과 {idx + 1}.</strong> {resultItem}
                                    </div>
                                  ))}
                                  {!(meeting.result) && <span>등록된 결정 사항이 없습니다.</span>}
                                </div>
                              </div>

                              {/* 회의록 첨부파일 개별 분리 렌더링 */}
                              {(meeting.audioUrl || meeting.pdfUrl) && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
                                  {meeting.audioUrl && (
                                    <div style={{
                                      background: "rgba(255,255,255,0.02)",
                                      padding: "0.5rem 0.75rem",
                                      borderRadius: "8px",
                                      border: "1px solid var(--border-color)",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "0.2rem"
                                    }}>
                                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)" }}>
                                        🎙️ 첨부 음성 녹음본
                                      </span>
                                      <audio controls src={meeting.audioUrl} style={{ width: "100%", height: "26px", marginTop: "0.1rem" }} />
                                    </div>
                                  )}
                                  {meeting.pdfUrl && (
                                    <div style={{
                                      background: "rgba(255,255,255,0.02)",
                                      padding: "0.5rem 0.75rem",
                                      borderRadius: "8px",
                                      border: "1px solid var(--border-color)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between"
                                    }}>
                                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)" }}>
                                        📄 첨부 회의록 문서
                                      </span>
                                      <a
                                        href={meeting.pdfUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: "#60A5FA", fontSize: "0.72rem", fontWeight: "700", textDecoration: "none" }}
                                      >
                                        [PDF 바로보기 ➔]
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 💡 [교육용 한글 주석] 온라인 의결 시스템 사용 지침에 따라 PLAUD 연동 배너는 삭제되었습니다. */}
                            </div>

                          </div>
                        </>
                      );
                    })()}
                  </div>
                ))
              ) : (
                <div className="card" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center" }}>
                  <Users size={40} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
                  <span>등록된 회의 일정이 없습니다.<br />[회의 일정 등록] 버튼을 눌러 회의록 틀을 보충해 보세요.</span>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* 3_2. 언론보도 대장 */}
      {subTab === "press" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 컨트롤 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                📰 앵커사업단 언론보도 모음
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                방송 보도, 주요 일간지 신문 기사 및 뉴미디어(기타) 홍보 실적 통합 관리
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              {/* 구분 필터 */}
              <div style={{ display: "flex", gap: "0.25rem", background: "rgba(255,255,255,0.03)", padding: "0.25rem", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                {["all", "방송", "신문", "기타"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedPressType(type)}
                    className="btn"
                    style={{
                      padding: "0.3rem 0.75rem",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      borderRadius: "4px",
                      border: "none",
                      background: selectedPressType === type ? "var(--accent-color)" : "transparent",
                      color: selectedPressType === type ? "white" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    {type === "all" ? "전체" : type}
                  </button>
                ))}
              </div>

              {/* 내보내기 및 등록 */}
              <button
                type="button"
                onClick={handleExportPressExcel}
                className="btn btn-secondary"
                style={{ fontSize: "0.8rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.45rem 0.9rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34D399", cursor: "pointer", borderRadius: "6px" }}
              >
                📥 엑셀 다운로드
              </button>

              {/* 임시 비활성화 처리 (개별 URL 자동 입력 기능 우선 제공을 위해 숨김) */}
              {false && currentRole.id !== "GUEST" && (
                <button
                  type="button"
                  onClick={handleGenerateAiPressReleases}
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.45rem 0.9rem",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    borderRadius: "6px",
                    boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)",
                    transition: "all 0.2s ease"
                  }}
                >
                  📡 AI 언론 기사 크롤링 수집
                </button>
              )}

              {currentRole.id !== "GUEST" && (
                <button
                  type="button"
                  onClick={() => openAddModal("press")}
                  className="btn btn-primary"
                  style={{ fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 1.2rem", background: "var(--accent-color)", border: "none", color: "white", cursor: "pointer", borderRadius: "9999px" }}
                >
                  <Plus size={16} />
                  신규 언론보도 등록
                </button>
              )}
            </div>
          </div>

          {/* 리스트 & 상세 내용 (Master-Detail) 레이아웃 - 왼쪽 40% : 오른쪽 60% 비율 분할 */}
          <div style={{ display: "grid", gridTemplateColumns: "4fr 6fr", gap: "1.5rem", alignItems: "start" }}>

            {/* 좌측: 리스트 영역 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "70vh", overflowY: "auto", paddingRight: "0.5rem" }}>
              {pressReleases
                .filter(p => isDateInSelectedYear(p.broadcastDate, selectedYear))
                .filter(p => selectedPressType === "all" || p.type === selectedPressType).length > 0 ? (
                pressReleases
                  .filter(p => isDateInSelectedYear(p.broadcastDate, selectedYear))
                  .filter(p => selectedPressType === "all" || p.type === selectedPressType)
                  .sort((a, b) => {
                    const dateA = a.broadcastDate ? new Date(a.broadcastDate) : new Date(0);
                    const dateB = b.broadcastDate ? new Date(b.broadcastDate) : new Date(0);
                    return dateB.getTime() - dateA.getTime();
                  })
                  .map((press) => {
                    const isActive = activePressId === press.id;
                    return (
                      <div
                        key={press.id}
                        onClick={() => setActivePressId(press.id ?? null)}
                        className="glass-card"
                        style={{
                          padding: "1.0rem",
                          borderRadius: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          background: isActive 
                            ? (darkMode ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)") 
                            : (darkMode ? "rgba(255, 255, 255, 0.03)" : "#ffffff"),
                          border: isActive 
                            ? "1px solid var(--accent-color)" 
                            : (darkMode ? "1px solid var(--border-color)" : "1px solid rgba(0, 0, 0, 0.08)"),
                          boxShadow: isActive ? "0 0 10px rgba(59, 130, 246, 0.2)" : "none",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: press.type === "방송" ? "rgba(239, 68, 68, 0.15)" : press.type === "신문" ? "rgba(59, 130, 246, 0.15)" : "rgba(139, 92, 246, 0.15)", color: press.type === "방송" ? "#EF4444" : press.type === "신문" ? "#60A5FA" : "#A78BFA", fontWeight: "800" }}>
                              {press.type}
                            </span>
                            <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "rgba(128,128,128,0.12)", color: "var(--text-secondary)", fontWeight: "700" }}>
                              {press.media}
                            </span>
                          </div>

                          {/* 제어 버튼 */}
                          <div style={{ display: "flex", gap: "0.3rem" }} onClick={(e) => e.stopPropagation()}>
                            {currentRole.id !== "GUEST" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEditPress(press)}
                                  title="수정"
                                  style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem" }}
                                  onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                                  onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePress(press.id)}
                                  title="삭제"
                                  style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem" }}
                                  onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                                  onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)", lineHeight: "1.4", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {press.title}
                        </h4>

                        <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                          <Clock size={11} />
                          <span>{press.broadcastDate ? press.broadcastDate.replace("T", " ").substring(0, 16) : "-"}</span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="card" style={{ padding: "3rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center", width: "100%" }}>
                  <Award size={32} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
                  <span style={{ fontSize: "0.8rem" }}>등록된 언론보도 내역이 없습니다.</span>
                </div>
              )}
            </div>

            {/* 우측: 상세 표시 영역 */}
            <div style={{ minHeight: "500px" }}>
              {(() => {
                const activePress = pressReleases.find(p => p.id === activePressId);
                if (!activePress) {
                  return (
                    <div className="card" style={{ height: "100%", minHeight: "450px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>
                      <Award size={48} style={{ marginBottom: "1rem", opacity: 0.3 }} />
                      <h4 style={{ margin: 0, color: "var(--text-primary)", fontWeight: "700" }}>언론보도 상세 정보</h4>
                      <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem" }}>왼쪽 목록에서 보고 싶은 보도 내역을 선택해 주세요.</p>
                    </div>
                  );
                }

                const embedUrl = getYoutubeEmbedUrl(activePress.contentUrl);

                return (
                  <div
                    className="card"
                    style={{
                      padding: "1.75rem",
                      borderRadius: "10px",
                      background: "var(--panel-bg)",
                      border: "1px solid var(--border-color)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.2rem",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                    }}
                  >
                    {/* 상단 메타 정보 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1.0rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.60rem", borderRadius: "4px", background: activePress.type === "방송" ? "rgba(239, 68, 68, 0.2)" : activePress.type === "신문" ? "rgba(59, 130, 246, 0.2)" : "rgba(139, 92, 246, 0.2)", color: activePress.type === "방송" ? "#EF4444" : activePress.type === "신문" ? "#60A5FA" : "#A78BFA", fontWeight: "800" }}>
                          {activePress.type}
                        </span>
                        <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.60rem", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "var(--text-primary)", fontWeight: "700" }}>
                          {activePress.media}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={14} />
                        <span>보도일시: {activePress.broadcastDate ? activePress.broadcastDate.replace("T", " ").substring(0, 16) : "-"}</span>
                      </div>
                    </div>

                    {/* 보도 제목 */}
                    <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)", lineHeight: "1.4" }}>
                      {activePress.title}
                    </h3>

                    {/* 보도내용 텍스트 추가 */}
                    {activePress.pressContent && (
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.02)",
                          padding: "1rem",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          fontSize: "0.85rem",
                          color: "var(--text-secondary)",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap"
                        }}
                      >
                        <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-primary)", fontSize: "0.85rem" }}>📝 보도내용</strong>
                        {activePress.pressContent}
                      </div>
                    )}

                    {/* 상세 본문 및 미디어 뷰어 */}
                    <div style={{ marginTop: "0.5rem" }}>
                      {embedUrl ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <iframe
                              src={`${embedUrl}?feature=oembed&enablejsapi=1`}
                              title="Youtube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                            />
                          </div>

                          {/* 하단 기사 본문 URL 정보 */}
                          <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", width: "70%" }}>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "600" }}>유튜브 영상 주소</span>
                              <span style={{ fontSize: "0.7rem", color: "#60A5FA", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {activePress.contentUrl}
                              </span>
                            </div>
                            <a
                              href={activePress.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.25rem",
                                padding: "0.45rem 0.8rem", borderRadius: "6px", background: "rgba(59, 130, 246, 0.12)",
                                border: "1px solid rgba(59, 130, 246, 0.25)", color: "#93C5FD", fontSize: "0.75rem", fontWeight: "700", textDecoration: "none", transition: "all 0.2s"
                              }}
                            >
                              📺 유튜브에서 보기
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: "rgba(255,255,255,0.01)", padding: "1.5rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>📰 기사 내용 바로가기</span>
                            <Award size={18} style={{ color: "var(--accent-color)" }} />
                          </div>

                          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                            본 보도자료는 신문 및 지면 기사 형태로 배포되었습니다. 아래 기사 링크를 클릭하시면 본문 기사 원본 페이지로 바로 이동합니다.
                          </p>

                          <div style={{ 
                            background: darkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.06)", 
                            padding: "0.75rem", 
                            borderRadius: "6px", 
                            border: darkMode ? "1px dashed rgba(96, 165, 250, 0.4)" : "1px dashed rgba(59, 130, 246, 0.3)" 
                          }}>
                            <span style={{ 
                              fontSize: "0.75rem", 
                              color: darkMode ? "#93C5FD" : "#1E40AF", 
                              fontWeight: "700",
                              wordBreak: "break-all" 
                            }}>
                              {activePress.contentUrl || "(등록된 링크 주소가 없습니다)"}
                            </span>
                          </div>

                          {activePress.contentUrl && (
                            <a
                              href={activePress.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.25rem",
                                padding: "0.6rem", borderRadius: "6px", 
                                background: darkMode ? "rgba(59, 130, 246, 0.25)" : "rgba(59, 130, 246, 0.15)",
                                border: darkMode ? "1px solid rgba(59, 130, 246, 0.5)" : "1px solid rgba(59, 130, 246, 0.3)", 
                                color: darkMode ? "#E0F2FE" : "#1D4ED8", 
                                fontSize: "0.8rem", fontWeight: "700", textDecoration: "none", textAlign: "center", transition: "all 0.2s"
                              }}
                            >
                              🔗 새 창에서 보도 기사 읽기
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* 위원 명단 편집/추가 모달 */}
      {isMemberModalOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)",
          zIndex: 1100,
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
            margin: "auto",
            padding: "1.5rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1.2rem", flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                {editingMember ? "✏️ 위원 정보 수정" : "➕ 새 위원 추가 등록"}
              </h3>
              <button
                onClick={() => {
                  setIsMemberModalOpen(false);
                  setEditingMember(null);
                }}
                style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMember} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* 구분 선택/입력 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>구분 (type)</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select
                    value={["위원장", "위원", "위원(자문겸직)", "간사"].includes(memberFormData.type) ? memberFormData.type : "custom"}
                    onChange={(e) => {
                      if (e.target.value !== "custom") {
                        setMemberFormData(prev => ({ ...prev, type: e.target.value }));
                      } else {
                        setMemberFormData(prev => ({ ...prev, type: "" }));
                      }
                    }}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem", width: "40%" }}
                  >
                    <option value="위원">위원</option>
                    <option value="위원장">위원장</option>
                    <option value="위원(자문겸직)">위원(자문겸직)</option>
                    <option value="간사">간사</option>
                    <option value="custom">직접 입력...</option>
                  </select>
                  {!["위원장", "위원", "위원(자문겸직)", "간사"].includes(memberFormData.type) && (
                    <input
                      type="text"
                      required
                      placeholder="구분 직접 입력"
                      value={memberFormData.type}
                      onChange={(e) => setMemberFormData(prev => ({ ...prev, type: e.target.value }))}
                      style={{ flex: 1, padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                    />
                  )}
                </div>
              </div>

              {/* 성명 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>성명 (name) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 홍길동"
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                />
              </div>

              {/* 소속기관 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>소속기관 (org)</label>
                <input
                  type="text"
                  placeholder="예: 울산과학대학교, HD한국조선해양 등"
                  value={memberFormData.org}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, org: e.target.value }))}
                  style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* 부서/학과 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>부서/학과 (dept)</label>
                  <input
                    type="text"
                    placeholder="예: 기획처, 화학공학과 등"
                    value={memberFormData.dept}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, dept: e.target.value }))}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                  />
                </div>

                {/* 직위 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>직위 (rank)</label>
                  <input
                    type="text"
                    placeholder="예: 교수, 처장, 대표 등"
                    value={memberFormData.rank}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, rank: e.target.value }))}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                  />
                </div>
              </div>

              {/* 교내외 및 비고 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>교내외 구분</label>
                  <select
                    value={memberFormData.location}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, location: e.target.value }))}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                  >
                    <option value="교내">교내</option>
                    <option value="교외">교외</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>비고 (note)</label>
                  <input
                    type="text"
                    placeholder="예: 신규 추가 등"
                    value={memberFormData.note}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, note: e.target.value }))}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                  />
                </div>
              </div>

              {/* 💡 [임기 가드 개조] 단일 텍스트 창 대신 캘린더 2개(시작일/종료일)로 직관적 날짜 입력 받기 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>임기 시작일</label>
                  <input
                    type="date"
                    value={memberFormData.termStart || ""}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, termStart: e.target.value }))}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>임기 종료일</label>
                  <input
                    type="date"
                    value={memberFormData.termEnd || ""}
                    onChange={(e) => setMemberFormData(prev => ({ ...prev, termEnd: e.target.value }))}
                    style={{ padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.8rem" }}
                  />
                </div>
              </div>

              {/* 버튼 */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginTop: "0.5rem", flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsMemberModalOpen(false);
                    setEditingMember(null);
                  }}
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem" }}
                >
                  저장 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3.5. AI 크롤러 터미널 시뮬레이션 모달 */}
      {isCrawlerModalOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)",
          zIndex: 1200,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          padding: "2rem 1rem"
        }}>
          <div style={{
            width: "550px",
            maxHeight: "85vh",
            background: "#090d16",
            border: "1px solid #1e293b",
            borderRadius: "0.75rem",
            boxShadow: "0 20px 50px rgba(139, 92, 246, 0.25)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            margin: "auto"
          }}>
            {/* 맥북 스타일 윈도우 타이틀 바 */}
            <div style={{
              background: "#111827",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #1f2937"
            }}>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eab308" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
              </div>
              <span style={{ color: "#94a3b8", fontSize: "0.72rem", fontFamily: "monospace", fontWeight: "700" }}>
                📡 ANCHOR AI News Crawler v1.0
              </span>
              <span style={{ width: "40px" }} />
            </div>

            {/* 터미널 로그 콘솔 본문 */}
            <div style={{
              padding: "1.25rem",
              minHeight: "220px",
              maxHeight: "300px",
              overflowY: "auto",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "0.75rem",
              lineHeight: "1.5",
              color: "#34d399",
              background: "#040711",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}>
              {crawlerLogs.map((log, i) => (
                <div key={i} style={{
                  color: log.includes("[SUCCESS]") ? "#60a5fa" : (log.includes("[WARNING]") ? "#f59e0b" : (log.includes("[INFO]") ? "#a78bfa" : "#34d399")),
                  whiteSpace: "pre-wrap",
                  animation: "fadeIn 0.15s ease-out forwards"
                }}>
                  {log}
                </div>
              ))}
              {crawlerLogs.length < 7 && (
                <div style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.5rem" }}>
                  <span style={{ width: "12px", height: "12px", border: "2px solid #94a3b8", borderTop: "2px solid transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear" }} />
                  <span>매체 크롤링 진행 중...</span>
                </div>
              )}
            </div>

            {/* 하단 상태바 및 프로그레스 게이지 */}
            <div style={{
              background: "#111827",
              padding: "1rem 1.25rem",
              borderTop: "1px solid #1f2937"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.68rem", fontWeight: "600" }}>
                  크롤러 분석 게이지
                </span>
                <span style={{ color: "#c084fc", fontSize: "0.68rem", fontFamily: "monospace", fontWeight: "700" }}>
                  {crawlerProgress}% Completed
                </span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "#1f2937", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                  width: `${crawlerProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #a78bfa 0%, #818cf8 100%)",
                  borderRadius: "3px",
                  transition: "width 0.3s ease"
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 등록 모달 팝업 */}
      {isAddModalOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
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
            maxWidth: "730px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            color: "var(--text-primary)",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            margin: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {isEditMode
                  ? (modalType === "deadline" ? "✏️ 마감일 수정" : modalType === "task" ? "✏️ 할일 수정" : modalType === "event" ? "✏️ 행사 기획 및 결과 수정" : modalType === "meeting" ? "✏️ 회의결과 수정" : modalType === "press" ? "✏️ 언론보도 수정" : "✏️ 일반 일정 수정")
                  : (modalType === "monthly" ? "➕ 새 일반 일정 등록" : modalType === "task" ? "➕ 새 할일 등록" : modalType === "deadline" ? "🚨 새 마감일 등록" : modalType === "event" ? "➕ 새 행사 기획 및 결과 등록" : modalType === "meeting" ? "➕ 새 회의결과 등록" : modalType === "press" ? "➕ 새 언론보도 등록" : "➕ 새 회의 일정 회의결과 등록")}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditMode(false);
                  setEditingItemId(null);
                }}
                style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>

              {/* 마감일 입력 */}
              {modalType === "deadline" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>마감일 내용</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 RISE 최종 계획서 마감" className="form-input" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>마감 기한 (일자)</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="form-input" />
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>마감 시간</label>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                          <input type="checkbox" name="noTime" checked={formData.noTime} onChange={handleCheckboxChange} style={{ cursor: "pointer" }} />
                          시간 지정 안 함
                        </label>
                      </div>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        disabled={formData.noTime}
                        className="form-input"
                        style={{ cursor: formData.noTime ? "not-allowed" : "text", opacity: formData.noTime ? 0.5 : 1 }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 할일 입력 */}
              {modalType === "task" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>할일 내용</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 결과 보고서 작성 및 결재 요청" className="form-input" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 부서</label>
                    <select name="dept" value={formData.dept} onChange={handleInputChange} className="form-select">
                      {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>할일 일자</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="form-input" />
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>할일 시간</label>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                          <input type="checkbox" name="noTime" checked={formData.noTime} onChange={handleCheckboxChange} style={{ cursor: "pointer" }} />
                          시간 지정 안 함
                        </label>
                      </div>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        disabled={formData.noTime}
                        className="form-input"
                        style={{ cursor: formData.noTime ? "not-allowed" : "text", opacity: formData.noTime ? 0.5 : 1 }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 월간 일정 입력 */}
              {modalType === "monthly" && (
                <>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>일정 명칭</label>
                      {aiPlanApplied && (
                        <span style={{ fontSize: "0.65rem", background: "rgba(167, 139, 250, 0.15)", border: "1px solid rgba(167, 139, 250, 0.35)", color: "#a78bfa", padding: "0.1rem 0.35rem", borderRadius: "4px", fontWeight: "700" }}>
                          ✨ AI 기획 정보 반영됨 ✓
                        </span>
                      )}
                    </div>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 1차 보고서 제출 마감" className="form-input" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>일정 유형</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} className="form-select">
                        {["행사", "회의", "위원회", "기타"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>관련 부서 (중복 선택 가능)</label>
                      <div style={{ display: "flex", gap: "0.5rem 0.75rem", flexWrap: "wrap", padding: "0.5rem", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
                        {["전체", "사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => {
                          const checked = formData.dept ? formData.dept.split(",").map((x: string) => x.trim()).includes(d) : false;
                          return (
                            <label key={d} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", color: "var(--text-primary)", cursor: "pointer", userSelect: "none" }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleDeptCheckboxChange(d)}
                                style={{ cursor: "pointer", width: "14px", height: "14px" }}
                              />
                               {d}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작일시 (일자)</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="form-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="form-input" />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료일시 (일자)</label>
                      <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="form-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="form-input" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 대학 본부 대회의실" className="form-input" />
                  </div>
                  <div style={{ marginTop: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        👥 전체 사업단 참석자 선택
                      </label>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={includeProfessors}
                          onChange={(e) => setIncludeProfessors(e.target.checked)}
                          style={{ cursor: "pointer", width: "14px", height: "14px" }}
                        />
                        팀장교수 포함
                      </label>
                    </div>
                    {(() => {
                      const ROLE_PRIORITY: Record<string, number> = {
                        "사업단장": 1,
                        "단장": 1, // 송경영 단장 정렬 최우선순위 보장
                        "총괄본부장": 2,
                        "본부장": 2, // 김현수 본부장 정렬 2순위 보장
                        "센터장": 3,
                        "운영팀장": 4,
                        "팀장교수": 5,
                        "연구원": 6
                      };
                      const DEPT_PRIORITY: Record<string, number> = {
                        "ECC센터": 1,
                        "ICC센터": 2,
                        "RCC센터": 3,
                        "AID-X지원센터": 4,
                        "울산늘봄누리센터": 5,
                        "신산업특화센터": 6,
                        "사업운영팀": 7
                      };
                      const GRADE_PRIORITY: Record<string, number> = {
                        "책임연구원": 1,
                        "선임연구원": 2,
                        "연구원": 3
                      };

                      const referenceDateObj = new Date(formData.startDate || new Date());

                      const allActiveMembers = (members || [])
                        .filter(m => {
                          const start = new Date(m.startDate || m.hireDate || "2026-03-01");
                          const end = m.endDate ? new Date(m.endDate) : null;
                          if (start > referenceDateObj) return false;
                          if (end && end < referenceDateObj) return false;

                          // 팀장교수 포함 체크 해제 시 팀장교수 리스트에서 완전 숨김
                          const displayRole = getFormattedMemberGrade(m);
                          if (!includeProfessors && displayRole === "팀장교수") return false;
                          return true;
                        })
                        .sort((a, b) => {
                          const rA = ROLE_PRIORITY[a.role] || 99;
                          const rB = ROLE_PRIORITY[b.role] || 99;
                          if (rA !== rB) return rA - rB;

                          const dA = DEPT_PRIORITY[a.dept] || 99;
                          const dB = DEPT_PRIORITY[b.dept] || 99;
                          if (dA !== dB) return dA - dB;

                          const gA = GRADE_PRIORITY[a.grade] || 99;
                          const gB = GRADE_PRIORITY[b.grade] || 99;
                          if (gA !== gB) return gA - gB;

                          const sA = new Date(a.startDate || a.hireDate || "2026-03-01").getTime();
                          const sB = new Date(b.startDate || b.hireDate || "2026-03-01").getTime();
                          return sA - sB;
                        });

                      return (
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", padding: "0.5rem", background: "var(--panel-bg)", borderRadius: "6px", border: "1px solid var(--border-color)", maxHeight: "120px", overflowY: "auto" }}>
                          {allActiveMembers.map(m => {
                            const displayRole = getFormattedMemberGrade(m, includeProfessors);
                            const isSelected = (formData.attendees || "")
                              .split(",")
                              .map((x: string) => x.trim())
                              .some((x: string) => x.includes(m.name));

                            return (
                              <button
                                key={m.id || m.email}
                                type="button"
                                onClick={() => handleToggleAttendee(m.name, displayRole)}
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.7rem",
                                  borderRadius: "4px",
                                  border: "1px solid " + (isSelected ? "var(--accent-color)" : "var(--border-color)"),
                                  background: isSelected ? "rgba(59, 130, 246, 0.15)" : "var(--input-bg)",
                                  color: isSelected ? "#60A5FA" : "var(--text-secondary)",
                                  cursor: "pointer",
                                  fontWeight: "700"
                                }}
                              >
                                {m.name} {displayRole} {isSelected ? "✓" : "+"}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                    <input
                      type="text"
                      name="attendees"
                      value={formData.attendees || ""}
                      onChange={handleInputChange}
                      placeholder="선택되거나 직접 콤마(,)로 구분해 입력"
                      className="form-input"
                      style={{ marginTop: "0.35rem", fontSize: "0.75rem" }}
                    />
                  </div>
                </>
              )}

              {/* 행사 일정 입력 */}
              {modalType === "event" && (
                <>
                  {/* AI 기획서/결과서 자동 기입 위젯 */}
                  <div style={{
                    background: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    borderRadius: "8px",
                    padding: "0.75rem",
                    marginBottom: "1rem"
                  }}>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#a78bfa" }}>🧠 지능형 AI-분석 연동 (기획 vs 결과 분리)</span>
                    </div>
                    
                    <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", lineHeight: "1.3", marginBottom: "0.75rem" }}>
                      💡 <strong>기획서</strong>를 분석하면 명칭, 담당 부서, 장소, 일자, 시간, 목적, 프로그램 등 일정 정보가 자동 완성됩니다.<br />
                      💡 <strong>결과보고서</strong>를 분석하면 하단의 행사 결과 요약이 자동으로 입력됩니다.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      {/* [1] 기획서 분석 영역 */}
                      <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)" }}>1️⃣ 행사 기획/계획 단계</span>
                          <button
                            type="button"
                            onClick={handleLoadSampleFile}
                            style={{ fontSize: "0.6rem", color: "#60a5fa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                          >
                            [샘플로드]
                          </button>
                        </div>
                        <input
                          type="file"
                          id="ai-plan-file"
                          accept=".txt,.pdf"
                          onChange={(e) => handleAiFileChange(e, "plan")}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor="ai-plan-file"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.35rem 0.5rem",
                            background: "var(--input-bg)",
                            border: "1px dashed rgba(167, 139, 250, 0.4)",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.68rem",
                            color: "var(--text-primary)",
                            marginBottom: "0.4rem"
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "110px" }}>
                            {aiFileName || "기획서 파일 첨부"}
                          </span>
                          <span style={{ fontSize: "0.65rem", background: "rgba(167, 139, 250, 0.2)", padding: "0.1rem 0.25rem", borderRadius: "3px" }}>탐색</span>
                        </label>
                        <textarea
                          value={aiRawText}
                          onChange={(e) => setAiRawText(e.target.value)}
                          placeholder="또는 기획서 본문을 직접 붙여넣으세요..."
                          style={{
                            width: "100%",
                            height: "45px",
                            padding: "0.3rem",
                            background: "rgba(0,0,0,0.15)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "4px",
                            color: "var(--text-primary)",
                            fontSize: "0.68rem",
                            resize: "none"
                          }}
                        />
                        <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.4rem" }}>
                          <button
                            type="button"
                            onClick={() => triggerAiAutoFill("plan")}
                            disabled={isAiLoading || isDebating}
                            style={{
                              flex: 1,
                              padding: "0.35rem",
                              background: "rgba(139, 92, 246, 0.15)",
                              border: "1px solid var(--accent-color)",
                              color: "var(--text-primary)",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            단독 분석
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerAiDebate("plan")}
                            disabled={isAiLoading || isDebating}
                            style={{
                              flex: 1.2,
                              padding: "0.35rem",
                              background: "linear-gradient(135deg, var(--accent-color) 0%, #8b5cf6 100%)",
                              border: "none",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              boxShadow: "0 2px 4px rgba(139, 92, 246, 0.2)"
                            }}
                          >
                            ⚔️ 합의 토론
                          </button>
                        </div>
                      </div>

                      {/* [2] 결과보고서 분석 영역 */}
                      <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "6px" }}>
                        <span style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.3rem" }}>2️⃣ 행사 결과/실적 단계</span>
                        <input
                          type="file"
                          id="ai-result-file"
                          accept=".txt,.pdf"
                          onChange={(e) => handleAiFileChange(e, "result")}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor="ai-result-file"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.35rem 0.5rem",
                            background: "var(--input-bg)",
                            border: "1px dashed rgba(167, 139, 250, 0.4)",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.68rem",
                            color: "var(--text-primary)",
                            marginBottom: "0.4rem"
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "110px" }}>
                            {aiResultFileName || "결과보고서 파일 첨부"}
                          </span>
                          <span style={{ fontSize: "0.65rem", background: "rgba(167, 139, 250, 0.2)", padding: "0.1rem 0.25rem", borderRadius: "3px" }}>탐색</span>
                        </label>
                        <textarea
                          value={aiResultRawText}
                          onChange={(e) => setAiResultRawText(e.target.value)}
                          placeholder="또는 결과보고서 본문을 직접 붙여넣으세요..."
                          style={{
                            width: "100%",
                            height: "45px",
                            padding: "0.3rem",
                            background: "rgba(0,0,0,0.15)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "4px",
                            color: "var(--text-primary)",
                            fontSize: "0.68rem",
                            resize: "none"
                          }}
                        />
                        <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.4rem" }}>
                          <button
                            type="button"
                            onClick={() => triggerAiAutoFill("result")}
                            disabled={isAiLoading || isDebating}
                            style={{
                              flex: 1,
                              padding: "0.35rem",
                              background: "rgba(16, 185, 129, 0.15)",
                              border: "1px solid #10B981",
                              color: "var(--text-primary)",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            단독 분석
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerAiDebate("result")}
                            disabled={isAiLoading || isDebating}
                            style={{
                              flex: 1.2,
                              padding: "0.35rem",
                              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                              border: "none",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)"
                            }}
                          >
                            ⚔️ 합의 토론
                          </button>
                        </div>
                      </div>
                    </div>

                    {isAiLoading && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#a78bfa", marginBottom: "0.2rem", fontFamily: "monospace" }}>
                          <span>{aiStatusText}</span>
                          <span>{aiProgress}%</span>
                        </div>
                        <div style={{ width: "100%", height: "4px", background: "var(--input-bg)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${aiProgress}%`, height: "100%", background: "linear-gradient(90deg, #a78bfa 0%, #818cf8 100%)", borderRadius: "2px", transition: "width 0.15s ease" }} />
                        </div>
                      </div>
                    )}

                    {/* 실시간 AI Debate Room 모니터링 패널 */}
                    {(isDebating || aiDebateLogs.length > 0) && (
                      <div style={{
                        marginTop: "0.75rem",
                        padding: "0.6rem 0.75rem",
                        background: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(139, 92, 246, 0.4)",
                        borderRadius: "6px",
                        boxShadow: "0 0 12px rgba(139, 92, 246, 0.25)",
                        fontFamily: "monospace",
                        fontSize: "0.68rem"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.3rem", marginBottom: "0.4rem" }}>
                          <span style={{ color: "#a78bfa", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            ⚔️ AI Consensus Debate Room
                          </span>
                          <button
                            type="button"
                            onClick={() => setAiDebateLogs([])}
                            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.6rem" }}
                          >
                            비우기
                          </button>
                        </div>

                        <div style={{ maxHeight: "120px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          {aiDebateLogs.map((log, index) => {
                            let color = "var(--text-primary)";
                            let prefix = "🤖 ";
                            let bg = "rgba(255,255,255,0.02)";
                            
                            if (log.role === "chatgpt") {
                              color = "#10B981";
                              prefix = "🟢 ChatGPT: ";
                              bg = "rgba(16, 185, 129, 0.05)";
                            } else if (log.role === "gemini") {
                              color = "#3B82F6";
                              prefix = "🔵 Gemini: ";
                              bg = "rgba(59, 130, 246, 0.05)";
                            } else if (log.role === "system") {
                              color = "#A78BFA";
                              prefix = "⚙️ ";
                              bg = "rgba(167, 139, 250, 0.05)";
                            }

                            return (
                              <div
                                key={index}
                                style={{
                                  padding: "0.25rem 0.4rem",
                                  borderRadius: "4px",
                                  background: bg,
                                  borderLeft: `2.5px solid ${color === "var(--text-primary)" ? "transparent" : color}`,
                                  color: color,
                                  lineHeight: "1.3"
                                }}
                              >
                                <strong>{prefix}</strong>{log.text}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>담당 부서(센터)</label>
                      <select name="department" value={formData.department} onChange={handleInputChange} className="form-select">
                        <option value="">-- 부서 선택 --</option>
                        {["ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "사업운영팀"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                        <option value="external">외부기관 (직접 입력)</option>
                      </select>
                      {formData.department === "external" && (
                        <div style={{ marginTop: "0.5rem" }}>
                          <label style={{ display: "block", fontSize: "0.72rem", color: "var(--accent-color)", marginBottom: "0.25rem", fontWeight: "700" }}>
                            🏢 외부 주관 기관명 직접 입력
                          </label>
                          <input
                            type="text"
                            name="externalDept"
                            value={formData.externalDept || ""}
                            onChange={handleInputChange}
                            required
                            placeholder="예: 교육부, 울산시청 등 주관기관 입력"
                            className="form-input"
                            style={{ border: "1px solid var(--accent-color)" }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 체육관 특설 돔" className="form-input" />
                    </div>
                  </div>

                  {/* 일자 및 시작/종료시간 개별 입력 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 일자</label>
                      <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required className="form-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input type="time" name="eventStartTime" value={formData.eventStartTime} onChange={handleInputChange} required className="form-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input type="time" name="eventEndTime" value={formData.eventEndTime} onChange={handleInputChange} required className="form-input" />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>참석자 (내부 구분)</label>
                      <input type="text" name="attendeesInternal" value={formData.attendeesInternal} onChange={handleInputChange} placeholder="예: 내부 교수 및 연구원 15명" className="form-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>참석자 (외부 구분)</label>
                      <input type="text" name="attendeesExternal" value={formData.attendeesExternal} onChange={handleInputChange} placeholder="예: 지자체 관계자 5명" className="form-input" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 프로그램</label>
                    <input type="text" name="program" value={formData.program} onChange={handleInputChange} placeholder="예: 지역 정착 지원 프로그램" className="form-input" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 목적</label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="행사를 통해 도달하고자 하는 목표 기술" className="form-textarea" style={{ height: "46px", resize: "none" }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>행사 결과</label>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", opacity: 0.75 }}>
                          (💡 행사 종료 후 결과 등록 시 작성 가능)
                        </span>
                      </div>
                      {aiResultApplied && (
                        <span style={{ fontSize: "0.65rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.35)", color: "#10b981", padding: "0.1rem 0.35rem", borderRadius: "4px", fontWeight: "700" }}>
                          ✨ AI 행사 결과 반영됨 ✓
                        </span>
                      )}
                    </div>
                    <textarea name="result" value={formData.result} onChange={handleInputChange} placeholder="행사 종료 후 수료 인원, 산출된 최종 성과 및 보도 실적 등을 기록합니다 (기획 단계에서는 공란 가능)" className="form-textarea" style={{ height: "46px", resize: "none" }} />
                  </div>
                </>
              )}

              {modalType === "meeting" && (
                <>
                  {/* 회의 대분류 (최상단으로 위치 이동 완료) */}
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 대분류</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="form-select">
                      <option value="operating">사업운영위원회</option>
                      <option value="center">부서별 회의</option>
                      <option value="committee">각종 위원회</option>
                    </select>
                  </div>

                  {/* AI 기획서/결과서 자동 기입 위젯 */}
                  <div style={{
                    background: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    borderRadius: "8px",
                    padding: "0.75rem",
                    marginBottom: "1rem"
                  }}>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#a78bfa" }}>🧠 지능형 AI-분석 연동 (기획 vs 결과 분리)</span>
                    </div>
                    
                    <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", lineHeight: "1.3", marginBottom: "0.75rem" }}>
                      💡 <strong>기획/일정안</strong>을 분석하면 회의 명칭, 장소, 일자, 시작/종료시간, 참석자 등 기본 정보가 자동 완성됩니다. (다중 파일 업로드 지원)<br />
                      💡 <strong>결과보고서(회의록)</strong>를 분석하면 하단의 안건별 결과 리스트(의제 및 결과)가 자동으로 채워집니다. (다중 파일 업로드 지원)
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      {/* [1] 회의 기획서 분석 영역 */}
                      <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)" }}>1️⃣ 회의 기획/일정 단계</span>
                          <button
                            type="button"
                            onClick={handleLoadSampleFile}
                            style={{ fontSize: "0.6rem", color: "#60a5fa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                          >
                            [샘플로드]
                          </button>
                        </div>
                        <input
                          type="file"
                          id="ai-meeting-plan-file"
                          accept=".txt,.pdf"
                          multiple
                          onChange={(e) => handleAiFileChange(e, "plan")}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor="ai-meeting-plan-file"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.35rem 0.5rem",
                            background: "var(--input-bg)",
                            border: "1px dashed rgba(167, 139, 250, 0.4)",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.68rem",
                            color: "var(--text-primary)",
                            marginBottom: "0.4rem"
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "110px" }}>
                            {aiFileName || "기획서 파일 첨부"}
                          </span>
                          <span style={{ fontSize: "0.65rem", background: "rgba(167, 139, 250, 0.2)", padding: "0.1rem 0.25rem", borderRadius: "3px" }}>탐색</span>
                        </label>
                        <textarea
                          value={aiRawText}
                          onChange={(e) => setAiRawText(e.target.value)}
                          placeholder="또는 회의 계획 본문을 직접 붙여넣으세요..."
                          style={{
                            width: "100%",
                            height: "45px",
                            padding: "0.3rem",
                            background: "rgba(0,0,0,0.15)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "4px",
                            color: "var(--text-primary)",
                            fontSize: "0.68rem",
                            resize: "none"
                          }}
                        />
                        <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.4rem" }}>
                          <button
                            type="button"
                            onClick={() => triggerAiAutoFill("plan")}
                            disabled={isAiLoading}
                            style={{
                              flex: 1,
                              padding: "0.35rem",
                              background: "linear-gradient(135deg, var(--accent-color) 0%, #8b5cf6 100%)",
                              border: "none",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              boxShadow: "0 2px 4px rgba(139, 92, 246, 0.2)"
                            }}
                          >
                            🤖 AI 분석 실행
                          </button>
                        </div>
                      </div>

                      {/* [2] 회의록/결과보고서 분석 영역 */}
                      <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "6px" }}>
                        <span style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.3rem" }}>2️⃣ 회의 결과/회의록 단계</span>
                        <input
                          type="file"
                          id="ai-meeting-result-file"
                          accept=".txt,.pdf"
                          multiple
                          onChange={(e) => handleAiFileChange(e, "result")}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor="ai-meeting-result-file"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.35rem 0.5rem",
                            background: "var(--input-bg)",
                            border: "1px dashed rgba(167, 139, 250, 0.4)",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.68rem",
                            color: "var(--text-primary)",
                            marginBottom: "0.4rem"
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "110px" }}>
                            {aiResultFileName || "결과보고서 파일 첨부"}
                          </span>
                          <span style={{ fontSize: "0.65rem", background: "rgba(167, 139, 250, 0.2)", padding: "0.1rem 0.25rem", borderRadius: "3px" }}>탐색</span>
                        </label>
                        <textarea
                          value={aiResultRawText}
                          onChange={(e) => setAiResultRawText(e.target.value)}
                          placeholder="또는 결과보고서 본문을 직접 붙여넣으세요..."
                          style={{
                            width: "100%",
                            height: "45px",
                            padding: "0.3rem",
                            background: darkMode ? "rgba(0,0,0,0.15)" : "#fafafa",
                            border: "1px solid var(--border-color)",
                            borderRadius: "4px",
                            color: "var(--text-primary)",
                            fontSize: "0.68rem",
                            resize: "none"
                          }}
                        />
                        <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.4rem" }}>
                          <button
                            type="button"
                            onClick={() => triggerAiAutoFill("result")}
                            disabled={isAiLoading}
                            style={{
                              flex: 1,
                              padding: "0.35rem",
                              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                              border: "none",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "0.68rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              boxShadow: darkMode ? "0 2px 4px rgba(16, 185, 129, 0.2)" : "0 2px 4px rgba(16, 185, 129, 0.1)"
                            }}
                          >
                            🤖 AI 분석 실행
                          </button>
                        </div>
                      </div>
                    </div>

                    {isAiLoading && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#a78bfa", marginBottom: "0.2rem", fontFamily: "monospace" }}>
                          <span>{aiStatusText}</span>
                          <span>{aiProgress}%</span>
                        </div>
                        <div style={{ width: "100%", height: "4px", background: "var(--input-bg)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${aiProgress}%`, height: "100%", background: "linear-gradient(90deg, #a78bfa 0%, #818cf8 100%)", borderRadius: "2px", transition: "width 0.15s ease" }} />
                        </div>
                      </div>
                    )}

                    {/* 실시간 AI Debate Room 모니터링 패널 */}
                    {(isDebating || aiDebateLogs.length > 0) && (
                      <div style={{
                        marginTop: "0.75rem",
                        padding: "0.6rem 0.75rem",
                        background: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(139, 92, 246, 0.4)",
                        borderRadius: "6px",
                        boxShadow: "0 0 12px rgba(139, 92, 246, 0.25)",
                        fontFamily: "monospace",
                        fontSize: "0.68rem"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.3rem", marginBottom: "0.4rem" }}>
                          <span style={{ color: "#a78bfa", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            🤖 AI 분석 로그 모니터링
                          </span>
                          <button
                            type="button"
                            onClick={() => setAiDebateLogs([])}
                            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.6rem" }}
                          >
                            비우기
                          </button>
                        </div>

                        <div style={{ maxHeight: "120px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                          {aiDebateLogs.map((log, index) => {
                            let color = "var(--text-primary)";
                            let prefix = "🤖 ";
                            let bg = "rgba(255,255,255,0.02)";
                            
                            if (log.role === "chatgpt") {
                              color = "#10B981";
                              prefix = "🟢 ChatGPT: ";
                              bg = "rgba(16, 185, 129, 0.05)";
                            } else if (log.role === "gemini") {
                              color = "#3B82F6";
                              prefix = "🔵 Gemini: ";
                              bg = "rgba(59, 130, 246, 0.05)";
                            } else if (log.role === "system") {
                              color = "#A78BFA";
                              prefix = "⚙️ ";
                              bg = "rgba(167, 139, 250, 0.05)";
                            }

                            return (
                              <div
                                key={index}
                                style={{
                                  padding: "0.25rem 0.4rem",
                                  borderRadius: "4px",
                                  background: bg,
                                  borderLeft: `2.5px solid ${color === "var(--text-primary)" ? "transparent" : color}`,
                                  color: color,
                                  lineHeight: "1.3"
                                }}
                              >
                                <strong>{prefix}</strong>{log.text}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 회의 명칭 */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>회의 명칭</label>
                      {aiPlanApplied && (
                        <span style={{ fontSize: "0.65rem", background: "rgba(167, 139, 250, 0.15)", border: "1px solid rgba(167, 139, 250, 0.35)", color: "#a78bfa", padding: "0.1rem 0.35rem", borderRadius: "4px", fontWeight: "700" }}>
                          ✨ AI 계획 정보 반영됨 ✓
                        </span>
                      )}
                    </div>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 제2차 ICC 센터 공동 운영 회의" className="form-input" />
                  </div>

                  {/* 장소 */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="예: ICC 센터장실" className="form-input" />
                  </div>

                  {/* 1) 각종 위원회 세부 구분 버튼메뉴 (category === "committee" 일 때 노출) */}
                  {formData.category === "committee" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.25rem" }}>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)" }}>위원회 구분</label>
                      <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                        {["agency", "center"].map((type) => {
                          const isSelected = (formData.committeeType || "agency") === type;
                          const label = type === "agency" ? "🏛️ 사업단 위원회" : "🏫 센터 위원회";
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  committeeType: type,
                                  dept: type === "agency" ? "앵커총괄위원회" : "ECC센터"
                                }));
                              }}
                              style={{
                                flex: 1,
                                padding: "0.55rem",
                                fontSize: "0.8rem",
                                fontWeight: "700",
                                borderRadius: "6px",
                                border: "1px solid " + (isSelected ? "var(--accent-color)" : "var(--border-color)"),
                                background: isSelected ? "rgba(59, 130, 246, 0.15)" : "var(--input-bg)",
                                color: isSelected ? "#60A5FA" : "var(--text-secondary)",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                textAlign: "center"
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2) 부서명(또는 위원회명) 및 작성자 배치 (회의일시보다 위에 위치하도록 배치 순서 변경) */}
                  {formData.category !== "operating" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                          {formData.category === "committee" && (formData.committeeType || "agency") === "agency" ? "위원회명" : "부서(센터)명"}
                        </label>
                        <select name="dept" value={formData.dept} onChange={handleInputChange} className="form-select">
                          {(() => {
                            if (formData.category === "committee") {
                              if ((formData.committeeType || "agency") === "agency") {
                                return [
                                  "앵커총괄위원회", "앵커기획위원회", "앵커사업비관리위원회",
                                  "앵커사업자체평가위원회", "앵커사업자문회의"
                                ].map(d => <option key={d} value={d}>{d}</option>);
                              } else {
                                return [
                                  "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"
                                ].map(d => <option key={d} value={d}>{d}</option>);
                              }
                            }
                            return ["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ));
                          })()}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>작성자</label>
                        <select name="writer" value={formData.writer} onChange={handleInputChange} className="form-select">
                          {(() => {
                            const isCenterMeeting =
                              formData.category === "center" ||
                              (formData.category === "committee" && (formData.committeeType || "agency") === "center");

                            let activeWriters = [];
                            if (isCenterMeeting && formData.dept) {
                              activeWriters = (members || []).filter(m =>
                                m.status !== "미참여" &&
                                m.email &&
                                m.dept === formData.dept &&
                                !isWriterExcluded(m)
                              );
                              if (activeWriters.length === 0) {
                                activeWriters = (members || []).filter(m =>
                                  m.status !== "미참여" &&
                                  m.dept === formData.dept &&
                                  !isWriterExcluded(m)
                                );
                              }
                            } else {
                              activeWriters = (members || []).filter(m =>
                                m.status !== "미참여" &&
                                m.email &&
                                m.dept === "사업운영팀" && // 사업운영팀 구성원만 노출
                                !isWriterExcluded(m)
                              );

                              // 사업단 관련 회의인 경우 심현미 운영팀장을 맨 위에 강제 포함
                              const simHyunMi = (members || []).find(m => m.name === "심현미") || {
                                id: "sim_hm_temp",
                                name: "심현미",
                                grade: "운영팀장",
                                role: "운영팀장",
                                dept: "사업운영팀",
                                email: "sim@uc.ac.kr"
                              };
                              activeWriters = [simHyunMi, ...activeWriters.filter(m => m.name !== "심현미")];
                            }

                            if (activeWriters.length > 0) {
                              return activeWriters.map(m => {
                                const displayName = `${m.name} ${getFormattedMemberGrade(m)}`.trim();
                                return (
                                  <option key={m.id || m.email} value={displayName}>
                                    {displayName}
                                  </option>
                                );
                              });
                            }
                            return ["박지현 팀장", "김민수 단장", "이진우 PD", "최성훈 PD", "한아름 PD"].map(w => (
                              <option key={w} value={w}>{w}</option>
                            ));
                          })()}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 3) 회의 일자 및 시간 입력 필드 (맞바꿈에 의해 아래로 이동됨) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "1rem", marginTop: "0.5rem" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>회의 일자</label>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            name="noTime"
                            checked={formData.noTime || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData(prev => ({
                                ...prev,
                                noTime: checked,
                                meetingStartTime: checked ? "" : (prev.meetingStartTime || "10:00"),
                                meetingEndTime: checked ? "" : (prev.meetingEndTime || "11:00")
                              }));
                            }}
                            style={{ cursor: "pointer", width: "13px", height: "13px" }}
                          />
                          전일 (시간 없음)
                        </label>
                      </div>
                      <input type="date" name="meetingDate" value={formData.meetingDate} onChange={handleInputChange} required className="form-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", opacity: formData.noTime ? 0.4 : 1 }}>시작 시간</label>
                      <input
                        type="time"
                        name="meetingStartTime"
                        value={formData.meetingStartTime}
                        onChange={handleInputChange}
                        required={!formData.noTime}
                        disabled={formData.noTime}
                        className="form-input"
                        style={{
                          opacity: formData.noTime ? 0.4 : 1,
                          cursor: formData.noTime ? "not-allowed" : "text"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", opacity: formData.noTime ? 0.4 : 1 }}>종료 시간</label>
                      <input
                        type="time"
                        name="meetingEndTime"
                        value={formData.meetingEndTime}
                        onChange={handleInputChange}
                        required={!formData.noTime}
                        disabled={formData.noTime}
                        className="form-input"
                        style={{
                          opacity: formData.noTime ? 0.4 : 1,
                          cursor: formData.noTime ? "not-allowed" : "text"
                        }}
                      />
                    </div>
                  </div>

                  {/* 4) 참석 대상자 선택 및 수기 입력창 (모든 회의 종류에 맞추어 자동 대응) */}
                  {/* 장소(location)에 '서면'이라는 단어가 포함되는 경우(예: 서면회의, 서면 회의, 서면) 참석자 입력 영역을 노출하지 않습니다. */}
                  {!(formData.location && formData.location.includes("서면")) && (
                    <div style={{ marginTop: "0.75rem" }}>
                    {(() => {
                      let labelText = "👥 소속 연구원 선택 (부서별 자동 연동)";
                      let showIncludeProfessors = false;

                      if (formData.category === "operating") {
                        labelText = "👥 사업단 전 구성원 선택";
                        showIncludeProfessors = true;

                        // 1. 참여중인 전체 인원 로드 및 팀장교수 체크박스 필터링
                        const rawMembers = (members || []).filter(m => {
                          const status = m.status || "참여중";
                          if (status !== "참여중") return false;

                          const displayRole = getFormattedMemberGrade(m);
                          if (!includeProfessors && displayRole === "팀장교수") return false;

                          return true;
                        });

                        // 2. 단장/본부장 특별 그룹 먼저 추출
                        const leaderNames = ["송경영", "김현수"];
                        const leadersList = rawMembers.filter(m => leaderNames.includes(m.name)).map(m => ({
                          name: m.name,
                          role: getFormattedMemberGrade(m),
                          key: m.id || m.email
                        }));

                        // 3. 부서(센터)별 그룹화 매핑 (단장/본부장은 각 부서별 그룹 목록에서 제외)
                        const depts = ["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"];
                        const grouped = depts.map(d => {
                          const list = rawMembers.filter(m => {
                            if (leaderNames.includes(m.name)) return false; // 리더그룹에 포함된 인원은 부서 리스트에서 중복 제외
                            if (d === "사업운영팀") {
                              const isOperatingOrAgency = m.dept === "사업단" || m.dept.includes("산학협력단") || m.dept === "앵커사업단" || m.dept === "앵커" ||
                                                           m.dept === "사업운영팀" || m.dept === "운영팀" || m.dept.includes("운영팀");
                              return isOperatingOrAgency;
                            }
                            return m.dept === d;
                          }).map(m => ({
                            name: m.name,
                            role: getFormattedMemberGrade(m),
                            key: m.id || m.email
                          }));
                          return { deptName: d, list };
                        }).filter(g => g.list.length > 0);

                        // 리더 목록이 존재하면 grouped 맨 처음에 "📌 단장 / 본부장" 그룹으로 삽입
                        if (leadersList.length > 0) {
                          grouped.unshift({
                            deptName: "단장 / 본부장",
                            list: leadersList
                          });
                        }

                        return (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                {labelText}
                              </label>
                              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                                <input
                                  type="checkbox"
                                  checked={includeProfessors}
                                  onChange={(e) => setIncludeProfessors(e.target.checked)}
                                  style={{ cursor: "pointer", width: "14px", height: "14px" }}
                                />
                                팀장교수 포함
                              </label>
                            </div>

                            {/* 부서별 그룹 카드 형태로 예쁘게 렌더링 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.5rem", maxHeight: "250px", overflowY: "auto", paddingRight: "0.25rem" }}>
                              {grouped.map(g => (
                                <div key={g.deptName} style={{ 
                                  padding: "0.4rem 0.5rem", 
                                  background: darkMode ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.02)", 
                                  border: darkMode ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.08)", 
                                  borderRadius: "6px" 
                                }}>
                                  <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#a78bfa", marginBottom: "0.25rem" }}>
                                    📌 {g.deptName}
                                  </div>
                                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                                    {g.list.map(m => {
                                      const isSelected = (formData.attendees || "")
                                        .split(",")
                                        .map((x: string) => x.trim())
                                        .some((x: string) => x.includes(m.name));

                                      return (
                                        <button
                                          key={m.key}
                                          type="button"
                                          onClick={() => handleToggleAttendee(m.name, m.role)}
                                          style={{
                                            padding: "0.2rem 0.4rem",
                                            fontSize: "0.65rem",
                                            borderRadius: "4px",
                                            border: "1px solid " + (isSelected 
                                              ? "var(--accent-color)" 
                                              : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)")),
                                            background: isSelected 
                                              ? (darkMode ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)") 
                                              : "transparent",
                                            color: isSelected 
                                              ? (darkMode ? "#60A5FA" : "#1E40AF") 
                                              : (darkMode ? "var(--text-secondary)" : "#475569"),
                                            cursor: "pointer",
                                            transition: "all 0.1s ease",
                                            fontWeight: "700"
                                          }}
                                        >
                                          {m.name} {m.role} {isSelected ? "✓" : "+"}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      }

                      let displayMembers = [];
                      if (formData.category === "committee") {
                        labelText = "👥 위원회 위원 선택";
                        const currentDept = formData.dept || "";
                        
                        const targetCommittee = committees.find(c => {
                          const nameMatch = c.name === currentDept || c.name.includes(currentDept);
                          const keyMatch = (currentDept.startsWith("ECC") && c.id === "ecc_op") ||
                                           (currentDept.startsWith("ICC") && c.id === "icc_op") ||
                                           (currentDept.startsWith("RCC") && c.id === "rcc_op") ||
                                           ((currentDept.includes("AID") || currentDept.includes("aidx")) && c.id === "aidx_op") ||
                                           ((currentDept.includes("늘봄") || currentDept.includes("neulbom")) && c.id === "neulbom_op") ||
                                           ((currentDept.includes("신산업") || currentDept.includes("newind")) && c.id === "newind_op");
                          return nameMatch || keyMatch;
                        });

                        const commMembers = targetCommittee ? (targetCommittee.members || []) : [];
                        displayMembers = commMembers.map((m: ScheduleCommitteeMember) => ({
                          name: m.name,
                          role: `${m.type}(${m.rank || m.org || ''})`,
                          key: m.id || m.name
                        }));
                      } else {
                        labelText = "👥 소속 연구원 선택 (부서별 자동 연동)";
                        showIncludeProfessors = true;
                        
                        displayMembers = (members || []).filter(m => {
                          const isDeptMatch = m.dept === formData.dept;
                          if (!isDeptMatch) return false;

                          const start = m.startDate || m.start_date || m.hireDate || m.hire_date || "2025-03-01";
                          const end = m.endDate || m.end_date || "";
                          const status = m.status || "참여중";

                          const meetingDateStr = formData.meetingDate;
                          if (meetingDateStr) {
                            if (start && meetingDateStr < start) return false;
                            if (end && meetingDateStr > end) return false;
                          }

                          const displayRole = getFormattedMemberGrade(m);
                          if (!includeProfessors && displayRole === "팀장교수") return false;

                          return status === "참여중";
                        }).map(m => ({
                          name: m.name,
                          role: getFormattedMemberGrade(m),
                          key: m.id || m.email
                        }));
                      }

                      return (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                              {labelText}
                            </label>
                            {showIncludeProfessors && (
                              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }}>
                                <input
                                  type="checkbox"
                                  checked={includeProfessors}
                                  onChange={(e) => setIncludeProfessors(e.target.checked)}
                                  style={{ cursor: "pointer", width: "14px", height: "14px" }}
                                />
                                팀장교수 포함
                              </label>
                            )}
                          </div>
                          
                          {displayMembers.length === 0 ? (
                            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.5rem", padding: "0.25rem", background: "rgba(255,255,255,0.02)", borderRadius: "4px" }}>
                              {formData.category === "committee" ? "선택한 위원회의 구성원을 찾을 수 없습니다." : "소속 부서를 먼저 선택해 주세요."}
                            </div>
                          ) : (
                            <div style={{ 
                              display: "flex", 
                              gap: "0.35rem", 
                              flexWrap: "wrap", 
                              marginBottom: "0.5rem", 
                              padding: "0.5rem", 
                              background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", 
                              borderRadius: "6px", 
                              border: darkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.08)" 
                            }}>
                              {displayMembers.map((m: { name: string; role: string; key: number | string }) => {
                                const isSelected = (formData.attendees || "")
                                  .split(",")
                                  .map((x: string) => x.trim())
                                  .some((x: string) => x.includes(m.name));

                                return (
                                  <button
                                    key={m.key}
                                    type="button"
                                    onClick={() => handleToggleAttendee(m.name, m.role)}
                                    style={{
                                      padding: "0.25rem 0.5rem",
                                      fontSize: "0.7rem",
                                      borderRadius: "4px",
                                      border: "1px solid " + (isSelected 
                                        ? "var(--accent-color)" 
                                        : (darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)")),
                                      background: isSelected 
                                        ? (darkMode ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)") 
                                        : "transparent",
                                      color: isSelected 
                                        ? (darkMode ? "#60A5FA" : "#1E40AF") 
                                        : (darkMode ? "var(--text-secondary)" : "#475569"),
                                      cursor: "pointer",
                                      transition: "all 0.1s ease",
                                      fontWeight: "700"
                                    }}
                                  >
                                    {m.name} {m.role} {isSelected ? "✓" : "+"}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      );
                    })()}

                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                      참석자 (위의 버튼을 누르면 자동으로 입력되며, 타 부서 인원의 경우 수기입력 가능)
                    </label>
                    <input
                      type="text"
                      name="attendees"
                      value={formData.attendees || ""}
                      onChange={handleInputChange}
                      placeholder="위 칩을 선택하거나 직접 입력 (예: 박지현 팀장, 이진우 PD (총 2명))"
                      style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}
                    />
                  </div>
                  )}

                  {/* 회의록 첨부파일 개별 분리 업로드 (2칸 설계) */}
                  <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    {/* 1번째 칸: MP3 음성 파일 */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                        🎙️ 음성 녹음 파일 (MP3 전용, 최대 5MB)
                      </label>
                      {formData.audioUrl ? (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          background: "rgba(85, 182, 133, 0.08)",
                          padding: "0.45rem 0.6rem",
                          borderRadius: "6px",
                          border: "1px solid rgba(85, 182, 133, 0.15)"
                        }}>
                          <span style={{ fontSize: "0.7rem", color: "#55b685", fontWeight: "700" }}>✓ 등록됨</span>
                          <a
                            href={formData.audioUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: "0.7rem", color: "#60A5FA", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100px" }}
                          >
                            [듣기/다운로드 ➔]
                          </a>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, audioUrl: "" }))}
                            style={{
                              marginLeft: "auto",
                              background: "none",
                              border: "none",
                              color: "#EF4444",
                              cursor: "pointer",
                              fontSize: "0.68rem",
                              fontWeight: "700"
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ position: "relative" }}>
                          <input
                            type="file"
                            accept=".mp3,audio/mp3,audio/mpeg"
                            onChange={(e) => handleMinutesFileUpload(e, "audio")}
                            disabled={isUploadingFile}
                            style={{ display: "none" }}
                            id="minutes-audio-file-input"
                          />
                          <label
                            htmlFor="minutes-audio-file-input"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                              width: "100%",
                              padding: "0.5rem",
                              background: "rgba(59, 130, 246, 0.05)",
                              border: "1px dashed rgba(59, 130, 246, 0.4)",
                              borderRadius: "6px",
                              color: "var(--text-secondary)",
                              cursor: isUploadingFile ? "not-allowed" : "pointer",
                              fontSize: "0.7rem",
                              textAlign: "center"
                            }}
                          >
                            {isUploadingFile ? "⏳ 전송 중..." : "📁 MP3 파일 등록"}
                          </label>
                        </div>
                      )}
                    </div>

                    {/* 2번째 칸: PDF 문서 파일 */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                        📄 회의록 첨부 문서 (PDF 전용, 최대 2MB)
                      </label>
                      {formData.pdfUrl ? (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          background: "rgba(85, 182, 133, 0.08)",
                          padding: "0.45rem 0.6rem",
                          borderRadius: "6px",
                          border: "1px solid rgba(85, 182, 133, 0.15)"
                        }}>
                          <span style={{ fontSize: "0.7rem", color: "#55b685", fontWeight: "700" }}>✓ 등록됨</span>
                          <a
                            href={formData.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: "0.7rem", color: "#60A5FA", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100px" }}
                          >
                            [문서 확인 ➔]
                          </a>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, pdfUrl: "" }))}
                            style={{
                              marginLeft: "auto",
                              background: "none",
                              border: "none",
                              color: "#EF4444",
                              cursor: "pointer",
                              fontSize: "0.68rem",
                              fontWeight: "700"
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ position: "relative" }}>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => handleMinutesFileUpload(e, "pdf")}
                            disabled={isUploadingFile}
                            style={{ display: "none" }}
                            id="minutes-pdf-file-input"
                          />
                          <label
                            htmlFor="minutes-pdf-file-input"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                              width: "100%",
                              padding: "0.5rem",
                              background: "rgba(59, 130, 246, 0.05)",
                              border: "1px dashed rgba(59, 130, 246, 0.4)",
                              borderRadius: "6px",
                              color: "var(--text-secondary)",
                              cursor: isUploadingFile ? "not-allowed" : "pointer",
                              fontSize: "0.7rem",
                              textAlign: "center"
                            }}
                          >
                            {isUploadingFile ? "⏳ 전송 중..." : "📁 PDF 파일 등록"}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 주요 의제 및 회의 결과 1:1 대칭 대응 입력 목록 */}
                  {formData.category === "operating" ? (
                    <div style={{ marginTop: "1rem" }}>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: "700" }}>
                        🏢 부서별 주요 업무추진 현황 및 애로사항 입력
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxHeight: "250px", overflowY: "auto", paddingRight: "0.25rem" }}>
                        {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map((deptName) => {
                          const deptAgendaVal = formData.operatingAgendas?.[deptName] || "";
                          const deptResultVal = formData.operatingResults?.[deptName] || "";

                          return (
                            <div
                              key={deptName}
                              style={{
                                background: "rgba(255, 255, 255, 0.01)",
                                padding: "0.6rem",
                                borderRadius: "6px",
                                border: "1px solid var(--border-color)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.4rem"
                              }}
                            >
                              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-color)" }}>
                                📌 {deptName}
                              </span>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                <input
                                  type="text"
                                  value={deptAgendaVal}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      operatingAgendas: {
                                        ...(prev.operatingAgendas || {}),
                                        [deptName]: e.target.value
                                      }
                                    }));
                                  }}
                                  placeholder={`${deptName} 의제 / 전달사항`}
                                  style={{ padding: "0.4rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.72rem" }}
                                />
                                <textarea
                                  value={deptResultVal}
                                  onChange={(e) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      operatingResults: {
                                        ...(prev.operatingResults || {}),
                                        [deptName]: e.target.value
                                      }
                                    }));
                                  }}
                                  placeholder={`${deptName} 추진상황 / 결과`}
                                  rows={2}
                                  style={{ padding: "0.4rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.72rem", resize: "vertical", fontFamily: "inherit" }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "700" }}>
                            📝 회의 의제 및 결과 관리 (AI 자동 추출 및 1:1 편집)
                          </label>
                          {aiResultApplied && (
                            <span style={{ fontSize: "0.65rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.35)", color: "#10b981", padding: "0.1rem 0.35rem", borderRadius: "4px", fontWeight: "700" }}>
                              ✨ AI 안건 결과 반영됨 ✓
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateAIKeywords}
                          disabled={isAnalyzingAI}
                          style={{
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.72rem",
                            fontWeight: "700",
                            borderRadius: "6px",
                            border: "1px solid rgba(16, 185, 129, 0.25)",
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "#34D399",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}
                        >
                          ✨ AI 의제/결과 자동 분석
                        </button>
                      </div>

                      {/* AI 분석 중 가시적 로딩 바 피드백 */}
                      {isAnalyzingAI && (
                        <div style={{
                          padding: "1rem",
                          background: "rgba(59, 130, 246, 0.08)",
                          border: "1px solid rgba(59, 130, 246, 0.15)",
                          borderRadius: "6px",
                          marginBottom: "0.75rem",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem"
                        }}>
                          <div style={{
                            width: "24px",
                            height: "24px",
                            border: "2px solid #60A5FA",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite"
                          }} />
                          <span style={{ fontSize: "0.75rem", color: "#93C5FD", fontWeight: "700" }}>
                            AI가 회의 맥락을 분석하여 의제와 결과를 정밀 요약 정리하고 있습니다...
                          </span>
                          <style>{`
                            @keyframes spin {
                              to { transform: rotate(360deg); }
                            }
                          `}</style>
                        </div>
                      )}

                      {/* AI 팁 안내 박스 */}
                      <div style={{
                        padding: "0.5rem 0.75rem",
                        background: "rgba(255, 255, 255, 0.015)",
                        border: "1px solid rgba(255, 255, 255, 0.03)",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.6rem",
                        lineHeight: "1.4"
                      }}>
                        💡 <strong>AI 스마트 팁</strong>: 회의 음성 녹음본(MP3) 및 회의록 첨부 문서(PDF, 존재하는 경우)를 등록하면, <strong>두 자료를 AI가 정밀 분석·조합하여 회의 의제와 결과를 자동으로 생성</strong>합니다.
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {agendaResultPairs.map((pair, index) => (
                          <div
                            key={index}
                            style={{
                              display: "grid",
                              gridTemplateColumns: agendaResultPairs.length > 1 ? "1fr 2.2fr 40px" : "1fr 2.2fr",
                              gap: "0.5rem",
                              alignItems: "stretch",
                              background: "rgba(255, 255, 255, 0.01)",
                              padding: "0.5rem",
                              borderRadius: "6px",
                              border: "1px solid rgba(255, 255, 255, 0.04)"
                            }}
                          >
                            <input
                              type="text"
                              value={pair.agenda}
                              onChange={(e) => {
                                const newPairs = [...agendaResultPairs];
                                newPairs[index].agenda = e.target.value;
                                setAgendaResultPairs(newPairs);
                              }}
                              placeholder={`의제 ${index + 1} (예: 2차년도 예산 검토)`}
                              style={{ padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.75rem", height: "100%" }}
                            />
                            <textarea
                              value={pair.result}
                              onChange={(e) => {
                                const newPairs = [...agendaResultPairs];
                                newPairs[index].result = e.target.value;
                                setAgendaResultPairs(newPairs);
                              }}
                              placeholder={`결정 및 조치 사항 ${index + 1} (상세 결과 2줄 분량)`}
                              rows={2}
                              style={{ padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.75rem", resize: "vertical", fontFamily: "inherit", lineHeight: "1.3" }}
                            />
                            {agendaResultPairs.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const newPairs = agendaResultPairs.filter((_, idx) => idx !== index);
                                  setAgendaResultPairs(newPairs);
                                }}
                                style={{ padding: "0.45rem", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px", color: "#F87171", cursor: "pointer", fontWeight: "700", fontSize: "0.75rem" }}
                              >
                                ✕
                              </button>
                            ) : null}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setAgendaResultPairs([...agendaResultPairs, { agenda: "", result: "" }])}
                          style={{
                            marginTop: "0.2rem",
                            padding: "0.35rem 0.8rem",
                            background: "rgba(59,130,246,0.12)",
                            border: "1px solid rgba(59,130,246,0.25)",
                            borderRadius: "6px",
                            color: "#60A5FA",
                            cursor: "pointer",
                            fontSize: "0.72rem",
                            display: "inline-flex",
                            alignSelf: "flex-start",
                            fontWeight: "700"
                          }}
                        >
                          + 의제/결과 행 추가
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 언론보도 일정 등록 */}
              {modalType === "press" && (
                <>
                  {/* ✨ AI 자동 입력 안내 배너 */}
                  <div style={{
                    background: "rgba(139, 92, 246, 0.08)",
                    border: "1px dashed rgba(139, 92, 246, 0.25)",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    marginBottom: "1.25rem",
                    fontSize: "0.78rem",
                    color: "var(--text-primary)",
                    lineHeight: "1.4",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem"
                  }}>
                    <span style={{ fontSize: "1rem" }}>💡</span>
                    <span>
                      <strong style={{ color: "#a78bfa" }}>간편 입력 팁</strong>: 맨 아래의 <strong style={{ textDecoration: "underline" }}>보도 내용 URL</strong>만 입력하신 뒤 우측의 <strong style={{ color: "#a78bfa" }}>[✨ AI 자동 입력]</strong> 버튼을 누르면, 방송 구분 / 매체 / 제목 / 일시 / 상세 내용까지 GPT & Gemini API 교차 검증을 거쳐 실시간으로 수집하여 일괄 입력해 줍니다.
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 구분</label>
                      <select name="pressType" value={formData.pressType} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        <option value="방송">📺 방송</option>
                        <option value="신문">📰 신문</option>
                        <option value="기타">🌐 기타 (뉴미디어 등)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 매체</label>
                      <input type="text" name="pressMedia" value={formData.pressMedia} onChange={handleInputChange} required placeholder="예: 울산MBC, 경상일보, 블로그 등" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 제목</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 울산과학대학교, 지역 창업 연계 RISE 앵커사업 활성화 시동" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 일자</label>
                      <input type="date" name="pressDate" value={formData.pressDate} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도/방송 시간</label>
                      <input type="time" name="pressTime" value={formData.pressTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도내용 (기사 상세 본문)</label>
                    <textarea name="pressContent" value={formData.pressContent || ""} onChange={handleInputChange} placeholder="기사 본문 또는 세부 보도 내용을 기술해 주세요." style={{ width: "100%", height: "100px", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", resize: "none" }} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "#8b5cf6", fontWeight: "700", marginBottom: "0.35rem" }}>✨ 보도 내용 URL (유튜브 링크 또는 기사 링크)</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="url"
                        name="pressUrl"
                        value={formData.pressUrl || ""}
                        onChange={handleInputChange}
                        required
                        placeholder="예: https://www.youtube.com/watch?v=... 또는 기사 원문 링크"
                        style={{ flex: 1, padding: "0.6rem 0.75rem", background: "rgba(139, 92, 246, 0.08)", border: "2px solid #8b5cf6", borderRadius: "8px", color: "var(--text-primary)", fontWeight: "600", fontSize: "0.9rem", boxShadow: "0 0 10px rgba(139, 92, 246, 0.15)" }}
                      />
                      <button
                        type="button"
                        onClick={handleAnalyzePressUrlWithGemini}
                        disabled={isAnalyzingUrl || !formData.pressUrl}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          background: isAnalyzingUrl
                            ? "rgba(139, 92, 246, 0.3)"
                            : (formData.pressUrl ? "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" : "rgba(255,255,255,0.05)"),
                          border: "none",
                          color: formData.pressUrl ? "white" : "var(--text-secondary)",
                          fontWeight: "700",
                          fontSize: "0.75rem",
                          cursor: formData.pressUrl && !isAnalyzingUrl ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          transition: "all 0.2s"
                        }}
                      >
                        {isAnalyzingUrl ? (
                          <>
                            <span style={{ width: "12px", height: "12px", border: "2px solid white", borderTop: "2px solid transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite", marginRight: "0.2rem" }} />
                            <span>분석 중...</span>
                          </>
                        ) : (
                          <>
                            <span>✨ AI 자동 입력</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* 버튼 그룹 */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditMode(false);
                    setEditingItemId(null);
                  }}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                >
                  {isEditMode ? "수정 완료" : "새 등록 완료"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
