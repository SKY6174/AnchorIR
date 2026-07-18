import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import CryptoJS from "crypto-js";
import ScheduleManager from "./ScheduleManager";
import { 
  Users, 
  ClipboardList, 
  Plus, 
  Check, 
  X, 
  FileText, 
  Vote, 
  Award, 
  Clock, 
  Cpu, 
  Trash2, 
  Edit, 
  Lock,
  ChevronRight,
  UserCheck
} from "lucide-react";

// 💡 [Rule 8] 개인정보 및 서명 데이터 암복호화용 대칭키 정의
const SECRET_KEY = "anchor_instructor_secure_encryption_key_2026";
const SIGNATURE_SECRET_KEY = "anchor_signature_encryption_key_secure_2026";

// 💡 [두 번째 그림의 공식 11개 거버넌스 위원회 풀 구성] (요구사항 2 반영)
const GOVERNANCE_COMMITTEES_MASTER = [
  { id: "total", name: "앵커총괄위원회", purpose: "앵커 사업 총괄 / 사업계획서 심의 / 교육환경 및 기자재 구축심의 / 예산변경안 최종승인 등", badge: "최고의사결정", color: "linear-gradient(135deg, #ec4899 0%, #be123c 100%)", constitution: "내부 9인, 외부 2인 등", cycle: "반기별 1회" },
  { id: "planning", name: "앵커기획위원회", purpose: "대학/지자체 발전계획에 의거한 앵커사업계획서 작성 및 타당성 검토 / 사업계획서 및 사업결과보고서 운영 등", badge: "기획·실무조율", color: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", constitution: "내부 11인, 외부 4인 등", cycle: "분기별 1회" },
  { id: "budget", name: "앵커사업비관리위원회", purpose: "사업비 집행 가이드라인에 따라 사업 예산 집행 모니터링 / 집행률 점검 및 관리 / 사업비 조정 심의 등", badge: "재정투명성", color: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)", constitution: "7인 내외", cycle: "분기별 1회" },
  { id: "eval", name: "앵커사업자체평가위원회", purpose: "사업계획서 및 목표에 기반한 사업성과 평가 (중간평가/최종평가)", badge: "성과평가", color: "linear-gradient(135deg, #10b981 0%, #047857 100%)", constitution: "9인 내외", cycle: "연 1회 정기" },
  { id: "advisory", name: "앵커사업자문회의", purpose: "앵커 사업 정책 방향 및 지역 정주형 인재 양성을 위한 정책 자문", badge: "외부전문가자문", color: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", constitution: "외부 7인 등", cycle: "반기별 1회" },
  { id: "ecc_op", name: "지산학교육센터(ECC) 운영위원회", purpose: "지산학교육센터(ECC) 세부 사업계획 및 추진현황 심의/의결", badge: "센터운영", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", constitution: "5인 내외", cycle: "분기별 1회" },
  { id: "icc_op", name: "기업협업센터(ICC) 운영위원회", purpose: "기업협업센터(ICC) 산학연구 및 기업 지원 안건 의결", badge: "센터운영", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", constitution: "5인 내외", cycle: "분기별 1회" },
  { id: "rcc_op", name: "지역협업센터(RCC) 운영위원회", purpose: "지역협업센터(RCC) 지자체 매칭 및 커뮤니티 사업 자문/심의", badge: "센터운영", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", constitution: "5인 내외", cycle: "분기별 1회" },
  { id: "aidx_op", name: "AID-X센터 운영위원회", purpose: "디지털 융합 교육 및 AID-X 사업 기획 심의", badge: "센터운영", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", constitution: "5인 내외", cycle: "분기별 1회" },
  { id: "neulbom_op", name: "울산늘봄센터 운영위원회", purpose: "늘봄 교실 연계 과정 및 자치 교육 활동 심의", badge: "센터운영", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", constitution: "5인 내외", cycle: "분기별 1회" },
  { id: "newind_op", name: "신산업특화센터 운영위원회", purpose: "신산업 선도 기업 맞춤 교육 및 거버넌스 심의", badge: "센터운영", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", constitution: "5인 내외", cycle: "분기별 1회" }
];

// 💡 [거버넌스 소속 위원 명단 리스트 폴백 백업 셋] (요구사항 2 연동)
const MOCK_COMMITTEE_MEMBERS_FALLBACK = {
  total: [
    { id: 101, committee_id: "total", type: "위원장", name: "조홍래", org: "울산과학대학교", dept: "-", rank: "총장", location: "교내", note: "", sort_order: 1 },
    { id: 102, committee_id: "total", type: "위원", name: "김성철", org: "울산과학대학교", dept: "-", rank: "부총장", location: "교내", note: "", sort_order: 2 },
    { id: 103, committee_id: "total", type: "위원", name: "변홍석", org: "울산과학대학교", dept: "교무처", rank: "처장", location: "교내", note: "", sort_order: 3 },
    { id: 104, committee_id: "total", type: "위원", name: "김강연", org: "울산과학대학교", dept: "기획처", rank: "처장", location: "교내", note: "인사발령으로 인한 변경", sort_order: 4 },
    { id: 105, committee_id: "total", type: "위원", name: "이주영", org: "울산과학대학교", dept: "학생취업처", rank: "처장", location: "교내", note: "", sort_order: 5 },
    { id: 106, committee_id: "total", type: "위원", name: "박일현", org: "울산과학대학교", dept: "총무처", rank: "처장", location: "교내", note: "", sort_order: 6 },
    { id: 107, committee_id: "total", type: "위원", name: "송경영", org: "울산과학대학교", dept: "산학협력단(앵커)", rank: "단장", location: "교내", note: "", sort_order: 7 },
    { id: 108, committee_id: "total", type: "위원", name: "미지정(직원)", org: "울산과학대학교", dept: "직원노동조합", rank: "위원장", location: "교내", note: "", sort_order: 8 },
    { id: 109, committee_id: "total", type: "위원", name: "미지정(학생)", org: "울산과학대학교", dept: "총학생회", rank: "회장", location: "교내", note: "", sort_order: 9 },
    { id: 110, committee_id: "total", type: "위원", name: "정문호", org: "정테크", dept: "-", rank: "대표", location: "교외", note: "신규 추가", sort_order: 10 },
    { id: 111, committee_id: "total", type: "위원", name: "이경우", org: "울산발전연구원", dept: "경제산업연구실", rank: "실장", location: "교외", note: "신규 추가", sort_order: 11 },
    { id: 112, committee_id: "total", type: "간사", name: "고우근", org: "울산과학대학교", dept: "기획처", rank: "팀장", location: "교내", note: "", sort_order: 12 }
  ],
  planning: [
    { id: 201, committee_id: "planning", type: "위원장", name: "김강연", org: "울산과학대학교", dept: "기획처", rank: "처장", location: "교내", note: "", sort_order: 1 },
    { id: 202, committee_id: "planning", type: "위원장", name: "송경영", org: "울산과학대학교", dept: "앵커사업단", rank: "사업단장", location: "교내", note: "", sort_order: 2 },
    { id: 203, committee_id: "planning", type: "위원", name: "김현수", org: "울산과학대학교", dept: "앵커사업단", rank: "총괄본부장", location: "교내", note: "", sort_order: 3 },
    { id: 204, committee_id: "planning", type: "위원", name: "최윤아", org: "울산과학대학교", dept: "기획처", rank: "부처장", location: "교내", note: "신규 추가", sort_order: 4 },
    { id: 205, committee_id: "planning", type: "위원", name: "이동은", org: "울산과학대학교", dept: "지산학교육센터(ECC)", rank: "센터장", location: "교내", note: "", sort_order: 5 },
    { id: 206, committee_id: "planning", type: "위원", name: "김기범", org: "울산과학대학교", dept: "기업협업센터(ICC)", rank: "센터장", location: "교내", note: "", sort_order: 6 },
    { id: 207, committee_id: "planning", type: "위원", name: "현용환", org: "울산과학대학교", dept: "지역협업센터(RCC)", rank: "센터장", location: "교내", note: "기존 센터장 교육파견으로 인한 신규 추가", sort_order: 7 },
    { id: 208, committee_id: "planning", type: "위원", name: "홍광표", org: "울산과학대학교", dept: "울산늘봄누리센터", rank: "센터장", location: "교내", note: "", sort_order: 8 },
    { id: 209, committee_id: "planning", type: "위원", name: "장광일", org: "울산과학대학교", dept: "화학공학과", rank: "교수", location: "교내", note: "신규 추가", sort_order: 9 },
    { id: 210, committee_id: "planning", type: "위원", name: "이정준", org: "울산과학대학교", dept: "기계공학부", rank: "교수", location: "교내", note: "신규 추가", sort_order: 10 },
    { id: 211, committee_id: "planning", type: "위원", name: "정가영", org: "울산과학대학교", dept: "총대의원회", rank: "의장", location: "교내", note: "26/11월 임기 기준 (간호학과 정가영/2319149)", sort_order: 11 },
    { id: 212, committee_id: "planning", type: "위원", name: "정회걸", org: "울산정보산업진흥원", dept: "인재교육센터", rank: "센터장", location: "교외", note: "신규 추가", sort_order: 12 },
    { id: 213, committee_id: "planning", type: "위원", name: "남기석", org: "영남이공대학교", dept: "물리치료학과", rank: "교수", location: "교외", note: "", sort_order: 13 },
    { id: 214, committee_id: "planning", type: "위원", name: "이상희", org: "청강문화산업대학교", dept: "전략지원처", rank: "처장", location: "교외", note: "", sort_order: 14 },
    { id: 215, committee_id: "planning", type: "위원", name: "황영국", org: "조선이공대학교", dept: "산학협력단", rank: "단장", location: "교외", note: "", sort_order: 15 },
    { id: 216, committee_id: "planning", type: "간사", name: "심현미", org: "울산과학대학교", dept: "앵커사업단운영팀", rank: "팀장", location: "교내", note: "", sort_order: 16 }
  ],
  budget: [
    { id: 301, committee_id: "budget", type: "위원장", name: "김성철", org: "울산과학대학교", dept: "-", rank: "부총장", location: "교내", note: "", sort_order: 1 },
    { id: 302, committee_id: "budget", type: "위원", name: "김강연", org: "울산과학대학교", dept: "기획처", rank: "처장", location: "교내", note: "", sort_order: 2 },
    { id: 303, committee_id: "budget", type: "위원", name: "박일현", org: "울산과학대학교", dept: "총무처", rank: "처장", location: "교내", note: "", sort_order: 3 },
    { id: 304, committee_id: "budget", type: "위원", name: "송경영", org: "울산과학대학교", dept: "앵커사업단", rank: "사업단장", location: "교내", note: "", sort_order: 4 },
    { id: 305, committee_id: "budget", type: "위원", name: "김현수", org: "울산과학대학교", dept: "앵커사업단", rank: "총괄본부장", location: "교내", note: "", sort_order: 5 },
    { id: 306, committee_id: "budget", type: "위원", name: "고우근", org: "울산과학대학교", dept: "기획팀", rank: "팀장", location: "교내", note: "", sort_order: 6 },
    { id: 307, committee_id: "budget", type: "위원", name: "강신욱", org: "인택스세무법인", dept: "세무팀", rank: "부대표", location: "교외", note: "", sort_order: 7 },
    { id: 308, committee_id: "budget", type: "간사", name: "심현미", org: "울산과학대학교", dept: "앵커사업단운영팀", rank: "팀장", location: "교내", note: "", sort_order: 8 }
  ],
  eval: [
    { id: 401, committee_id: "eval", type: "위원장", name: "김영근", org: "대구보건대학교", dept: "경영부총장", rank: "부총장", location: "교외", note: "", sort_order: 1 },
    { id: 402, committee_id: "eval", type: "위원", name: "변홍석", org: "울산과학대학교", dept: "교무처", rank: "처장", location: "교내", note: "", sort_order: 2 },
    { id: 403, committee_id: "eval", type: "위원", name: "이주영", org: "울산과학대학교", dept: "학생취업처", rank: "처장", location: "교내", note: "", sort_order: 3 },
    { id: 404, committee_id: "eval", type: "위원", name: "서현영", org: "울산과학대학교", dept: "간호학부", rank: "학부장", location: "교내", note: "신규 추가", sort_order: 4 },
    { id: 405, committee_id: "eval", type: "위원", name: "미지정", org: "울산과학대학교", dept: "총대의원회", rank: "의장", location: "교내", note: "", sort_order: 5 },
    { id: 406, committee_id: "eval", type: "위원", name: "김봉재", org: "HD한국조선해양", dept: "-", rank: "부장", location: "교외", note: "", sort_order: 6 },
    { id: 407, committee_id: "eval", type: "위원", name: "한동호", org: "석원기공", dept: "-", rank: "대표이사", location: "교외", note: "", sort_order: 7 },
    { id: 408, committee_id: "eval", type: "위원(자문겸직)", name: "류지호", org: "아주자동차대학교", dept: "교학처", rank: "처장", location: "교외", note: "", sort_order: 8 },
    { id: 409, committee_id: "eval", type: "위원(자문겸직)", name: "박준", org: "광주보건대학교", dept: "글로벌혁신처", rank: "처장", location: "교외", note: "", sort_order: 9 },
    { id: 410, committee_id: "eval", type: "간사", name: "심현미", org: "울산과학대학교", dept: "앵커사업단운영팀", rank: "팀장", location: "교내", note: "", sort_order: 10 }
  ],
  advisory: [
    { id: 501, committee_id: "advisory", type: "위원", name: "남기석", org: "영남이공대학교", dept: "물리치료학과", rank: "교수", location: "교외", note: "", sort_order: 1 },
    { id: 502, committee_id: "advisory", type: "위원", name: "이상희", org: "청강문화산업대학교", dept: "혁신지원사업단", rank: "단장", location: "교외", note: "", sort_order: 2 },
    { id: 503, committee_id: "advisory", type: "위원", name: "황영국", org: "조선이공대학교", dept: "산학협력단", rank: "단장", location: "교외", note: "", sort_order: 3 },
    { id: 504, committee_id: "advisory", type: "위원", name: "이수경", org: "거제대학교", dept: "-", rank: "교수", location: "교외", note: "", sort_order: 4 },
    { id: 505, committee_id: "advisory", type: "위원", name: "최영오", org: "영남이공대학교", dept: "-", rank: "교수", location: "교외", note: "", sort_order: 5 },
    { id: 506, committee_id: "advisory", type: "위원", name: "남현욱", org: "춘해보건대학교", dept: "기획처", rank: "처장", location: "교외", note: "", sort_order: 6 },
    { id: 507, committee_id: "advisory", type: "위원", name: "이종향", org: "거제대학교", dept: "-", rank: "교수", location: "교외", note: "", sort_order: 7 },
    { id: 508, committee_id: "advisory", type: "간사", name: "심현미", org: "울산과학대학교", dept: "앵커사업단운영팀", rank: "팀장", location: "교내", note: "", sort_order: 8 }
  ],
  ecc_op: [
    { id: 601, committee_id: "ecc_op", type: "위원장", name: "이동은", org: "울산과학대학교", dept: "지산학교육센터(ECC)", rank: "센터장", location: "교내", note: "", sort_order: 1 },
    { id: 602, committee_id: "ecc_op", type: "위원", name: "최윤아", org: "울산과학대학교", dept: "기획처", rank: "부처장", location: "교내", note: "신규 추가", sort_order: 2 },
    { id: 603, committee_id: "ecc_op", type: "위원", name: "정문호", org: "정테크", dept: "-", rank: "대표", location: "교외", note: "", sort_order: 3 },
    { id: 604, committee_id: "ecc_op", type: "간사", name: "오영경", org: "울산과학대학교", dept: "지산학교육센터(ECC)", rank: "연구원", location: "교내", note: "", sort_order: 4 }
  ],
  icc_op: [
    { id: 701, committee_id: "icc_op", type: "위원장", name: "김기범", org: "울산과학대학교", dept: "기업협업센터(ICC)", rank: "센터장", location: "교내", note: "", sort_order: 1 },
    { id: 702, committee_id: "icc_op", type: "위원", name: "정회걸", org: "울산정보산업진흥원", dept: "인재교육센터", rank: "센터장", location: "교외", note: "", sort_order: 2 },
    { id: 703, committee_id: "icc_op", type: "위원", name: "한동호", org: "석원기공", dept: "-", rank: "대표이사", location: "교외", note: "", sort_order: 3 },
    { id: 704, committee_id: "icc_op", type: "간사", name: "김인숙", org: "울산과학대학교", dept: "기업협업센터(ICC)", rank: "연구원", location: "교내", note: "", sort_order: 4 }
  ],
  rcc_op: [
    { id: 801, committee_id: "rcc_op", type: "위원장", name: "현용환", org: "울산과학대학교", dept: "지역협업센터(RCC)", rank: "센터장", location: "교내", note: "", sort_order: 1 },
    { id: 802, committee_id: "rcc_op", type: "위원", name: "이경우", org: "울산발전연구원", dept: "경제산업연구실", rank: "실장", location: "교외", note: "", sort_order: 2 },
    { id: 803, committee_id: "rcc_op", type: "위원", name: "남기석", org: "영남이공대학교", dept: "물리치료학과", rank: "교수", location: "교외", note: "", sort_order: 3 },
    { id: 804, committee_id: "rcc_op", type: "간사", name: "강수지", org: "울산과학대학교", dept: "지역협업센터(RCC)", rank: "연구원", location: "교내", note: "", sort_order: 4 }
  ],
  aidx_op: [
    { id: 901, committee_id: "aidx_op", type: "위원장", name: "김현수", org: "울산과학대학교", dept: "AID-X지원센터", rank: "센터장", location: "교내", note: "", sort_order: 1 },
    { id: 902, committee_id: "aidx_op", type: "위원", name: "이정준", org: "울산과학대학교", dept: "기계공학부", rank: "교수", location: "교내", note: "", sort_order: 2 },
    { id: 903, committee_id: "aidx_op", type: "위원", name: "이상희", org: "청강문화산업대학교", dept: "혁신지원사업단", rank: "단장", location: "교외", note: "", sort_order: 3 },
    { id: 904, committee_id: "aidx_op", type: "간사", name: "민혜란", org: "울산과학대학교", dept: "AID-X지원센터", rank: "연구원", location: "교내", note: "", sort_order: 4 }
  ],
  neulbom_op: [
    { id: 1001, committee_id: "neulbom_op", type: "위원장", name: "홍광표", org: "울산과학대학교", dept: "울산늘봄누리센터", rank: "센터장", location: "교내", note: "", sort_order: 1 },
    { id: 1002, committee_id: "neulbom_op", type: "위원", name: "서현영", org: "울산과학대학교", dept: "간호학부", rank: "학부장", location: "교내", note: "", sort_order: 2 },
    { id: 1003, committee_id: "neulbom_op", type: "위원", name: "이수경", org: "거제대학교", dept: "-", rank: "교수", location: "교외", note: "", sort_order: 3 },
    { id: 1004, committee_id: "neulbom_op", type: "간사", name: "임서현", org: "울산과학대학교", dept: "울산늘봄누리센터", rank: "연구원", location: "교내", note: "", sort_order: 4 }
  ],
  newind_op: [
    { id: 1101, committee_id: "newind_op", type: "위원장", name: "홍진숙", org: "울산과학대학교", dept: "신산업특화센터", rank: "센터장", location: "교내", note: "", sort_order: 1 },
    { id: 1102, committee_id: "newind_op", type: "위원", name: "장광일", org: "울산과학대학교", dept: "화학공학과", rank: "교수", location: "교내", note: "", sort_order: 2 },
    { id: 1103, committee_id: "newind_op", type: "위원", name: "황영국", org: "조선이공대학교", dept: "산학협력단", rank: "단장", location: "교외", note: "", sort_order: 3 },
    { id: 1104, committee_id: "newind_op", type: "간사", name: "박지윤", org: "울산과학대학교", dept: "신산업특화센터", rank: "연구원", location: "교내", note: "", sort_order: 4 }
  ]
};

export default function CommitteeManager({ 
  currentRole, 
  currentUser, 
  activeSubTab, 
  onChangeSubTab, 
  darkMode, 
  selectedYear,
  monthlySchedules,
  setMonthlySchedules,
  eventSchedules,
  setEventSchedules,
  meetingSchedules,
  setMeetingSchedules,
  pressReleases,
  setPressReleases,
  members: allMembers
}) {
  // 1. 상태(State) 정의
  const [committees, setCommittees] = useState([]);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(() => {
    return localStorage.getItem("anchor_selected_committee_group") || "agency";
  }); // "agency"(사업단) 또는 "center"(센터별)
  
  // 💡 [전자서명 CryptoJS 복호화 헬퍼 함수] (요구사항 4 반영)
  const decryptSignature = (encSig) => {
    if (!encSig) return null;
    if (encSig.startsWith("data:image")) return encSig;
    try {
      const bytes = CryptoJS.AES.decrypt(encSig, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch (e) {
      console.error("서명 복호화 실패:", e);
      return null;
    }
  };
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [responses, setResponses] = useState([]);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // 사용자 권한 가드 상태
  const isManager = ["ADMIN", "G_DIRECTOR", "HQ_HEAD", "MANAGER"].includes(currentUser?.role_key);
  const [myMemberships, setMyMemberships] = useState([]); // 로그인 유저가 소속된 위원회 정보

  // 모달 및 폼 제어 상태
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);
  const [committeeForm, setCommitteeForm] = useState({ name: "", total_quorum: 5, voting_rule: "majority_of_attendees" });
  
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ 
    title: "", 
    meeting_date: "", 
    meeting_type: "ONLINE_WRITTEN", 
    agenda: "",
    attachment_name: "",
    attachment_data: "",
    access_pin: ""
  });

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({
    name: "",
    type: "위원",
    org: "울산과학대학교",
    dept: "",
    rank: "",
    location: "교내",
    note: "",
    sort_order: 10
  });

  // 위원 의사결정 제출 폼 상태
  const [userVote, setUserVote] = useState("");
  const [userOpinion, setUserOpinion] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Gemini API 키 관리
  const [geminiKey, setGeminiKey] = useState(() => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem("user_gemini_api_key") || "";
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  // 전자서명 패드 Canvas 레퍼런스
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 2. 초기 데이터 및 소속 정보 로드
  useEffect(() => {
    fetchCommittees();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (selectedCommittee) {
      fetchMeetings(selectedCommittee.id);
      fetchMembers(selectedCommittee.id);
    } else {
      setMeetings([]);
      setMembers([]);
      setSelectedMeeting(null);
    }
  }, [selectedCommittee]);

  useEffect(() => {
    if (selectedMeeting) {
      fetchResponses(selectedMeeting.id);
    } else {
      setResponses([]);
    }
  }, [selectedMeeting]);

  // 로그인 유저의 위원회 매핑 로드
  useEffect(() => {
    if (currentUser?.id) {
      fetchMyMemberships();
    }
  }, [currentUser, committees]);

  // 3. Supabase 데이터 조회(Fetch) 함수
  const fetchCommittees = async () => {
    try {
      const { data, error } = await supabase
        .from("committees")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      
      if (data && data.length > 0) {
        setCommittees(data);
      } else {
        setCommittees(GOVERNANCE_COMMITTEES_MASTER);
      }
    } catch (err) {
      console.error("위원회 조회 에러 (폴백 마스터 전환):", err.message);
      setCommittees(GOVERNANCE_COMMITTEES_MASTER);
    }
  };

  // 💡 [위원회 풀 분류 필터링] (요구사항 1 반영)
  const agencyIds = ["total", "planning", "budget", "eval", "advisory"];
  const centerIds = ["ecc_op", "icc_op", "rcc_op", "aidx_op", "neulbom_op", "newind_op"];

  const filteredCommittees = committees.filter(c => {
    if (selectedGroup === "agency") {
      return agencyIds.includes(c.id) || (!c.id.includes("-") && !centerIds.includes(c.id));
    } else {
      return centerIds.includes(c.id);
    }
  });

  // 💡 [새로고침 캐시 동기화 가드] 선택된 위원회 상태가 변경될 때마다 로컬 스토리지에 백업
  useEffect(() => {
    if (selectedCommittee) {
      localStorage.setItem("anchor_selected_committee_id", selectedCommittee.id);
      localStorage.setItem("anchor_selected_committee_group", selectedGroup);
    }
  }, [selectedCommittee, selectedGroup]);

  // 라디오 분류 전환 및 초기 마스터 캐시 복원
  useEffect(() => {
    if (committees.length > 0) {
      const cachedId = localStorage.getItem("anchor_selected_committee_id");
      const cachedGroup = localStorage.getItem("anchor_selected_committee_group");

      if (cachedGroup && cachedGroup !== selectedGroup) {
        setSelectedGroup(cachedGroup);
        return;
      }

      if (cachedId) {
        const found = committees.find(c => c.id === cachedId);
        if (found) {
          setSelectedCommittee(found);
          return;
        }
      }

      if (filteredCommittees.length > 0) {
        const stillInFilter = filteredCommittees.find(c => c.id === selectedCommittee?.id);
        if (!stillInFilter) {
          setSelectedCommittee(filteredCommittees[0]);
        }
      } else {
        setSelectedCommittee(null);
      }
    }
  }, [selectedGroup, committees]);

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("rise_users")
        .select("id, name, role_key")
        .order("name", { ascending: true });
      if (error) throw error;
      setAllUsers(data || []);
    } catch (err) {
      console.error("사용자 조회 에러:", err.message);
    }
  };

  const fetchMeetings = async (committeeId) => {
    try {
      const { data, error } = await supabase
        .from("committee_meetings")
        .select("*")
        .eq("committee_id", committeeId)
        .order("meeting_date", { ascending: false });
      if (error) throw error;
      
      setMeetings(data || []);
      localStorage.setItem(`local_committee_meetings_${committeeId}`, JSON.stringify(data || []));
      
      if (data && data.length > 0) {
        setSelectedMeeting(data[0]);
      } else {
        setSelectedMeeting(null);
      }
    } catch (err) {
      console.error("회의 조회 에러 (로컬 캐시 스위칭):", err.message);
      const localData = localStorage.getItem(`local_committee_meetings_${committeeId}`);
      const parsed = localData ? JSON.parse(localData) : [];
      setMeetings(parsed);
      if (parsed.length > 0) {
        setSelectedMeeting(parsed[0]);
      } else {
        setSelectedMeeting(null);
      }
    }
  };

  const fetchMembers = async (committeeId) => {
    try {
      const { data, error } = await supabase
        .from("committee_members")
        .select(`id, committee_id, type, name, org, dept, rank, location, note, sort_order`)
        .eq("committee_id", committeeId)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });
      if (error) throw error;
      
      const fallback = MOCK_COMMITTEE_MEMBERS_FALLBACK[committeeId] || [
        { committee_id: committeeId, type: "위원장", name: "송경영", org: "울산과학대학교", dept: "산학협력단(앵커)", rank: "단장", location: "교내", note: "", sort_order: 1 },
        { committee_id: committeeId, type: "위원", name: "이동은", org: "울산과학대학교", dept: "지산학교육센터(ECC)", rank: "센터장", location: "교내", note: "", sort_order: 2 }
      ];

      // 💡 [동기화 버전업 가드] 기존 데이터가 존재하지만 최신 마스터 백업 인원 수보다 적은 경우 구버전으로 판정하여 자동 배정(Upsert)
      if (data && data.length >= fallback.length) {
        setMembers(data);
        localStorage.setItem(`local_committee_members_${committeeId}`, JSON.stringify(data));
      } else {
        console.log(`위원회 [${committeeId}]에 소속된 위원 수(${data ? data.length : 0}명)가 최신 마스터 위원 수(${fallback.length}명)보다 적으므로 자동 업그레이드를 시작합니다.`);
        
        // insert 시 id 필드는 DB auto-increment를 위해 제외
        const insertPayloads = fallback.map(({ id, ...rest }) => rest);
        
        try {
          if (data && data.length > 0) {
            await supabase.from("committee_members").delete().eq("committee_id", committeeId);
          }
          const { error: insErr } = await supabase
            .from("committee_members")
            .insert(insertPayloads);
          if (insErr) throw insErr;
          
          // 성공 시 최신 정보 다시 조회
          const { data: refreshedData } = await supabase
            .from("committee_members")
            .select(`id, committee_id, type, name, org, dept, rank, location, note, sort_order`)
            .eq("committee_id", committeeId)
            .order("sort_order", { ascending: true });
          
          const finalData = refreshedData && refreshedData.length > 0 ? refreshedData : fallback;
          setMembers(finalData);
          localStorage.setItem(`local_committee_members_${committeeId}`, JSON.stringify(finalData));
        } catch (dbInsErr) {
          // DB 실패 시 로컬 스토리지에 모의 배정 저장
          console.warn("위원 자동 배정 DB 적재 실패 (오프라인 로컬 저장소 캐싱):", dbInsErr.message);
          setMembers(fallback);
          localStorage.setItem(`local_committee_members_${committeeId}`, JSON.stringify(fallback));
        }
      }
    } catch (err) {
      console.error("위원 조회 에러 (로컬 캐시 스위칭 및 강제 마이그레이션):", err.message);
      const localData = localStorage.getItem(`local_committee_members_${committeeId}`);
      const parsed = localData ? JSON.parse(localData) : [];
      const fallback = MOCK_COMMITTEE_MEMBERS_FALLBACK[committeeId] || [
        { committee_id: committeeId, type: "위원장", name: "송경영", org: "울산과학대학교", dept: "산학협력단(앵커)", rank: "단장", location: "교내", note: "", sort_order: 1 },
        { committee_id: committeeId, type: "위원", name: "이동은", org: "울산과학대학교", dept: "지산학교육센터(ECC)", rank: "센터장", location: "교내", note: "", sort_order: 2 }
      ];
      
      if (parsed.length >= fallback.length) {
        setMembers(parsed);
      } else {
        setMembers(fallback);
        localStorage.setItem(`local_committee_members_${committeeId}`, JSON.stringify(fallback));
      }
    }
  };

  const fetchResponses = async (meetingId) => {
    try {
      const { data, error } = await supabase
        .from("meeting_responses")
        .select(`
          id, meeting_id, member_id, attended, vote, opinion, encrypted_signature, submitted_at,
          committee_members ( name, type, org, dept )
        `)
        .eq("meeting_id", meetingId);
      if (error) throw error;
      
      setResponses(data || []);
      localStorage.setItem(`local_meeting_responses_${meetingId}`, JSON.stringify(data || []));

      // 내가 이미 제출했는지 검증
      if (currentUser && members.length > 0) {
        const myName = currentUser.name ? currentUser.name.split(" ")[0].split("(")[0].trim() : "";
        const myMemberObj = members.find(m => m.name === myName);
        if (myMemberObj) {
          const myResp = (data || []).find(r => r.member_id === myMemberObj.id);
          if (myResp && myResp.submitted_at) {
            setUserVote(myResp.vote || "");
            setUserOpinion(myResp.opinion || "");
            setHasSubmitted(true);
          } else {
            setUserVote("");
            setUserOpinion("");
            setHasSubmitted(false);
          }
        }
      }
    } catch (err) {
      console.error("의결 목록 조회 에러 (로컬 캐시 스위칭):", err.message);
      const localData = localStorage.getItem(`local_meeting_responses_${meetingId}`);
      const parsed = localData ? JSON.parse(localData) : [];
      setResponses(parsed);

      if (currentUser && members.length > 0) {
        const myName = currentUser.name ? currentUser.name.split(" ")[0].split("(")[0].trim() : "";
        const myMemberObj = members.find(m => m.name === myName);
        if (myMemberObj) {
          const myResp = parsed.find(r => r.member_id === myMemberObj.id);
          if (myResp && myResp.submitted_at) {
            setUserVote(myResp.vote || "");
            setUserOpinion(myResp.opinion || "");
            setHasSubmitted(true);
          } else {
            setUserVote("");
            setUserOpinion("");
            setHasSubmitted(false);
          }
        }
      }
    }
  };


  const fetchMyMemberships = async () => {
    try {
      if (!currentUser?.name) return;
      const myName = currentUser.name.split(" ")[0].split("(")[0].trim();
      const { data, error } = await supabase
        .from("committee_members")
        .select("committee_id, type, name")
        .eq("name", myName);
      if (error) throw error;
      
      const mapped = (data || []).map(m => ({
        committee_id: m.committee_id,
        role: m.type === "위원장" ? "CHAIRMAN" : m.type === "간사" ? "SECRETARY" : "MEMBER"
      }));
      setMyMemberships(mapped);
    } catch (err) {
      console.error("내 소속 정보 조회 에러:", err.message);
    }
  };

  // 4. 데이터 조작 C.R.U.D 핸들러
  const handleCreateCommittee = async (e) => {
    e.preventDefault();
    if (!committeeForm.name) {
      alert("위원회 명칭을 입력해 주세요.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("committees")
        .insert([{
          name: committeeForm.name,
          total_quorum: committeeForm.total_quorum,
          voting_rule: committeeForm.voting_rule
        }])
        .select();

      if (error) throw error;
      alert("신규 위원회가 개설되었습니다.");
      setIsCommitteeModalOpen(false);
      setCommitteeForm({ name: "", total_quorum: 5, voting_rule: "majority_of_attendees" });
      await fetchCommittees();
      if (data && data.length > 0) {
        setSelectedCommittee(data[0]);
      }
    } catch (err) {
      alert("위원회 개설 실패: " + err.message);
    }
  };

  const handleDeleteCommittee = async (id) => {
    if (!window.confirm("위원회를 삭제하시겠습니까? 연결된 위원 매핑과 회의록이 영구 소실됩니다.")) return;
    try {
      const { error } = await supabase
        .from("committees")
        .delete()
        .eq("id", id);
      if (error) throw error;
      alert("위원회가 제거되었습니다.");
      setSelectedCommittee(null);
      await fetchCommittees();
    } catch (err) {
      alert("위원회 삭제 실패: " + err.message);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name) {
      alert("위원 이름을 입력해 주세요.");
      return;
    }
    // 중복 검사
    if (members.some(m => m.name === memberForm.name.trim())) {
      alert("이미 위원회에 등록된 위원입니다.");
      return;
    }

    const payload = {
      committee_id: selectedCommittee.id,
      name: memberForm.name.trim(),
      type: memberForm.type,
      org: memberForm.org,
      dept: memberForm.dept,
      rank: memberForm.rank,
      location: memberForm.location,
      note: memberForm.note,
      sort_order: Number(memberForm.sort_order)
    };

    try {
      const { error } = await supabase
        .from("committee_members")
        .insert([payload]);

      if (error) throw error;
      alert("위원이 배정되었습니다.");
      setIsMemberModalOpen(false);
      setMemberForm({
        name: "",
        type: "위원",
        org: "울산과학대학교",
        dept: "",
        rank: "",
        location: "교내",
        note: "",
        sort_order: 10
      });
      await fetchMembers(selectedCommittee.id);
      
      const newQuorum = members.length + 1;
      await supabase
        .from("committees")
        .update({ total_quorum: newQuorum })
        .eq("id", selectedCommittee.id);
      await fetchCommittees();
    } catch (err) {
      console.warn("DB 위원 배정 실패, 로컬 스토리지에 모의 저장합니다:", err.message);
      
      const localMembers = JSON.parse(localStorage.getItem(`local_committee_members_${selectedCommittee.id}`) || "[]");
      const localPayload = { ...payload, id: `local-member-${Date.now()}` };
      const updated = [...localMembers, localPayload];
      localStorage.setItem(`local_committee_members_${selectedCommittee.id}`, JSON.stringify(updated));
      
      alert("위원이 배정되었습니다. (오프라인 캐시 모드)");
      setIsMemberModalOpen(false);
      setMemberForm({
        name: "",
        type: "위원",
        org: "울산과학대학교",
        dept: "",
        rank: "",
        location: "교내",
        note: "",
        sort_order: 10
      });
      setMembers(updated);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("이 위원을 위원회에서 제외하시겠습니까?")) return;
    try {
      const { error } = await supabase
        .from("committee_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
      alert("위원이 제외되었습니다.");
      await fetchMembers(selectedCommittee.id);

      const newQuorum = Math.max(0, members.length - 1);
      await supabase
        .from("committees")
        .update({ total_quorum: newQuorum })
        .eq("id", selectedCommittee.id);
      await fetchCommittees();
    } catch (err) {
      console.warn("DB 위원 삭제 실패, 로컬 스토리지에서 제거합니다:", err.message);
      const localMembers = JSON.parse(localStorage.getItem(`local_committee_members_${selectedCommittee.id}`) || "[]");
      const updated = localMembers.filter(m => m.id !== memberId);
      localStorage.setItem(`local_committee_members_${selectedCommittee.id}`, JSON.stringify(updated));
      alert("위원이 제외되었습니다. (오프라인 캐시 모드)");
      setMembers(updated);
    }
  };

  // 💡 [안건 의결 서류 첨부 파일 핸들러] (요구사항 3 반영)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ["pdf", "png", "jpg", "jpeg", "md"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      alert("탑재 불가능한 파일 형식입니다. (pdf, png, jpg, jpeg, md 파일만 지원)");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 최대 10MB 이하만 가능합니다.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMeetingForm(prev => ({
        ...prev,
        attachment_name: file.name,
        attachment_data: reader.result
      }));
    };
    reader.onerror = (err) => {
      console.error("파일 로드 에러:", err);
      alert("파일 인코딩 에러가 발생했습니다.");
    };
    reader.readAsDataURL(file);
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!meetingForm.title || !meetingForm.meeting_date || !meetingForm.agenda) {
      alert("모든 필수 항목을 기입해 주세요.");
      return;
    }

    const generatedPin = meetingForm.access_pin.trim() || Math.floor(100000 + Math.random() * 900000).toString();
    const payload = {
      committee_id: selectedCommittee.id,
      title: meetingForm.title,
      meeting_date: meetingForm.meeting_date,
      meeting_type: meetingForm.meeting_type,
      agenda: meetingForm.agenda,
      attachment_name: meetingForm.attachment_name || null,
      attachment_data: meetingForm.attachment_data || null,
      access_pin: generatedPin,
      status: "ACTIVE"
    };

    try {
      const { data, error } = await supabase
        .from("committee_meetings")
        .insert([payload])
        .select();

      if (error) throw error;
      alert(`위원회 회의 일정이 등록되었습니다.\n[외부 위원용 보안 PIN]: ${generatedPin}`);
      setIsMeetingModalOpen(false);
      setMeetingForm({ 
        title: "", 
        meeting_date: "", 
        meeting_type: "ONLINE_WRITTEN", 
        agenda: "",
        attachment_name: "",
        attachment_data: "",
        access_pin: ""
      });
      await fetchMeetings(selectedCommittee.id);
      if (data && data.length > 0) {
        setSelectedMeeting(data[0]);
      }
    } catch (err) {
      console.warn("DB 회의 등록 실패, 로컬 스토리지에 모의 저장합니다:", err.message);
      const localMeetings = JSON.parse(localStorage.getItem(`local_committee_meetings_${selectedCommittee.id}`) || "[]");
      const localPayload = { ...payload, id: `local-meeting-${Date.now()}`, created_at: new Date().toISOString() };
      const updated = [localPayload, ...localMeetings];
      localStorage.setItem(`local_committee_meetings_${selectedCommittee.id}`, JSON.stringify(updated));
      
      alert(`위원회 회의 일정이 등록되었습니다. (오프라인 캐시 모드)\n[외부 위원용 보안 PIN]: ${generatedPin}`);
      setIsMeetingModalOpen(false);
      setMeetingForm({ 
        title: "", 
        meeting_date: "", 
        meeting_type: "ONLINE_WRITTEN", 
        agenda: "",
        attachment_name: "",
        attachment_data: "",
        access_pin: ""
      });
      setMeetings(updated);
      setSelectedMeeting(localPayload);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm("이 회의 안건을 삭제하시겠습니까? 관련 투표와 요약 회의록이 모두 소실됩니다.")) return;
    try {
      const { error } = await supabase
        .from("committee_meetings")
        .delete()
        .eq("id", meetingId);
      if (error) throw error;
      alert("회의가 취소되었습니다.");
      setSelectedMeeting(null);
      await fetchMeetings(selectedCommittee.id);
    } catch (err) {
      console.warn("DB 회의 삭제 실패, 로컬 스토리지에서 제거합니다:", err.message);
      const localMeetings = JSON.parse(localStorage.getItem(`local_committee_meetings_${selectedCommittee.id}`) || "[]");
      const updated = localMeetings.filter(m => m.id !== meetingId);
      localStorage.setItem(`local_committee_meetings_${selectedCommittee.id}`, JSON.stringify(updated));
      alert("회의가 취소되었습니다. (오프라인 캐시 모드)");
      setSelectedMeeting(null);
      setMeetings(updated);
    }
  };

  // 5. 전자서명 그리기 캔버스 핸들러
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // 6. 위원 참석 및 의결(의결서) 제출 핸들러 (Rule 8 암호화 적용)
  const handleSubmitVote = async () => {
    if (!selectedMeeting) return;
    if (!userVote) {
      alert("안건에 대한 찬/반 여부를 선택해 주세요.");
      return;
    }
    if (!userOpinion.trim()) {
      alert("의견서 본문을 작성해 주세요.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL("image/png");
    
    const blankCanvas = document.createElement("canvas");
    blankCanvas.width = canvas.width;
    blankCanvas.height = canvas.height;
    if (signatureDataUrl === blankCanvas.toDataURL("image/png")) {
      alert("전자서명 패드에 서명을 완성해 주세요.");
      return;
    }

    // 💡 [Rule 8] 서명 이미지 Base64 데이터를 대칭키 AES로 암호화하여 보안 전송
    const encryptedSig = CryptoJS.AES.encrypt(signatureDataUrl, SECRET_KEY).toString();

    // 내가 이 위원회에서 배정된 멤버 레코드 ID 획득
    const myMemberObj = members.find(m => m.user_id === currentUser.id);
    if (!myMemberObj) {
      alert("귀하는 이 위원회의 위원 명단에 존재하지 않습니다.");
      return;
    }

    const payload = {
      meeting_id: selectedMeeting.id,
      member_id: myMemberObj.id,
      attended: true,
      vote: userVote,
      opinion: userOpinion,
      encrypted_signature: encryptedSig,
      submitted_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from("meeting_responses")
        .upsert([payload], { onConflict: "meeting_id, member_id" });

      if (error) throw error;
      alert("의사결정서 및 서명이 안전하게 암호화되어 제출되었습니다.");
      setHasSubmitted(true);
      await fetchResponses(selectedMeeting.id);
    } catch (err) {
      console.warn("DB 의결 제출 실패, 로컬 스토리지에 모의 기록합니다:", err.message);
      
      const localResponses = JSON.parse(localStorage.getItem(`local_meeting_responses_${selectedMeeting.id}`) || "[]");
      const localPayload = {
        ...payload,
        id: `local-response-${Date.now()}`,
        committee_members: {
          name: myMemberObj.name,
          type: myMemberObj.type,
          org: myMemberObj.org,
          dept: myMemberObj.dept
        }
      };
      
      // 기존에 존재하면 업데이트, 없으면 추가
      const idx = localResponses.findIndex(r => r.member_id === myMemberObj.id);
      let updated;
      if (idx > -1) {
        updated = [...localResponses];
        updated[idx] = localPayload;
      } else {
        updated = [...localResponses, localPayload];
      }
      localStorage.setItem(`local_meeting_responses_${selectedMeeting.id}`, JSON.stringify(updated));
      
      alert("의사결정서 및 서명이 제출되었습니다. (오프라인 캐시 모드)");
      setHasSubmitted(true);
      setResponses(updated);
    }
  };

  // 7. 정족수 실시간 계산 유틸리티 연동
  const calculateQuorum = () => {
    if (!selectedCommittee || !selectedMeeting) return null;
    const total = selectedCommittee.total_quorum || members.length || 1;
    const attended = responses.filter(r => r.attended).length;
    
    // 의사정족수: 재적 과반
    const majorityLimit = Math.floor(total / 2) + 1;
    const isEstablished = attended >= majorityLimit;

    // 의결정족수: 찬성표 산출
    const approveCount = responses.filter(r => r.vote === "APPROVE").length;
    const rejectCount = responses.filter(r => r.vote === "REJECT").length;
    const abstainCount = responses.filter(r => r.vote === "ABSTAIN").length;

    let isApproved = false;
    let ruleText = "";
    if (selectedCommittee.voting_rule === "majority_of_attendees") {
      const req = Math.floor(attended / 2) + 1;
      isApproved = approveCount >= req;
      ruleText = `출석 과반 찬성 (필요: ${req}표 / 현재 찬성: ${approveCount}표)`;
    } else {
      const req = Math.floor(total / 2) + 1;
      isApproved = approveCount >= req;
      ruleText = `재적 과반 찬성 (필요: ${req}표 / 현재 찬성: ${approveCount}표)`;
    }

    return {
      total,
      attended,
      majorityLimit,
      isEstablished,
      approveCount,
      rejectCount,
      abstainCount,
      isApproved,
      ruleText
    };
  };

  const qInfo = calculateQuorum();

  // 8. Gemini API 기반 회의록 AI 자동 요약 & 탑재 핸들러
  const handleAiMeetingAnalysis = async () => {
    if (!selectedMeeting) return;
    if (responses.length === 0) {
      alert("제출된 위원 의견이 없어 분석을 진행할 수 없습니다.");
      return;
    }
    if (!geminiKey) {
      setShowKeyInput(true);
      alert("Gemini API Key를 입력해 주셔야 AI 요약이 진행됩니다.");
      return;
    }

    setIsAnalyzing(true);
    try {
      // 위원들의 의견 수집
      const opinionsContext = responses
        .map((r, idx) => `[위원 ${idx + 1} - ${r.vote === "APPROVE" ? "찬성" : r.vote === "REJECT" ? "반대" : "기권"}]: ${r.opinion}`)
        .join("\n");

      const prompt = `역할: 울산과학대학교 RISE 사업단 전문 AI 분석관
작업: 아래 수집된 위원들의 회의 안건 의견들을 객관적으로 분석하여 결과 보고서 형식으로 요약해줘.
모든 텍스트는 친절한 존댓말 한글로 작성하며 주관적인 판단 대신 위원들의 의견 분포를 정량적/정성적으로 균형있게 요약해야 함.

[안건명]: ${selectedMeeting.title}
[안건 세부 요지]: ${selectedMeeting.agenda}

[위원회 의결 기준]: ${selectedCommittee.name} / ${qInfo?.ruleText}
[최종 성원 요건]: 재적 ${qInfo?.total}명 중 ${qInfo?.attended}명 참석하여 ${qInfo?.isEstablished ? "성원됨" : "미성원됨"}
[최종 표결 결과]: 찬성 ${qInfo?.approveCount}표, 반대 ${qInfo?.rejectCount}표, 기권 ${qInfo?.abstainCount}표 ➡️ 최종 결과: ${qInfo?.isApproved ? "가결(Approved)" : "부결(Rejected)"}

[수집된 위원별 세부 의견]:
${opinionsContext}

요구 형식:
### 1. 종합 찬반 동향 및 핵심 논지
(찬성률과 주요 지지 근거 및 우려사항 분석 요약)

### 2. 안건별 세부 쟁점 및 보완 권고사항
(위원들이 명시한 이견 및 보완 사항 요약 기술)

### 3. 향후 사업단 추진 방향 및 AI 종합 제언
(가결/부결 결과에 따른 구체적 실행 로직 제언)`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) throw new Error("Gemini API 호출에 실패했습니다.");
      const json = await response.json();
      const aiSummaryText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiSummaryText) throw new Error("AI 분석 결과 파싱에 실패했습니다.");

      // AI 요약 및 의결 확정 결과를 Supabase DB에 탑재
      const { error: resultErr } = await supabase
        .from("meeting_results")
        .upsert([{
          meeting_id: selectedMeeting.id,
          is_established: qInfo?.isEstablished,
          decision_status: qInfo?.isEstablished ? (qInfo?.isApproved ? "APPROVED" : "REJECTED") : "CANCELLED",
          ai_summary: aiSummaryText,
          official_minutes: `[회의록 자동 생성] 본 위원회는 재적 ${qInfo?.total}명 중 ${qInfo?.attended}명 참석으로 성원되었으며, 투표 결과 최종 ${qInfo?.isApproved ? "가결" : "부결"}되었음을 증명합니다.`,
          published_at: new Date().toISOString()
        }], { onConflict: "meeting_id" });

      if (resultErr) throw resultErr;

      // 회의 상태를 대시보드 탑재 완료(REPORTED) 및 CLOSED로 변경
      const { error: meetingErr } = await supabase
        .from("committee_meetings")
        .update({ status: "REPORTED" })
        .eq("id", selectedMeeting.id);

      if (meetingErr) throw meetingErr;

      alert("AI 의견 분석 및 대시보드 탑재가 성공적으로 완료되었습니다.");
      await fetchMeetings(selectedCommittee.id);
      onChangeSubTab("committee_report"); // 결과보고 대장 탭으로 연계 이동
    } catch (err) {
      alert("AI 요약 분석 실패: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveGeminiKey = () => {
    localStorage.setItem("user_gemini_api_key", geminiKey.trim());
    setShowKeyInput(false);
    alert("Gemini API Key가 안전하게 브라우저 로컬 캐시에 저장되었습니다.");
  };

  // 9. 결과보고 대장 동적 로드용
  const [reports, setReports] = useState([]);
  useEffect(() => {
    if (activeSubTab === "committee_report") {
      fetchReports();
    }
  }, [activeSubTab, selectedYear]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("meeting_results")
        .select(`
          id,
          meeting_id,
          is_established,
          decision_status,
          ai_summary,
          official_minutes,
          published_at,
          committee_meetings (
            title,
            meeting_date,
            meeting_type,
            agenda,
            committee_id,
            committees ( name )
          )
        `)
        .order("published_at", { ascending: false });
      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error("보고서 조회 에러:", err.message);
    }
  };

  // 10. 마크다운 분석 텍스트 가시화 헬퍼 (AI 요약 텍스트 가독성 확보)
  const renderMarkdownText = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("###")) {
        return <h4 key={idx} style={{ color: "var(--accent-color)", marginTop: "1rem", marginBottom: "0.5rem" }}>{line.replace("###", "").trim()}</h4>;
      }
      if (line.startsWith("##")) {
        return <h3 key={idx} style={{ color: "var(--text-primary)", marginTop: "1.2rem", marginBottom: "0.6rem" }}>{line.replace("##", "").trim()}</h3>;
      }
      if (line.startsWith("-") || line.startsWith("*")) {
        return <li key={idx} style={{ marginLeft: "1.5rem", listStyleType: "disc", marginVertical: "0.25rem" }}>{line.substring(1).trim()}</li>;
      }
      return <p key={idx} style={{ marginVertical: "0.4rem", lineHeight: "1.6", color: "var(--text-secondary)" }}>{line}</p>;
    });
  };

  // 내 소속 위원회 정보 렌더링용
  const isUserCommitteeMember = selectedCommittee && myMemberships.some(m => m.committee_id === selectedCommittee.id);
  const myRoleInCommittee = selectedCommittee && myMemberships.find(m => m.committee_id === selectedCommittee.id)?.role;

  return (
    <div className="card" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
      
      {/* AI API 키 설정 플로팅 위젯 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.2rem" }}>
          <button
            onClick={() => onChangeSubTab("committee_meeting")}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.05rem",
              fontWeight: "800",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              color: activeSubTab === "committee_meeting" ? "var(--accent-color)" : "var(--text-secondary)",
              borderBottom: activeSubTab === "committee_meeting" ? "2.5px solid var(--accent-color)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            회의 운영 및 의결
          </button>
          <button
            onClick={() => onChangeSubTab("committee_report")}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.05rem",
              fontWeight: "800",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              color: activeSubTab === "committee_report" ? "var(--accent-color)" : "var(--text-secondary)",
              borderBottom: activeSubTab === "committee_report" ? "2.5px solid var(--accent-color)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            위원회 결과보고 대장
          </button>
          <button
            onClick={() => onChangeSubTab("committees")}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.05rem",
              fontWeight: "800",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              color: activeSubTab === "committees" ? "var(--accent-color)" : "var(--text-secondary)",
              borderBottom: activeSubTab === "committees" ? "2.5px solid var(--accent-color)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            위원회 명단 관리
          </button>
        </div>


      </div>

      {/* ======================================================== */}
      {/* 탭 A: 회의 운영 및 의결 */}
      {/* ======================================================== */}
      {activeSubTab === "committee_meeting" && (
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          
          {/* 좌측 사이드: 위원회 및 회의 목록 선택 */}
          <div style={{ flex: "1 1 25%", minWidth: "260px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* 위원회 선택 헤더 */}
            <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Users size={16} /> 위원회 풀(Pool)
                </span>
              </div>

              {/* 💡 [사업단 vs 센터별 라디오 체크 버튼 구분] (요구사항 1 반영) */}
              <div style={{ display: "flex", gap: "1rem", marginBottom: "0.6rem", fontSize: "0.85rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", color: "var(--text-primary)" }}>
                  <input
                    type="radio"
                    name="committee_group"
                    value="agency"
                    checked={selectedGroup === "agency"}
                    onChange={() => setSelectedGroup("agency")}
                    style={{ accentColor: "var(--accent-color)" }}
                  />
                  <span>사업단 위원회</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", color: "var(--text-primary)" }}>
                  <input
                    type="radio"
                    name="committee_group"
                    value="center"
                    checked={selectedGroup === "center"}
                    onChange={() => setSelectedGroup("center")}
                    style={{ accentColor: "var(--accent-color)" }}
                  />
                  <span>센터별 자문위원회</span>
                </label>
              </div>

              <select
                value={selectedCommittee?.id || ""}
                onChange={(e) => {
                  const com = committees.find(c => c.id === e.target.value);
                  setSelectedCommittee(com || null);
                }}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
              >
                {filteredCommittees.length === 0 ? (
                  <option value="">등록된 위원회 없음</option>
                ) : (
                  filteredCommittees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                )}
              </select>

              {/* 위원회 삭제 (관리자용) */}
              {isManager && selectedCommittee && (
                <button
                  onClick={() => handleDeleteCommittee(selectedCommittee.id)}
                  style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.2rem" }}
                >
                  <Trash2 size={12} /> 위원회 완전 제거
                </button>
              )}
            </div>

            {/* 위원 구성 대장 */}
            <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: "800", color: "var(--text-primary)" }}>
                  소속 위원 ({members.length}명)
                </span>
                {isManager && selectedCommittee && (
                  <button className="btn btn-secondary" onClick={() => setIsMemberModalOpen(true)} style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}>
                    <Plus size={12} /> 위원 배정
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {members.length === 0 ? (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>등록된 위원이 없습니다.</span>
                ) : (
                  members.map(m => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)", padding: "0.3rem 0.5rem", borderRadius: "4px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>
                        {m.name} <small style={{ color: "var(--accent-color)", fontWeight: "bold" }}>({m.type || "위원"})</small>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginLeft: "0.3rem", display: "inline-block" }}>
                          {m.org} {m.dept}
                        </span>
                      </span>
                      {isManager && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
 
            {/* 회의 안건 리스트 */}
            <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: "800", color: "var(--text-primary)" }}>
                  회의 의결 목록
                </span>
                {isManager && selectedCommittee && (
                  <button className="btn btn-primary" onClick={() => setIsMeetingModalOpen(true)} style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}>
                    <Plus size={12} /> 회의 생성
                  </button>
                )}
              </div>
 
              <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {meetings.length === 0 ? (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>개설된 회의가 없습니다.</span>
                ) : (
                  meetings.map(m => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMeeting(m)}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "6px",
                        border: selectedMeeting?.id === m.id ? "1px solid var(--accent-color)" : "1px solid transparent",
                        background: selectedMeeting?.id === m.id ? "rgba(var(--accent-color-rgb), 0.1)" : "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--text-primary)" }}>{m.title}</span>
                        <span style={{
                          fontSize: "0.65rem",
                          padding: "0.15rem 0.3rem",
                          borderRadius: "4px",
                          background: m.status === "REPORTED" ? "var(--success-color-bg)" : "var(--accent-color-bg)",
                          color: m.status === "REPORTED" ? "var(--success-color)" : "var(--accent-color)"
                        }}>
                          {m.status === "REPORTED" ? "의결완료" : "의결중"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        <span>{m.meeting_type === "ONLINE_WRITTEN" ? "서면의결" : "대면의결"}</span>
                        <span>{m.meeting_date ? m.meeting_date.substring(0, 10) : ""}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
 
          {/* 우측 메인: 회의 상세 현황 및 위원 투표 입력판 */}
          <div style={{ flex: "1 1 70%", minWidth: "400px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {selectedMeeting ? (
              <>
                {/* 회의 개요 및 성원 실시간 전광판 */}
                <div className="card" style={{ padding: "1.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                        {selectedMeeting.title}
                      </h2>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        의결 기한: {selectedMeeting.meeting_date ? new Date(selectedMeeting.meeting_date).toLocaleString() : ""} | {selectedMeeting.meeting_type === "ONLINE_WRITTEN" ? "서면 회의" : "대면 회의"}
                      </p>
                    </div>

                    {isManager && (
                      <button
                        onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                        className="btn btn-secondary"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", color: "#ef4444" }}
                      >
                        <Trash2 size={14} /> 회의 취소
                      </button>
                    )}
                  </div>

                  {/* 안건 원문 */}
                  <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(0,0,0,0.3)", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--accent-color)", display: "block", marginBottom: "0.25rem" }}>회의 안건 요지</strong>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "pre-line", lineHeight: "1.5" }}>{selectedMeeting.agenda}</p>
                  </div>

                  {/* 💡 [회의 첨부파일 뷰어 / 다운로드 영역] (요구사항 3 반영) */}
                  {selectedMeeting.attachment_name && (
                    <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(99, 102, 241, 0.05)", borderRadius: "6px", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.8rem", color: "#fff", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          📎 심의 첨부 자료: {selectedMeeting.attachment_name}
                        </span>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = selectedMeeting.attachment_data;
                            link.download = selectedMeeting.attachment_name;
                            link.click();
                          }}
                        >
                          다운로드
                        </button>
                      </div>

                      {/* 이미지 파일일 경우 이미지 뷰어 즉시 노출 */}
                      {/\.(png|jpe?g)$/i.test(selectedMeeting.attachment_name) && (
                        <div style={{ display: "flex", justifyContent: "center", background: "#000", padding: "0.5rem", borderRadius: "4px", marginTop: "0.5rem", maxHeight: "250px", overflow: "hidden" }}>
                          <img
                            src={selectedMeeting.attachment_data}
                            alt="첨부 이미지"
                            style={{ maxWidth: "100%", maxHeight: "230px", objectFit: "contain", borderRadius: "4px" }}
                          />
                        </div>
                      )}

                      {/* 마크다운 파일(.md)일 경우 텍스트 영역에 간이 파싱 노출 */}
                      {/\.md$/i.test(selectedMeeting.attachment_name) && (
                        <div style={{ background: "#111", padding: "0.75rem", borderRadius: "4px", marginTop: "0.5rem", border: "1px solid var(--border-color)", fontSize: "0.8rem", color: "var(--text-secondary)", maxHeight: "200px", overflowY: "auto", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                          {(() => {
                            try {
                              const base64Str = selectedMeeting.attachment_data.split(",")[1];
                              return decodeURIComponent(atob(base64Str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                            } catch (e) {
                              return "마크다운 문서 디코딩 실패 또는 데이터 형식 오류";
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 💡 [외부 위원 전용 접속 링크 및 보안 PIN 배너] (요구사항 4 반영) */}
                  <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(16, 185, 129, 0.05)", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ fontSize: "0.8rem" }}>
                      <span style={{ color: "#10B981", fontWeight: "bold", display: "block", marginBottom: "0.15rem" }}>🔗 외부 위원 의결 채널 링크</span>
                      <code style={{ background: "rgba(0,0,0,0.3)", padding: "0.2rem 0.4rem", borderRadius: "4px", color: "#a7f3d0", fontSize: "0.75rem" }}>
                        {`${window.location.origin}${window.location.pathname}?mode=vote&meetingId=${selectedMeeting.id}`}
                      </code>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ fontSize: "0.75rem", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: "bold" }}>
                        보안 PIN: {selectedMeeting.access_pin || "123456"}
                      </span>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => {
                          const url = `${window.location.origin}${window.location.pathname}?mode=vote&meetingId=${selectedMeeting.id}`;
                          const copyText = `안녕하세요, RISE 위원회 위원님.\n\n개설된 회의 심의 의결 안내 드립니다.\n\n■ 회의 안건: ${selectedMeeting.title}\n■ 접속 링크: ${url}\n■ 보안 PIN코드: ${selectedMeeting.access_pin || "123456"}\n\n위 링크로 접속하신 후 위원 성명과 보안 PIN코드를 입력하시고 의결 및 전자서명을 제출해 주시기 바랍니다.`;
                          navigator.clipboard.writeText(copyText);
                          alert("외부 위원 안내문 및 접속 링크가 클립보드에 복사되었습니다!");
                        }}
                      >
                        안내문 복사
                      </button>
                    </div>
                  </div>

                  {/* 실시간 성원/의결 전광판 */}
                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>재적 위원 수</span>
                      <strong style={{ fontSize: "1.5rem", color: "#fff" }}>{qInfo?.total}명</strong>
                    </div>
                    <div style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>출석(의결) 인원</span>
                      <strong style={{ fontSize: "1.5rem", color: qInfo?.isEstablished ? "var(--success-color)" : "#ef4444" }}>
                        {qInfo?.attended}명
                      </strong>
                    </div>
                    <div style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>의사정족수 (성원)</span>
                      <strong style={{ fontSize: "1rem", display: "block", marginTop: "0.25rem", color: qInfo?.isEstablished ? "var(--success-color)" : "#ef4444" }}>
                        {qInfo?.isEstablished ? "성원 완료" : `과반 미달 (${qInfo?.majorityLimit}명 필요)`}
                      </strong>
                    </div>
                    <div style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>의결정족수 (가결)</span>
                      <strong style={{ fontSize: "1rem", display: "block", marginTop: "0.25rem", color: qInfo?.isApproved ? "var(--success-color)" : "#ef4444" }}>
                        {qInfo?.isEstablished ? (qInfo?.isApproved ? "가결 요건 충족" : "부결/의결 미달") : "성원 대기"}
                      </strong>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: "0.75rem", color: "var(--accent-color)", marginTop: "0.5rem", textStyle: "italic" }}>
                    ℹ️ 의결 정족수 기준: {qInfo?.ruleText}
                  </div>
                </div>

                {/* 1. 위원 의사결정서 제출 패널 */}
                {isUserCommitteeMember && selectedMeeting.status === "ACTIVE" && (
                  <div className="card" style={{ padding: "1.25rem", border: "1px solid var(--accent-color)", background: "rgba(var(--accent-color-rgb), 0.03)" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#fff", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Vote size={18} style={{ color: "var(--accent-color)" }} />
                      위원 의사결정서 온라인 제출
                    </h3>

                    {hasSubmitted ? (
                      <div style={{ textAlign: "center", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                        <Check size={32} style={{ color: "var(--success-color)", marginBottom: "0.25rem" }} />
                        <p style={{ fontSize: "0.9rem", color: "#fff", fontWeight: "bold" }}>의결서 제출이 완료되었습니다.</p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                          제출 내용: 찬반여부 - {userVote === "APPROVE" ? "찬성" : userVote === "REJECT" ? "반대" : "기권"}
                        </p>
                        <button className="btn btn-secondary" onClick={() => setHasSubmitted(false)} style={{ marginTop: "0.5rem", fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                          의결서 수정하기
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {/* 찬반기권 선택 */}
                        <div>
                          <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>
                            1. 찬/반 의결 여부
                          </label>
                          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.25rem" }}>
                            <label style={{ color: "#fff", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                              <input type="radio" name="vote" value="APPROVE" checked={userVote === "APPROVE"} onChange={(e) => setUserVote(e.target.value)} />
                              찬성
                            </label>
                            <label style={{ color: "#fff", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                              <input type="radio" name="vote" value="REJECT" checked={userVote === "REJECT"} onChange={(e) => setUserVote(e.target.value)} />
                              반대
                            </label>
                            <label style={{ color: "#fff", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                              <input type="radio" name="vote" value="ABSTAIN" checked={userVote === "ABSTAIN"} onChange={(e) => setUserVote(e.target.value)} />
                              기권
                            </label>
                          </div>
                        </div>

                        {/* 상세 의견 작성 */}
                        <div>
                          <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>
                            2. 심의 검토 의견서
                          </label>
                          <textarea
                            rows={3}
                            placeholder="안건 검토 결과 및 보완의견을 1~2문장으로 상세히 기술해 주세요."
                            value={userOpinion}
                            onChange={(e) => setUserOpinion(e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)", fontSize: "0.85rem", resize: "none" }}
                          />
                        </div>

                        {/* 전자 서명 패드 */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                            <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                              <Lock size={12} style={{ color: "var(--accent-color)" }} />
                              3. 위원 서명 (암호화 보안 저장)
                            </label>
                            <button onClick={clearCanvas} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "0.75rem", cursor: "pointer" }}>
                              지우기
                            </button>
                          </div>

                          <canvas
                            ref={canvasRef}
                            width={350}
                            height={100}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            style={{
                              background: "#fff",
                              borderRadius: "6px",
                              border: "1px solid var(--border-color)",
                              cursor: "crosshair",
                              width: "100%",
                              height: "100px",
                              display: "block"
                            }}
                          />
                        </div>

                        <button className="btn btn-primary" onClick={handleSubmitVote} style={{ width: "100%", padding: "0.5rem", fontWeight: "bold", fontSize: "0.9rem" }}>
                          의결 동의 및 암호화 서명 제출
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. 실시간 표결 및 위원 의견 취합 현황 판 */}
                <div className="card" style={{ padding: "1.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <FileText size={16} /> 위원 심의 의견 현황 ({responses.length}명 제출)
                    </h3>

                    {/* AI 의견 요약 & 탑재 버튼 (간사 또는 관리자 권한만 활성화) */}
                    {isManager && selectedMeeting.status === "ACTIVE" && (
                      <button
                        className="btn btn-primary"
                        onClick={handleAiMeetingAnalysis}
                        disabled={isAnalyzing || responses.length === 0}
                        style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                      >
                        <Cpu size={14} /> AI 의견 종합 분석 및 탑재
                      </button>
                    )}
                  </div>

                  {isAnalyzing && (
                    <div style={{ textAlign: "center", padding: "1.5rem", background: "rgba(0,0,0,0.3)", borderRadius: "6px", marginBottom: "0.75rem", border: "1px dashed var(--accent-color)" }}>
                      <div className="spinner" style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-color)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      <p style={{ fontSize: "0.85rem", color: "#fff", marginTop: "0.5rem" }}>Gemini AI가 위원들의 서면 의견을 통합 분석하고 대시보드 결과 보고서를 구성하고 있습니다...</p>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
                    {responses.length === 0 ? (
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center", padding: "1rem" }}>
                        현재 제출된 위원 심의 의견서가 없습니다.
                      </span>
                    ) : (
                      responses.map((r, idx) => (
                        <div key={r.id} style={{ padding: "0.6rem 0.8rem", borderRadius: "6px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                          <span style={{
                            fontSize: "0.7rem",
                            padding: "0.15rem 0.4rem",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            background: r.vote === "APPROVE" ? "rgba(34, 197, 94, 0.15)" : r.vote === "REJECT" ? "rgba(239, 68, 68, 0.15)" : "rgba(156, 163, 175, 0.15)",
                            color: r.vote === "APPROVE" ? "#22c55e" : r.vote === "REJECT" ? "#ef4444" : "#9ca3af"
                          }}>
                            {r.vote === "APPROVE" ? "찬성" : r.vote === "REJECT" ? "반대" : "기권"}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <strong style={{ fontSize: "0.8rem", color: "#fff" }}>
                                {r.committee_members?.rise_users?.name} <small style={{ color: "var(--text-secondary)" }}>({r.committee_members?.rise_users?.dept_name})</small>
                              </strong>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                                {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : ""}
                              </span>
                            </div>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>{r.opinion}</p>
                          </div>
                          
                          {/* 서명 완료 마크 및 복호화 이미지 시각화 */}
                          {r.encrypted_signature && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.1rem", color: "var(--success-color)", fontSize: "0.7rem" }}>
                                <UserCheck size={12} /> 서명필
                              </div>
                              {decryptSignature(r.encrypted_signature) && (
                                <img
                                  src={decryptSignature(r.encrypted_signature)}
                                  alt="전자서명"
                                  style={{
                                    height: "28px",
                                    background: "#fff",
                                    borderRadius: "4px",
                                    padding: "2px",
                                    border: "1px solid var(--border-color)",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
                <ClipboardList size={48} style={{ display: "block", margin: "0 auto 1rem auto" }} />
                <span>왼쪽 회의 목록에서 안건을 선택하거나 새로운 회의 의결을 생성해 주세요.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 탭 B: 위원회 결과보고 대장 */}
      {/* ======================================================== */}
      {activeSubTab === "committee_report" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff" }}>
                위원회 의결 결과보고 대장
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                성원 및 표결 요건을 충족하여 가결/부결 처리된 공식 보고서 목록입니다.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {reports.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4.5rem", color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
                <FileText size={48} style={{ display: "block", margin: "0 auto 1rem auto" }} />
                <span>아직 탑재 완료(AI 종합 분석)된 위원회 결과 보고서가 없습니다.</span>
              </div>
            ) : (
              reports.map(rep => (
                <div
                  key={rep.id}
                  className="card"
                  style={{
                    padding: "1.5rem",
                    borderRadius: "10px",
                    border: "1px solid var(--border-color)",
                    background: "rgba(255,255,255,0.01)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--accent-color)", fontWeight: "bold", display: "block" }}>
                        {rep.committee_meetings?.committees?.name}
                      </span>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#fff", marginTop: "0.15rem" }}>
                        {rep.committee_meetings?.title}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        의결 형태: {rep.committee_meetings?.meeting_type === "ONLINE_WRITTEN" ? "서면의결" : "대면의결"} | 보고서 탑재일: {rep.published_at ? new Date(rep.published_at).toLocaleString() : ""}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <span style={{
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "6px",
                        background: rep.is_established ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: rep.is_established ? "#22c55e" : "#ef4444"
                      }}>
                        {rep.is_established ? "의결 성원" : "미성원 취소"}
                      </span>
                      <span style={{
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "6px",
                        background: rep.decision_status === "APPROVED" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                        color: rep.decision_status === "APPROVED" ? "#10b981" : "#ef4444"
                      }}>
                        {rep.decision_status === "APPROVED" ? "안건 가결" : rep.decision_status === "REJECTED" ? "안건 부결" : "의결 취소"}
                      </span>
                    </div>
                  </div>

                  {/* 안건 요지 */}
                  <div style={{ padding: "0.75rem", background: "rgba(0,0,0,0.3)", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "1rem" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>제출 안건 요지:</strong>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem", whiteSpace: "pre-line" }}>{rep.committee_meetings?.agenda}</p>
                  </div>

                  {/* AI 종합 분석 결과 */}
                  <div style={{ padding: "1.25rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <strong style={{ fontSize: "0.9rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.5rem" }}>
                      <Cpu size={16} style={{ color: "var(--accent-color)" }} />
                      RISE 사업단 AI 심의 분석서
                    </strong>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {renderMarkdownText(rep.ai_summary)}
                    </div>
                  </div>

                  {/* 공식 회의록 인증 */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", padding: "0.5rem 0.75rem", background: "rgba(59, 130, 246, 0.05)", borderRadius: "6px", border: "1px solid rgba(59, 130, 246, 0.2)", fontSize: "0.8rem", color: "#60a5fa" }}>
                    <Award size={14} />
                    <span>{rep.official_minutes}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 탭 C: 위원회 명단 관리 (예전 사업단 관리의 위원회 관리) */}
      {/* ======================================================== */}
      {activeSubTab === "committees" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
          <ScheduleManager
            key={`schedule-committee-integrated-${darkMode}-${selectedYear}`}
            currentUser={currentUser}
            currentRole={currentRole}
            selectedYear={selectedYear}
            darkMode={darkMode}
            subTab="committees"
            onChangeSubTab={onChangeSubTab}
            monthlySchedules={monthlySchedules}
            setMonthlySchedules={setMonthlySchedules}
            eventSchedules={eventSchedules}
            setEventSchedules={setEventSchedules}
            meetingSchedules={meetingSchedules}
            setMeetingSchedules={setMeetingSchedules}
            pressReleases={pressReleases}
            setPressReleases={setPressReleases}
            members={allMembers}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* 모달 1: 신규 위원회 생성 모달 */}
      {/* ======================================================== */}
      {isCommitteeModalOpen && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
          <div className="modal-contentcard" style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", width: "400px", maxWidth: "90%" }}>
            <h3 style={{ color: "#fff", fontWeight: "800", fontSize: "1.1rem", marginBottom: "1rem" }}>신규 위원회 개설</h3>
            <form onSubmit={handleCreateCommittee} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>위원회 명칭</label>
                <input
                  type="text"
                  required
                  placeholder="예: 앵커총괄위원회, 자체평가위원회"
                  value={committeeForm.name}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, name: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>재적 위원 수 (의사정족수 기준)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={committeeForm.total_quorum}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, total_quorum: parseInt(e.target.value) || 0 })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>의결정족수 기준</label>
                <select
                  value={committeeForm.voting_rule}
                  onChange={(e) => setCommitteeForm({ ...committeeForm, voting_rule: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                >
                  <option value="majority_of_attendees">출석 위원 과반수 찬성</option>
                  <option value="majority_of_total">재적 위원 과반수 찬성</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCommitteeModalOpen(false)} style={{ flex: 1 }}>취소</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>개설하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 모달 2: 위원 배정 모달 */}
      {/* ======================================================== */}
      {isMemberModalOpen && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
          <div className="modal-contentcard" style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", width: "450px", maxWidth: "90%" }}>
            <h3 style={{ color: "#fff", fontWeight: "800", fontSize: "1.1rem", marginBottom: "1rem" }}>위원회 위원 추가</h3>
            <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>위원 성명</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>직책/역할</label>
                  <select
                    value={memberForm.type}
                    onChange={(e) => setMemberForm({ ...memberForm, type: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  >
                    <option value="위원">위원</option>
                    <option value="위원장">위원장</option>
                    <option value="간사">간사</option>
                    <option value="위원(자문겸직)">위원(자문겸직)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>소속 기관명</label>
                  <input
                    type="text"
                    placeholder="예: 울산과학대학교"
                    value={memberForm.org}
                    onChange={(e) => setMemberForm({ ...memberForm, org: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>부서/학과명</label>
                  <input
                    type="text"
                    placeholder="예: 기획처 / 화학공학과"
                    value={memberForm.dept}
                    onChange={(e) => setMemberForm({ ...memberForm, dept: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>직위/직급</label>
                  <input
                    type="text"
                    placeholder="예: 처장 / 교수"
                    value={memberForm.rank}
                    onChange={(e) => setMemberForm({ ...memberForm, rank: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>구분</label>
                  <select
                    value={memberForm.location}
                    onChange={(e) => setMemberForm({ ...memberForm, location: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  >
                    <option value="교내">교내 위원</option>
                    <option value="교외">교외 위원</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>비고</label>
                  <input
                    type="text"
                    placeholder="예: 신규 위촉"
                    value={memberForm.note}
                    onChange={(e) => setMemberForm({ ...memberForm, note: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>정렬 순서</label>
                  <input
                    type="number"
                    value={memberForm.sort_order}
                    onChange={(e) => setMemberForm({ ...memberForm, sort_order: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsMemberModalOpen(false)} style={{ flex: 1 }}>취소</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>추가하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 모달 3: 신규 회의 의결 안건 등록 모달 */}
      {/* ======================================================== */}
      {isMeetingModalOpen && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
          <div className="modal-contentcard" style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", width: "500px", maxWidth: "95%" }}>
            <h3 style={{ color: "#fff", fontWeight: "800", fontSize: "1.1rem", marginBottom: "1rem" }}>신규 회의 의결 개설</h3>
            <form onSubmit={handleCreateMeeting} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>회의명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 제1차 앵커총괄위원회 회의"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>회의 일시 및 마감기한</label>
                  <input
                    type="datetime-local"
                    required
                    value={meetingForm.meeting_date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meeting_date: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>회의 방식</label>
                  <select
                    value={meetingForm.meeting_type}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meeting_type: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  >
                    <option value="ONLINE_WRITTEN">서면 의결 (비대면)</option>
                    <option value="OFFLINE_FACE">대면 회의 (현장 서명)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>의결 안건 요지</label>
                <textarea
                  rows={4}
                  required
                  placeholder="의사결정을 요청할 핵심 안건 설명과 근거 자료 요약을 기술해 주세요."
                  value={meetingForm.agenda}
                  onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)", resize: "none" }}
                />
              </div>

              {/* 💡 [회의 안건 의결 서류 파일 탑재 필드] (요구사항 3 반영) */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>의결 심의 자료 첨부 (선택)</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.md"
                    onChange={handleFileChange}
                    style={{ width: "100%", padding: "0.4rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)", fontSize: "0.75rem" }}
                  />
                  <small style={{ color: "var(--text-secondary)", fontSize: "0.7rem", marginTop: "0.15rem", display: "block" }}>
                    * pdf, png, jpg, jpeg, md 확장자 지원 (최대 10MB)
                  </small>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>회의 보안 PIN코드 (선택)</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="미지정 시 6자리 랜덤 생성"
                    value={meetingForm.access_pin}
                    onChange={(e) => setMeetingForm({ ...meetingForm, access_pin: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setIsMeetingModalOpen(false);
                  setMeetingForm({ title: "", meeting_date: "", meeting_type: "ONLINE_WRITTEN", agenda: "", attachment_name: "", attachment_data: "", access_pin: "" });
                }} style={{ flex: 1 }}>취소</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>회의 등록 및 의결 개시</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
