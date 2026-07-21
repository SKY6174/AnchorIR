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
  { id: "evaluation", name: "앵커사업자체평가위원회", purpose: "사업계획서 및 목표에 기반한 사업성과 평가 (중간평가/최종평가)", badge: "성과평가", color: "linear-gradient(135deg, #10b981 0%, #047857 100%)", constitution: "9인 내외", cycle: "연 1회 정기" },
  { id: "advisory", name: "앵커사업자문회의", purpose: "앵커 사업 정책 방향 및 지역 정주형 인재 양성을 위한 정책 자문", badge: "외부전문가자문", color: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", constitution: "외부 7인 등", cycle: "반기별 1회" },
  { id: "ecc_op", name: "ECC센터운영위원회", purpose: "ECC센터 세부 사업계획 및 추진현황 심의/의결", badge: "센터운영", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", constitution: "5인 내외", cycle: "분기별 1회" },
  { id: "icc_op", name: "ICC센터운영위원회", purpose: "ICC센터 산학연구 및 기업 지원 안건 의결", badge: "센터운영", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", constitution: "5인 내외", cycle: "분기별 1회" },
  { id: "rcc_op", name: "RCC센터운영위원회", purpose: "RCC센터 지자체 매칭 및 커뮤니티 사업 자문/심의", badge: "센터운영", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", constitution: "5인 내외", cycle: "분기별 1회" },
  { id: "aidx_op", name: "AID-X지원센터운영위원회", purpose: "디지털 융합 교육 및 AID-X 사업 기획 심의", badge: "센터운영", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", constitution: "5인 내외", cycle: "분기별 1회" },
  { id: "neulbom_op", name: "울산늘봄누리센터운영위원회", purpose: "늘봄 교실 연계 과정 및 자치 교육 활동 심의", badge: "센터운영", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", constitution: "5인 내외", cycle: "분기별 1회" },
  { id: "newind_op", name: "신산업특화센터운영위원회", purpose: "신산업 선도 기업 맞춤 교육 및 거버넌스 심의", badge: "센터운영", color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", constitution: "5인 내외", cycle: "분기별 1회" }
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
  evaluation: [
    { id: 401, committee_id: "evaluation", type: "위원장", name: "김영근", org: "대구보건대학교", dept: "경영부총장", rank: "부총장", location: "교외", note: "", sort_order: 1 },
    { id: 402, committee_id: "evaluation", type: "위원", name: "변홍석", org: "울산과학대학교", dept: "교무처", rank: "처장", location: "교내", note: "", sort_order: 2 },
    { id: 403, committee_id: "evaluation", type: "위원", name: "이주영", org: "울산과학대학교", dept: "학생취업처", rank: "처장", location: "교내", note: "", sort_order: 3 },
    { id: 404, committee_id: "evaluation", type: "위원", name: "서현영", org: "울산과학대학교", dept: "간호학부", rank: "학부장", location: "교내", note: "신규 추가", sort_order: 4 },
    { id: 405, committee_id: "evaluation", type: "위원", name: "미지정", org: "울산과학대학교", dept: "총대의원회", rank: "의장", location: "교내", note: "", sort_order: 5 },
    { id: 406, committee_id: "evaluation", type: "위원", name: "김봉재", org: "HD한국조선해양", dept: "-", rank: "부장", location: "교외", note: "", sort_order: 6 },
    { id: 407, committee_id: "evaluation", type: "위원", name: "한동호", org: "석원기공", dept: "-", rank: "대표이사", location: "교외", note: "", sort_order: 7 },
    { id: 408, committee_id: "evaluation", type: "위원(자문겸직)", name: "류지호", org: "아주자동차대학교", dept: "교학처", rank: "처장", location: "교외", note: "", sort_order: 8 },
    { id: 409, committee_id: "evaluation", type: "위원(자문겸직)", name: "박준", org: "광주보건대학교", dept: "글로벌혁신처", rank: "처장", location: "교외", note: "", sort_order: 9 },
    { id: 410, committee_id: "evaluation", type: "간사", name: "심현미", org: "울산과학대학교", dept: "앵커사업단운영팀", rank: "팀장", location: "교내", note: "", sort_order: 10 }
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
      const bytes = CryptoJS.AES.decrypt(encSig, SIGNATURE_SECRET_KEY);
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
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ 
    title: "", 
    meeting_date: "", 
    meeting_type: "ONLINE_WRITTEN", 
    agenda: "",
    attachment_name: "",
    attachment_data: "",
    access_pin: "",
    agendas: [{ title: "", description: "", is_evaluation: false }] // 💡 [의안 개조] 기본 1개 안건 인풋 자동 생성
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

  // 💡 [의안 개조] 선택된 회의의 의안 리스트 및 의안별 수집된 위원 투표/평가 상태
  const [selectedMeetingAgendas, setSelectedMeetingAgendas] = useState([]);
  const [selectedMeetingAgendaVotes, setSelectedMeetingAgendaVotes] = useState([]);
  
  // 💡 [의안 개조] 위원 로그인 후 각 의안별 선택한 의결/의견 맵 상태 ({ [agendaId]: { vote, score, opinion } })
  const [agendaInputs, setAgendaInputs] = useState({});

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

  // 💡 [로컬 캐시 Quota 초과 자가치유] 대용량 base64 PDF 데이터 캐시로 가득 찬 localStorage를 안전하게 정리
  useEffect(() => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("local_committee_meetings_") || key.startsWith("local_meeting_agendas_"))) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const list = JSON.parse(raw);
              if (Array.isArray(list)) {
                const hasLargeData = list.some(item => item.attachment_data);
                if (hasLargeData) {
                  const cleaned = list.map(item => ({ ...item, attachment_data: null }));
                  localStorage.setItem(key, JSON.stringify(cleaned));
                  console.log(`[Self-Healing] Cleaned up large base64 attachments in localStorage key: ${key}`);
                }
              }
            }
          } catch (e) {
            localStorage.removeItem(key);
            console.log(`[Self-Healing] Removed corrupted localStorage key: ${key}`);
          }
        }
      }
    } catch (err) {
      console.warn("[Self-Healing] LocalStorage cleanup failed:", err.message);
    }
  }, []);

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

  // 💡 [실시간 위원 명단 동기화 이벤트 수신] 위원회 명단 관리 탭(ScheduleManager)에서 위원 변경 시 즉시 갱신
  useEffect(() => {
    const handleCommitteeMembersUpdated = () => {
      if (selectedCommittee?.id) {
        console.log(`[CommitteeManager] 위원 명단 동기화 이벤트 수신: ${selectedCommittee.id}`);
        fetchMembers(selectedCommittee.id);
      }
    };

    window.addEventListener("anchor_committee_members_updated", handleCommitteeMembersUpdated);
    return () => {
      window.removeEventListener("anchor_committee_members_updated", handleCommitteeMembersUpdated);
    };
  }, [selectedCommittee]);

  // 💡 [의안 개조] 선택된 회의(selectedMeeting)가 변경될 때마다 종속된 의안(Agendas) 및 의안별 투표(Votes) 데이터 로드
  useEffect(() => {
    if (selectedMeeting?.id) {
      fetchMeetingAgendasAndVotes(selectedMeeting.id);
    } else {
      setSelectedMeetingAgendas([]);
      setSelectedMeetingAgendaVotes([]);
    }
  }, [selectedMeeting]);

  const fetchMeetingAgendasAndVotes = async (meetingId) => {
    try {
      // 1. 의안 목록 조회
      const { data: agendas, error: agErr } = await supabase
        .from("meeting_agendas")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("sort_order", { ascending: true });
      if (agErr) throw agErr;
      setSelectedMeetingAgendas(agendas || []);
      const cleanAgendas = (agendas || []).map(a => ({ ...a, attachment_data: null }));
      localStorage.setItem(`local_meeting_agendas_${meetingId}`, JSON.stringify(cleanAgendas));

      // 2. 의안별 개별 투표 목록 조회
      const { data: votes, error: vtErr } = await supabase
        .from("meeting_agenda_votes")
        .select("*")
        .eq("meeting_id", meetingId);
      if (vtErr) throw vtErr;
      setSelectedMeetingAgendaVotes(votes || []);
      localStorage.setItem(`local_meeting_agenda_votes_${meetingId}`, JSON.stringify(votes || []));
    } catch (err) {
      console.warn("의안/투표 조회 실패, 로컬 캐시 폴백:", err.message);
      const localAgendas = localStorage.getItem(`local_meeting_agendas_${meetingId}`);
      setSelectedMeetingAgendas(localAgendas ? JSON.parse(localAgendas) : []);

      const localVotes = localStorage.getItem(`local_meeting_agenda_votes_${meetingId}`);
      setSelectedMeetingAgendaVotes(localVotes ? JSON.parse(localVotes) : []);
    }
  };

  // 💡 [의안 개조] 위원 로그인 후 각 의안별 선택한 의결/의견 맵 상태 ({ [agendaId]: { vote, score, opinion } }) 초기화
  useEffect(() => {
    if (selectedMeeting && selectedMeetingAgendas.length > 0) {
      const myName = currentUser?.name ? currentUser.name.split(" ")[0].split("(")[0].trim() : "";
      const myMemberObj = members.find(m => m.name === myName);
      
      const newInputs = {};
      selectedMeetingAgendas.forEach(a => {
        // 이미 낸 투표가 있는지 찾기
        const existingVote = selectedMeetingAgendaVotes.find(
          v => v.agenda_id === a.id && (myMemberObj ? v.member_id === myMemberObj.id : false)
        );
        newInputs[a.id] = {
          vote: existingVote?.vote || "",
          score: existingVote?.score || 0,
          opinion: existingVote?.opinion || ""
        };
      });
      setAgendaInputs(newInputs);
    }
  }, [selectedMeeting, selectedMeetingAgendas, selectedMeetingAgendaVotes, members, currentUser]);

  // 💡 [의안 개조] 의안별 투표/평가 통계 산출 헬퍼 함수
  const getAgendaVoteStats = (agendaId, isEvaluation) => {
    const votes = selectedMeetingAgendaVotes.filter(v => v.agenda_id === agendaId);
    const totalVotes = votes.length;
    
    if (isEvaluation) {
      const scores = votes.map(v => v.score).filter(s => s && s >= 1 && s <= 5);
      const sum = scores.reduce((a, b) => a + b, 0);
      const avg = scores.length > 0 ? (sum / scores.length).toFixed(2) : "0.00";
      
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      scores.forEach(s => { distribution[s] = (distribution[s] || 0) + 1; });
      
      return { totalVotes, avg, distribution };
    } else {
      const approve = votes.filter(v => v.vote === "APPROVE").length;
      const reject = votes.filter(v => v.vote === "REJECT").length;
      const abstain = votes.filter(v => v.vote === "ABSTAIN").length;
      
      return { totalVotes, approve, reject, abstain };
    }
  };

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

  // 💡 [새로고침 유지 가드] selectedCommittee가 변경될 때마다 활성 ID를 로컬 스토리지에 캐시
  useEffect(() => {
    if (selectedCommittee?.id) {
      localStorage.setItem("anchor_selected_committee_id", selectedCommittee.id);
    }
  }, [selectedCommittee]);

  // 3. Supabase 데이터 조회(Fetch) 함수
  const fetchCommittees = async () => {
    try {
      const { data, error } = await supabase
        .from("committees")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      
      let list = GOVERNANCE_COMMITTEES_MASTER;
      if (data && data.length > 0) {
        list = data;
        setCommittees(data);
      } else {
        setCommittees(GOVERNANCE_COMMITTEES_MASTER);
      }

      // 로컬 스토리지에 저장된 이전 활성 위원회 복원
      const savedId = localStorage.getItem("anchor_selected_committee_id");
      if (savedId) {
        const found = list.find(c => c.id === savedId);
        if (found) {
          setSelectedCommittee(found);
        }
      }
    } catch (err) {
      console.error("위원회 조회 에러 (폴백 마스터 전환):", err.message);
      setCommittees(GOVERNANCE_COMMITTEES_MASTER);

      const savedId = localStorage.getItem("anchor_selected_committee_id");
      if (savedId) {
        const found = GOVERNANCE_COMMITTEES_MASTER.find(c => c.id === savedId);
        if (found) {
          setSelectedCommittee(found);
        }
      }
    }
  };

  // 💡 [위원회 풀 분류 필터링] (요구사항 1 반영)
  const agencyIds = ["total", "planning", "budget", "evaluation", "advisory"];
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
      const cleanMeetings = (data || []).map(m => ({ ...m, attachment_data: null }));
      localStorage.setItem(`local_committee_meetings_${committeeId}`, JSON.stringify(cleanMeetings));
      
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
      
      // 💡 [간사 제외 정족수 규칙 적용] 간사를 제외한 순수 의결 위원 수 산정
      const currentVotingCount = members.filter(m => !m.type?.includes("간사")).length;
      const isAddingSecretary = payload.type?.includes("간사");
      const newQuorum = currentVotingCount + (isAddingSecretary ? 0 : 1);

      await supabase
        .from("committees")
        .update({ total_quorum: newQuorum })
        .eq("id", selectedCommittee.id);
      await fetchCommittees();
      window.dispatchEvent(new CustomEvent("anchor_committee_members_updated", { detail: { committeeId: selectedCommittee.id } }));
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
      window.dispatchEvent(new CustomEvent("anchor_committee_members_updated", { detail: { committeeId: selectedCommittee.id } }));
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("이 위원을 위원회에서 제외하시겠습니까?")) return;
    try {
      const removedMember = members.find(m => m.id === memberId);
      const isRemovingSecretary = removedMember?.type?.includes("간사");
      const currentVotingCount = members.filter(m => !m.type?.includes("간사")).length;
      const newQuorum = Math.max(0, currentVotingCount - (isRemovingSecretary ? 0 : 1));

      const { error } = await supabase
        .from("committee_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
      alert("위원이 제외되었습니다.");
      await fetchMembers(selectedCommittee.id);

      await supabase
        .from("committees")
        .update({ total_quorum: newQuorum })
        .eq("id", selectedCommittee.id);
      await fetchCommittees();
      window.dispatchEvent(new CustomEvent("anchor_committee_members_updated", { detail: { committeeId: selectedCommittee.id } }));
    } catch (err) {
      console.warn("DB 위원 삭제 실패, 로컬 스토리지에서 제거합니다:", err.message);
      const localMembers = JSON.parse(localStorage.getItem(`local_committee_members_${selectedCommittee.id}`) || "[]");
      const updated = localMembers.filter(m => m.id !== memberId);
      localStorage.setItem(`local_committee_members_${selectedCommittee.id}`, JSON.stringify(updated));
      alert("위원이 제외되었습니다. (오프라인 캐시 모드)");
      setMembers(updated);
      window.dispatchEvent(new CustomEvent("anchor_committee_members_updated", { detail: { committeeId: selectedCommittee.id } }));
    }
  };

  // 💡 [위원 직분별 우선순위 정렬 헬퍼] 위원장 -> 위원 -> 간사 순서 출력
  const sortMembersByRole = (membersList) => {
    if (!Array.isArray(membersList)) return [];
    const getRolePriority = (typeStr) => {
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

  // 💡 [PDF 첨부자료 검증 및 1MB 이하 자동 압축/최적화 헬퍼 함수]
  // 1. 첨부자료 양식을 PDF로 제한합니다.
  // 2. 파일 용량이 1MB(1,048,576 bytes)를 초과할 경우, 브라우저 단에서 pdf.js 및 html2pdf.js 기술을 활용해
  //    페이지별 Canvas JPEG 렌더링 및 스케일 최적화를 적용하여 자동으로 1MB 이하로 압축한 뒤 DataURL을 반환합니다.
  const compressPdfIfNeeded = async (file) => {
    if (!file) return null;

    // 1) 확장사 검사: PDF 파일만 허용
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (fileExtension !== "pdf" && file.type !== "application/pdf") {
      alert("⚠️ 첨부자료 양식은 PDF 파일만 업로드 가능합니다. (.pdf 확장자 확인 필요)");
      return null;
    }

    const MAX_SIZE = 1 * 1024 * 1024; // 1MB (1,048,576 bytes)

    // 2) 1MB 이하인 경우: 별도 압축 과정 없이 바로 DataURL 읽기
    if (file.size <= MAX_SIZE) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          dataUrl: reader.result,
          compressed: false,
          originalSize: file.size,
          compressedSize: file.size
        });
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }

    // 3) 1MB 초과인 경우: pdf.js 및 html2pdf.js를 활용한 자동 최적화 압축 진행
    try {
      const origMb = (file.size / (1024 * 1024)).toFixed(2);
      alert(`ℹ️ 업로드된 PDF 용량(${origMb}MB)이 1MB를 초과하여 자동으로 1MB 이하로 압축 최적화 후 탑재합니다. 잠시만 기다려 주세요...`);

      // 3-1. pdf.js CDN 동적 로드
      const pdfjsLib = await new Promise((resolve, reject) => {
        if (window.pdfjsLib) return resolve(window.pdfjsLib);
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
          resolve(window.pdfjsLib);
        };
        script.onerror = () => reject(new Error("pdf.js 라이브러리 로드 실패"));
        document.head.appendChild(script);
      });

      // 3-2. html2pdf.js CDN 동적 로드
      const html2pdf = await new Promise((resolve, reject) => {
        if (window.html2pdf) return resolve(window.html2pdf);
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve(window.html2pdf);
        script.onerror = () => reject(new Error("html2pdf.js 라이브러리 로드 실패"));
        document.head.appendChild(script);
      });

      // 3-3. PDF 파일 ArrayBuffer로 읽기 및 문서 로드
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages;

      // 3-4. 압축 시 적용할 해상도 스케일 및 JPEG 품질 결정 (파일 크기에 따라 유동 조정)
      let scale = 1.0;
      let quality = 0.65;
      if (file.size > 10 * 1024 * 1024) {
        scale = 0.75;
        quality = 0.45;
      } else if (file.size > 4 * 1024 * 1024) {
        scale = 0.85;
        quality = 0.55;
      }

      // 3-5. 렌더링용 임시 HTML 컨테이너 요소 작성
      const container = document.createElement("div");
      container.style.width = "100%";

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        const imgData = canvas.toDataURL("image/jpeg", quality);
        const img = document.createElement("img");
        img.src = imgData;
        img.style.width = "100%";
        img.style.display = "block";
        if (i < numPages) {
          img.style.pageBreakAfter = "always";
        }
        container.appendChild(img);
      }

      // 3-6. html2pdf를 통해 A4/원래 스케일에 맞는 PDF Blob 재구성
      const opt = {
        margin: 0,
        filename: file.name,
        image: { type: 'jpeg', quality: quality },
        html2canvas: { scale: 1, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
      };

      const compressedBlob = await html2pdf().from(container).set(opt).output('blob');
      const compMb = (compressedBlob.size / (1024 * 1024)).toFixed(2);

      // 3-7. 압축된 Blob을 DataURL로 변환
      const finalDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });

      alert(`🎉 PDF 자동 압축 완료!\n(원래 용량: ${origMb}MB ➔ 최적화 용량: ${compMb}MB)`);

      return {
        name: file.name,
        dataUrl: finalDataUrl,
        compressed: true,
        originalSize: file.size,
        compressedSize: compressedBlob.size
      };
    } catch (err) {
      console.error("PDF 자동 압축 에러:", err);
      alert("PDF 압축 중 오류가 발생하여 원본 파일로 탑재 시도합니다.");
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          dataUrl: reader.result,
          compressed: false,
          originalSize: file.size,
          compressedSize: file.size
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  };

  // 💡 [안건 의결 서류 첨부 파일 핸들러] (PDF 전용 & 1MB 자동 압축 적용)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const res = await compressPdfIfNeeded(file);
    if (!res) {
      e.target.value = "";
      return;
    }

    setMeetingForm(prev => ({
      ...prev,
      attachment_name: res.name,
      attachment_data: res.dataUrl
    }));
  };

  // 💡 [의안 개조] 위원 참석 및 의안별 의결/평가(의결서) 제출 핸들러 (Rule 8 암호화 적용)
  const handleSubmitVote = async () => {
    if (!selectedMeeting) return;
    
    const myName = currentUser?.name ? currentUser.name.split(" ")[0].split("(")[0].trim() : "";
    const myMemberObj = members.find(m => m.name === myName);
    if (!myMemberObj) {
      alert("귀하는 이 위원회의 위원 명단에 존재하지 않습니다.");
      return;
    }

    if (selectedMeetingAgendas.length === 0) {
      alert("심의할 의안이 정의되어 있지 않습니다.");
      return;
    }

    // 1. 모든 의안의 의결/점수 기입 유무 검증
    for (const a of selectedMeetingAgendas) {
      const input = agendaInputs[a.id];
      if (a.is_evaluation) {
        if (!input || !input.score || input.score < 1 || input.score > 5) {
          alert(`[${a.title}] 문항의 5점 척도 점수를 선택해 주세요.`);
          return;
        }
      } else {
        if (!input || !input.vote) {
          alert(`[${a.title}] 안건에 대한 찬/반 여부를 선택해 주세요.`);
          return;
        }
      }
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

    // 2. 의안별 개별 투표 레코드 리스트 생성
    const votePayloads = selectedMeetingAgendas.map(a => ({
      meeting_id: selectedMeeting.id,
      agenda_id: a.id,
      member_id: myMemberObj.id,
      vote: a.is_evaluation ? null : agendaInputs[a.id]?.vote || null,
      score: a.is_evaluation ? Number(agendaInputs[a.id]?.score) || null : null,
      opinion: agendaInputs[a.id]?.opinion || ""
    }));

    // 3. 하위 호환용 종합 의견 및 대표 찬반값 셋업
    const summaryOpinion = selectedMeetingAgendas.map((a, idx) => {
      const detail = agendaInputs[a.id] || { vote: "", score: 0, opinion: "" };
      const choiceStr = a.is_evaluation ? `${detail.score}점` : (detail.vote === "APPROVE" ? "찬성" : detail.vote === "REJECT" ? "반대" : "기권");
      return `[안건 ${idx + 1}] ${choiceStr}: ${detail.opinion}`;
    }).join("\n");

    const representativeVote = selectedMeetingAgendas[0]?.is_evaluation 
      ? "EVALUATION" 
      : (agendaInputs[selectedMeetingAgendas[0]?.id]?.vote || "ABSTAIN");

    const responsePayload = {
      meeting_id: selectedMeeting.id,
      member_id: myMemberObj.id,
      attended: true,
      vote: representativeVote,
      opinion: summaryOpinion,
      encrypted_signature: encryptedSig,
      submitted_at: new Date().toISOString()
    };

    try {
      // 3.1 의안별 개별 투표 테이블 업서트
      const { error: vtErr } = await supabase
        .from("meeting_agenda_votes")
        .upsert(votePayloads, { onConflict: "agenda_id, member_id" });
      if (vtErr) throw vtErr;

      // 3.2 기존 부모 테이블 업서트
      const { error: respErr } = await supabase
        .from("meeting_responses")
        .upsert([responsePayload], { onConflict: "meeting_id, member_id" });
      if (respErr) throw respErr;

      alert("의사결정서 및 안건별 서명이 안전하게 암호화되어 제출되었습니다.");
      setHasSubmitted(true);
      await fetchMeetingAgendasAndVotes(selectedMeeting.id);
      await fetchResponses(selectedMeeting.id);
    } catch (err) {
      console.warn("DB 의결 제출 실패, 로컬 스토리지에 모의 기록합니다:", err.message);
      
      // 로컬 스토리지 모의 기록 연동
      const localVotes = JSON.parse(localStorage.getItem(`local_meeting_agenda_votes_${selectedMeeting.id}`) || "[]");
      const updatedVotes = [...localVotes];
      votePayloads.forEach(payload => {
        const idx = updatedVotes.findIndex(v => v.agenda_id === payload.agenda_id && v.member_id === payload.member_id);
        if (idx > -1) {
          updatedVotes[idx] = { ...payload, id: `local-vote-${Date.now()}-${payload.agenda_id}` };
        } else {
          updatedVotes.push({ ...payload, id: `local-vote-${Date.now()}-${payload.agenda_id}` });
        }
      });
      localStorage.setItem(`local_meeting_agenda_votes_${selectedMeeting.id}`, JSON.stringify(updatedVotes));
      setSelectedMeetingAgendaVotes(updatedVotes);

      const localResponses = JSON.parse(localStorage.getItem(`local_meeting_responses_${selectedMeeting.id}`) || "[]");
      const localPayload = {
        ...responsePayload,
        id: `local-response-${Date.now()}`,
        committee_members: {
          name: myMemberObj.name,
          type: myMemberObj.type,
          org: myMemberObj.org,
          dept: myMemberObj.dept
        }
      };
      
      const idx = localResponses.findIndex(r => r.member_id === myMemberObj.id);
      let updated;
      if (idx > -1) {
        updated = [...localResponses];
        updated[idx] = localPayload;
      } else {
        updated = [...localResponses, localPayload];
      }
      localStorage.setItem(`local_meeting_responses_${selectedMeeting.id}`, JSON.stringify(updated));
      setResponses(updated);
      setHasSubmitted(true);
      alert("의결서가 제출되었습니다. (오프라인 캐시 모드)");
    }
  };

  const handleEditMeetingStart = (meeting) => {
    setIsEditMode(true);
    setEditingMeetingId(meeting.id);
    
    // meeting_date 포맷팅 처리 (datetime-local 타입 연동을 위해 YYYY-MM-DDTHH:mm 형태로 교정)
    let formattedDate = "";
    if (meeting.meeting_date) {
      const d = new Date(meeting.meeting_date);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
      formattedDate = localISOTime;
    }

    setMeetingForm({
      title: meeting.title || "",
      meeting_date: formattedDate,
      meeting_type: meeting.meeting_type || "ONLINE_WRITTEN",
      agenda: meeting.agenda || "",
      attachment_name: meeting.attachment_name || "",
      attachment_data: meeting.attachment_data || "",
      access_pin: meeting.access_pin || "",
      agendas: selectedMeetingAgendas.map(a => ({
        id: a.id,
        title: a.title || "",
        description: a.description || "",
        is_evaluation: !!a.is_evaluation,
        attachment_name: a.attachment_name || "",
        attachment_data: a.attachment_data || ""
      }))
    });
    setIsMeetingModalOpen(true);
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!meetingForm.title || !meetingForm.meeting_date) {
      alert("회의 제목과 일시를 입력해 주세요.");
      return;
    }
    if (!meetingForm.agendas || meetingForm.agendas.length === 0) {
      alert("최소 1개 이상의 의결 안건(의안)을 추가해 주세요.");
      return;
    }
    if (meetingForm.agendas.some(a => !a.title.trim())) {
      alert("모든 의안의 제목을 올바르게 기입해 주세요.");
      return;
    }

    const generatedPin = meetingForm.access_pin.trim() || Math.floor(100000 + Math.random() * 900000).toString();
    
    // 하위 호환 및 DB non-null 제약 해소를 위해 의안 리스트 요약을 agenda 컬럼에 채움
    const summaryAgendaText = meetingForm.agendas.map((a, idx) => `[안건 ${idx + 1}] ${a.title}`).join("\n");

    const payload = {
      committee_id: selectedCommittee.id,
      title: meetingForm.title,
      meeting_date: meetingForm.meeting_date,
      meeting_type: meetingForm.meeting_type,
      agenda: summaryAgendaText,
      attachment_name: meetingForm.attachment_name || null,
      attachment_data: meetingForm.attachment_data || null,
      access_pin: generatedPin,
      status: "ACTIVE"
    };

    try {
      let createdMeeting = null;

      if (isEditMode && editingMeetingId) {
        // 1-A. 회의 정보 업데이트
        const { data, error } = await supabase
          .from("committee_meetings")
          .update({
            title: meetingForm.title,
            meeting_date: meetingForm.meeting_date,
            meeting_type: meetingForm.meeting_type,
            agenda: summaryAgendaText,
            attachment_name: meetingForm.attachment_name || null,
            attachment_data: meetingForm.attachment_data || null,
            access_pin: generatedPin
          })
          .eq("id", editingMeetingId)
          .select();
        if (error) throw error;
        createdMeeting = data[0];

        // 2-A. 기존 안건 데이터 삭제 후 재생성 (의안 정보 정합성 확보)
        const { error: delErr } = await supabase
          .from("meeting_agendas")
          .delete()
          .eq("meeting_id", editingMeetingId);
        if (delErr) throw delErr;

        const agendaPayloads = meetingForm.agendas.map((a, idx) => ({
          meeting_id: editingMeetingId,
          title: a.title.trim(),
          description: a.description || null,
          is_evaluation: !!a.is_evaluation,
          sort_order: idx + 1,
          attachment_name: a.attachment_name || null,
          attachment_data: a.attachment_data || null
        }));

        const { error: agErr } = await supabase
          .from("meeting_agendas")
          .insert(agendaPayloads);
        if (agErr) throw agErr;

        alert("회의 정보 및 심의 안건이 성공적으로 수정되었습니다.");
      } else {
        // 1-B. 회의 기본 신규 등록
        const { data, error } = await supabase
          .from("committee_meetings")
          .insert([payload])
          .select();
        if (error) throw error;
        createdMeeting = data[0];
        
        // 2-B. 신규 의안 데이터 적재
        if (createdMeeting && meetingForm.agendas.length > 0) {
          const agendaPayloads = meetingForm.agendas.map((a, idx) => ({
            meeting_id: createdMeeting.id,
            title: a.title.trim(),
            description: a.description || null,
            is_evaluation: !!a.is_evaluation,
            sort_order: idx + 1,
            attachment_name: a.attachment_name || null,
            attachment_data: a.attachment_data || null
          }));
          
          const { error: agErr } = await supabase
            .from("meeting_agendas")
            .insert(agendaPayloads);
          if (agErr) throw agErr;
        }

        alert(`위원회 회의 일정이 등록되었습니다.\n[외부 위원용 보안 PIN]: ${generatedPin}`);
      }

      setIsMeetingModalOpen(false);
      setIsEditMode(false);
      setEditingMeetingId(null);
      setMeetingForm({ 
        title: "", 
        meeting_date: "", 
        meeting_type: "ONLINE_WRITTEN", 
        agenda: "",
        attachment_name: "",
        attachment_data: "",
        access_pin: "",
        agendas: [{ title: "", description: "", is_evaluation: false }]
      });
      await fetchMeetings(selectedCommittee.id);
      if (createdMeeting) {
        setSelectedMeeting(createdMeeting);
      }
    } catch (err) {
      console.warn("DB 회의 처리 실패, 로컬 스토리지에 모의 저장합니다:", err.message);
      
      const targetMeetingId = isEditMode ? editingMeetingId : `local-meeting-${Date.now()}`;
      const localMeetings = JSON.parse(localStorage.getItem(`local_committee_meetings_${selectedCommittee.id}`) || "[]");
      let updatedMeetings;
      const localPayload = { ...payload, id: targetMeetingId, created_at: new Date().toISOString() };

      if (isEditMode) {
        updatedMeetings = localMeetings.map(m => m.id === targetMeetingId ? localPayload : m);
      } else {
        updatedMeetings = [localPayload, ...localMeetings];
      }
      const cleanUpdatedMeetings = (updatedMeetings || []).map(m => ({ ...m, attachment_data: null }));
      localStorage.setItem(`local_committee_meetings_${selectedCommittee.id}`, JSON.stringify(cleanUpdatedMeetings));

      // 로컬 스토리지용 의안 정보 모의 적재
      const localAgendas = meetingForm.agendas.map((a, idx) => ({
        id: a.id || `local-agenda-${Date.now()}-${idx}`,
        meeting_id: targetMeetingId,
        title: a.title.trim(),
        description: a.description || null,
        is_evaluation: !!a.is_evaluation,
        sort_order: idx + 1,
        attachment_name: a.attachment_name || null,
        attachment_data: a.attachment_data || null
      }));
      const cleanLocalAgendas = (localAgendas || []).map(a => ({ ...a, attachment_data: null }));
      localStorage.setItem(`local_meeting_agendas_${targetMeetingId}`, JSON.stringify(cleanLocalAgendas));
      
      if (isEditMode) {
        alert("회의 정보 및 심의 안건이 수정되었습니다. (오프라인 캐시 모드)");
      } else {
        alert(`⚠️ [오프라인 모드 경고]\nDB 연결 상태가 원활하지 않아 로컬 브라우저에 임시 저장되었습니다.\n새로고침 후 안정적인 네트워크 상태에서 회의를 다시 개설하셔야 외부 위원 투표가 실시간으로 집계 연동됩니다.\n[외부 위원용 임시 PIN]: ${generatedPin}`);
      }

      setIsMeetingModalOpen(false);
      setIsEditMode(false);
      setEditingMeetingId(null);
      setMeetingForm({ 
        title: "", 
        meeting_date: "", 
        meeting_type: "ONLINE_WRITTEN", 
        agenda: "",
        attachment_name: "",
        attachment_data: "",
        access_pin: "",
        agendas: [{ title: "", description: "", is_evaluation: false }]
      });
      setMeetings(updatedMeetings);
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
      const cleanUpdated = (updated || []).map(m => ({ ...m, attachment_data: null }));
      localStorage.setItem(`local_committee_meetings_${selectedCommittee.id}`, JSON.stringify(cleanUpdated));
      alert("회의가 취소되었습니다. (오프라인 캐시 모드)");
      setSelectedMeeting(null);
      setMeetings(updated);
    }
  };

  // 5. 전자서명 그리기 캔버스 핸들러 (DPR 및 바운딩 렉트 비율 스케일링 보정 적용)
  const getCanvasCoordinates = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    
    // 모바일 터치 및 데스크톱 마우스 좌표 동시 대응
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    
    if (clientX === undefined || clientY === undefined) return null;
    
    // 캔버스 자체 크기와 바운딩 렉트 크기의 비율을 계산하여 좌표 튐 버그 완벽 보정
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // 만년필 필체 느낌을 위해 라인 두께 및 결합 둥글기 설정
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e3a8a"; // 투명 배경 위에서도 지적인 느낌을 풍기는 만년필용 로열 인디고 블루 잉크색
    
    const coords = getCanvasCoordinates(canvas, e);
    if (!coords) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    const coords = getCanvasCoordinates(canvas, e);
    if (!coords) return;

    ctx.lineTo(coords.x, coords.y);
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



  // 7. 정족수 실시간 계산 유틸리티 연동 (간사는 의결정족수 및 재적 위원 수 산정에서 전면 제외)
  const calculateQuorum = () => {
    if (!selectedCommittee || !selectedMeeting) return null;
    
    // 💡 [간사 의결권 제외 규칙 적용] 간사는 의결 권한이 없는 행정 실무 진행자이므로 재적 위원 수 및 의결정족수 산정에서 전면 제외합니다.
    const votingMembers = members.filter(m => !m.type?.includes("간사"));
    const total = votingMembers.length > 0 ? votingMembers.length : (selectedCommittee.total_quorum || 1);

    // 간사를 제외한 순수 의결 참석 응답 추출
    const votingResponses = responses.filter(r => {
      const memberObj = members.find(m => m.id === r.member_id || m.name === r.member_name);
      return memberObj ? !memberObj.type?.includes("간사") : true;
    });

    const attended = votingResponses.filter(r => r.attended).length;
    
    // 의사정족수: 재적 의결 위원 과반수
    const majorityLimit = Math.floor(total / 2) + 1;
    const isEstablished = attended >= majorityLimit;

    // 의결정족수: 찬성표 산출
    const approveCount = votingResponses.filter(r => r.vote === "APPROVE").length;
    const rejectCount = votingResponses.filter(r => r.vote === "REJECT").length;
    const abstainCount = votingResponses.filter(r => r.vote === "ABSTAIN").length;

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
      // 💡 [의안 개조] 각 의안별로 수집된 통계 및 위원별 의견 구조화
      const opinionsContext = selectedMeetingAgendas.map((agenda, aIdx) => {
        const votes = selectedMeetingAgendaVotes.filter(v => v.agenda_id === agenda.id);
        const stats = getAgendaVoteStats(agenda.id, agenda.is_evaluation);
        
        let statsText = "";
        if (agenda.is_evaluation) {
          statsText = `평균 평점: ${stats.avg}점 / 5.00점 만점 (점수 분포: 5점 ${stats.distribution[5]}명, 4점 ${stats.distribution[4]}명, 3점 ${stats.distribution[3]}명, 2점 ${stats.distribution[2]}명, 1점 ${stats.distribution[1]}명)`;
        } else {
          statsText = `표결 결과: 찬성 ${stats.approve}명, 반대 ${stats.reject}명, 기권 ${stats.abstain}명`;
        }

        const opinionsText = votes.map((v, vIdx) => {
          const name = members.find(m => m.id === v.member_id)?.name || `위원 ${vIdx + 1}`;
          const choice = agenda.is_evaluation ? `${v.score}점` : (v.vote === "APPROVE" ? "찬성" : v.vote === "REJECT" ? "반대" : "기권");
          return `- [${name} 위원 - 선택: ${choice}]: ${v.opinion || "의견 없음"}`;
        }).join("\n");

        return `[안건 ${aIdx + 1}] 의안명: ${agenda.title} (${agenda.is_evaluation ? "자체평가 5점 척도 문항" : "일반 찬반 의결 안건"})
- 통계 정보: ${statsText}
- 수집된 위원별 세부 심의 의견:
${opinionsText}`;
      }).join("\n\n");

      const prompt = `역할: 울산과학대학교 RISE 사업단 전문 AI 분석관
작업: 아래 수집된 위원들의 회의 의안 및 평가 영역별 의견들을 정밀 분석하여 결과 보고서 형식으로 요약해줘.
모든 텍스트는 친절한 존댓말 한글로 작성하며 주관적인 판단 대신 위원들의 안건별 의견 분포를 정량적/정성적으로 균형있게 분석해 주어야 함.

[회의명]: ${selectedMeeting.title}
[위원회 명칭]: ${selectedCommittee.name}
[위원회 의결 기준]: ${qInfo?.ruleText}
[최종 성원 요건]: 재적 ${qInfo?.total}명 중 ${qInfo?.attended}명 참석하여 ${qInfo?.isEstablished ? "성원됨" : "미성원됨"}

[안건 및 평가 영역별 수집 정보]:
${opinionsContext}

요구 형식:
### 1. 종합 평가 동향 및 핵심 논지
(회의 전체에 대한 찬반 동향 및 자체평가 점수 추세의 핵심 요약을 기술)

### 2. 안건(평가영역)별 분석 보고 및 보완 권고사항
(각 안건(의안) 단위로 평균 점수 또는 찬반 결과와 함께 위원들이 제기한 주요 논점, 이견, 보완 권고사항을 순서대로 명확히 기술)

### 3. 향후 사업단 추진 방향 및 AI 종합 제언
(회의 결과에 따른 차년도 계획 환류 방안 및 구체적 실행 제언 기술)`;

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
          official_minutes: `[회의록 자동 생성] 본 위원회는 재적 ${qInfo?.total}명 중 ${qInfo?.attended}명 참석으로 성원되었으며, 총 ${selectedMeetingAgendas.length}개 의안에 대한 심의 의결 결과 최종 ${qInfo?.isApproved ? "가결" : "부결/기타"} 처리되었음을 증명합니다.`,
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

  // 📄 디지털 봉인 결과보고서 PDF 다운로드 핸들러 구현 (한글 주석)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(null);

  const handleDownloadSignedPDF = async (rep) => {
    try {
      setIsDownloadingPdf(rep.id);
      
      // 1. 필요한 상세 의결 데이터 실시간 쿼리
      const [agendasRes, votesRes, responsesRes] = await Promise.all([
        supabase
          .from("meeting_agendas")
          .select("*")
          .eq("meeting_id", rep.meeting_id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("meeting_agenda_votes")
          .select(`
            id,
            vote,
            score,
            opinion,
            agenda_id,
            member_id,
            committee_members ( id, name, type )
          `)
          .eq("meeting_id", rep.meeting_id),
        supabase
          .from("meeting_responses")
          .select(`
            id,
            attended,
            vote,
            opinion,
            encrypted_signature,
            submitted_at,
            committee_members ( id, name, type, org, dept )
          `)
          .eq("meeting_id", rep.meeting_id)
      ]);

      if (agendasRes.error) throw agendasRes.error;
      if (votesRes.error) throw votesRes.error;
      if (responsesRes.error) throw responsesRes.error;

      const agendas = agendasRes.data || [];
      const votes = votesRes.data || [];
      const responses = responsesRes.data || [];

      // 2. html2pdf.js 라이브러리 동적 로드
      const html2pdf = await new Promise((resolve, reject) => {
        if (window.html2pdf) {
          resolve(window.html2pdf);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve(window.html2pdf);
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // 💡 [의결 형태별 포맷 분기] 서면의결 시에는 일자만 표기하며, 대면회의 시에는 시작시간 정보까지 함께 렌더링합니다.
      const isWritten = rep.committee_meetings?.meeting_type === "ONLINE_WRITTEN";
      const dateStr = rep.committee_meetings?.meeting_date 
        ? new Date(rep.committee_meetings.meeting_date).toLocaleDateString("ko-KR", 
            isWritten 
              ? { year: 'numeric', month: 'long', day: 'numeric' } 
              : { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
          )
        : "-";

      // 💡 [동적 생성일자 조립] 결과보고서의 실제 발행일자(published_at)를 YYYY. M. D. 형태로 동적 포맷팅
      const publishDate = rep.published_at ? new Date(rep.published_at) : new Date();
      const publishDateStr = `${publishDate.getFullYear()}. ${publishDate.getMonth() + 1}. ${publishDate.getDate()}.`;

      const attendedCount = responses.filter(r => r.is_attended !== false).length;
      
      // 💡 [레이아웃 누락 가드] 최상위 A4 스케일 컨테이너 태그를 추가하여 문자열 자체를 html2pdf로 바로 넘기게 설정
      let htmlContent = `
        <div style="width: 100%; background: #ffffff; color: #000000; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; box-sizing: border-box; text-align: left; padding: 10mm 5mm;">
          <div style="border: 2px solid #000; padding: 1.5rem; margin-bottom: 2rem;">
          <h1 style="text-align: center; font-size: 24px; font-weight: 900; letter-spacing: 2px; margin-bottom: 1rem; color: #000;">위원회  의결  결과보고서</h1>
          <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 13px; color: #000;">
            <tr>
              <td style="border: 1px solid #000; padding: 6px 12px; font-weight: bold; background: #f3f4f6; width: 20%;">위원회명</td>
              <td style="border: 1px solid #000; padding: 6px 12px; width: 30%;">${rep.committee_meetings?.committees?.name || "-"}</td>
              <td style="border: 1px solid #000; padding: 6px 12px; font-weight: bold; background: #f3f4f6; width: 20%;">의결 형태</td>
              <td style="border: 1px solid #000; padding: 6px 12px; width: 30%;">${rep.committee_meetings?.meeting_type === "ONLINE_WRITTEN" ? "서면 의결 (비대면)" : "대면 회의 (시스템 서명)"}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px 12px; font-weight: bold; background: #f3f4f6;">회의 일시</td>
              <td style="border: 1px solid #000; padding: 6px 12px;">${dateStr}</td>
              <td style="border: 1px solid #000; padding: 6px 12px; font-weight: bold; background: #f3f4f6;">성원 현황</td>
              <td style="border: 1px solid #000; padding: 6px 12px;">참석 ${attendedCount}명 (의결 성원 충족)</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px 12px; font-weight: bold; background: #f3f4f6;">회의 안건</td>
              <td colspan="3" style="border: 1px solid #000; padding: 6px 12px;">${rep.committee_meetings?.title || "-"}</td>
            </tr>
          </table>
        </div>

        <h3 style="font-size: 16px; font-weight: bold; border-left: 4px solid #1e3a8a; padding-left: 8px; margin-bottom: 0.5rem; margin-top: 1.5rem; color: #000;">1. 심의 안건 목록</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 1.5rem; color: #000;">
          <thead>
            <tr style="background: #e5e7eb;">
              <th style="border: 1px solid #000; padding: 6px; width: 10%;">번호</th>
              <th style="border: 1px solid #000; padding: 6px; width: 60%; text-align: left;">안건(의안)명</th>
              <th style="border: 1px solid #000; padding: 6px; width: 30%;">의결 방식</th>
            </tr>
          </thead>
          <tbody>
      `;

      agendas.forEach((ag, idx) => {
        htmlContent += `
          <tr>
            <td style="border: 1px solid #000; padding: 6px; text-align: center;">${idx + 1}</td>
            <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${ag.title}</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: center;">${ag.is_evaluation ? "5점 척도 자체평가" : "찬반 표결 의결"}</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>

        <h3 style="font-size: 16px; font-weight: bold; border-left: 4px solid #1e3a8a; padding-left: 8px; margin-bottom: 0.5rem; margin-top: 1.5rem; color: #000;">2. 안건별 의결 및 자체평가 통계</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 1.5rem; color: #000;">
          <thead>
            <tr style="background: #e5e7eb;">
              <th style="border: 1px solid #000; padding: 6px; width: 10%;">번호</th>
              <th style="border: 1px solid #000; padding: 6px; width: 50%; text-align: left;">안건명</th>
              <th style="border: 1px solid #000; padding: 6px; width: 40%;">의결/평가 결과 요약</th>
            </tr>
          </thead>
          <tbody>
      `;

      agendas.forEach((ag, idx) => {
        const agendaVotes = votes.filter(v => v.agenda_id === ag.id);
        let resultSummary = "-";
        
        if (ag.is_evaluation) {
          const validScores = agendaVotes.filter(v => v.score !== null && v.score !== undefined);
          const avgScore = validScores.length > 0
            ? (validScores.reduce((acc, curr) => acc + curr.score, 0) / validScores.length).toFixed(2)
            : "0.00";
          resultSummary = `자체평가 평균 점수: <strong>${avgScore}점</strong> / 5.00점 만점 (${validScores.length}명 참여)`;
        } else {
          const approves = agendaVotes.filter(v => v.vote === "APPROVE").length;
          const rejects = agendaVotes.filter(v => v.vote === "REJECT").length;
          const abstains = agendaVotes.filter(v => v.vote === "ABSTAIN").length;
          resultSummary = `동의: ${approves}명 | 부동의: ${rejects}명 | 기권: ${abstains}명 (최종 ${rep.decision_status === "APPROVED" ? "가결" : "부결"})`;
        }

        htmlContent += `
          <tr>
            <td style="border: 1px solid #000; padding: 6px; text-align: center;">${idx + 1}</td>
            <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${ag.title}</td>
            <td style="border: 1px solid #000; padding: 6px;">${resultSummary}</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>

        <h3 style="font-size: 16px; font-weight: bold; border-left: 4px solid #1e3a8a; padding-left: 8px; margin-bottom: 0.5rem; margin-top: 1.5rem; color: #000;">3. 위원회 AI 심의 종합 분석의견</h3>
        <div style="border: 1px solid #ccc; border-radius: 6px; padding: 12px; font-size: 12.5px; line-height: 1.6; background: #fafafa; margin-bottom: 1.5rem; white-space: pre-line; color: #000; text-align: left;">
          ${rep.ai_summary || "종합 의견 분석 대기 중입니다."}
        </div>

        <h3 style="font-size: 16px; font-weight: bold; border-left: 4px solid #1e3a8a; padding-left: 8px; margin-bottom: 0.5rem; margin-top: 2rem; color: #000; page-break-before: always;">4. 위원 자필 서명 날인부 (디지털 보존)</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 1rem; border: 1px solid #000; padding: 10px; background: #fff;">
      `;

      responses.forEach((resp) => {
        // 복호화 헬퍼 함수를 적용하여 서명 캔버스 이미지 URL 복원 (보안 암호화 해독)
        const decryptedSig = decryptSignature(resp.encrypted_signature);
        const sigImage = decryptedSig 
          ? `<img src="${decryptedSig}" style="max-height: 40px; max-width: 90px; object-fit: contain; vertical-align: middle; display: inline-block; mix-blend-mode: multiply;" />`
          : `<span style="font-size: 11px; color: #ef4444; font-style: italic;">서명 미날인</span>`;

        const memberName = resp.committee_members?.name || "알 수 없는 위원";

        htmlContent += `
          <div style="border: 1px solid #ddd; padding: 8px; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; background: #fff; color: #000;">
            <div style="text-align: left;">
              <div style="font-size: 12px; font-weight: bold;">${memberName} 위원</div>
              <div style="font-size: 10px; color: #666;">${resp.submitted_at ? new Date(resp.submitted_at).toLocaleDateString("ko-KR") : "의결서 보관"}</div>
            </div>
            <div style="text-align: right; width: 100px; height: 45px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; background: #fbfbfb;">
              ${sigImage}
            </div>
          </div>
        `;
      });

      htmlContent += `
        </div>

        <!-- 💡 [요구사항 반영] 서명 날인부 하단에 중간 정렬로 동적 생성일자 및 기관명 삽입 -->
        <div style="text-align: center; margin-top: 4.5rem; margin-bottom: 3.5rem; color: #000000; font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;">
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 1.2rem; letter-spacing: 0.5px;">${publishDateStr}</div>
          <div style="font-size: 16px; font-weight: 900; letter-spacing: 1px;">울산과학대학교 앵커사업단</div>
        </div>

        <div style="margin-top: 3.5rem; text-align: center; font-size: 11px; color: #4b5563; border-top: 1px solid #e5e7eb; padding-top: 1rem;">
          <div style="font-size: 13px; font-weight: bold; color: #1e3a8a; margin-bottom: 0.25rem;">울산과학대학교 앵커사업단 공동인증 디지털 서명 적용 필함</div>
          본 문서는 울산과학대학교 앵커사업단 디지털 서명키(Ulsan College Anchor Portal CA)를 활용하여<br/>
          암호학적으로 봉인되었으며, 파일의 변조 방지 및 의결 무결성이 완전 보장됨을 증명합니다.
        </div>
      `;

      // 💡 [파일명 명명 규칙 개편] YYYYMMDD 날짜 추출
      const getFormattedMeetingDate = (dateVal) => {
        if (!dateVal) return "00000000";
        const d = new Date(dateVal);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}${mm}${dd}`;
      };
      const fileDateStr = getFormattedMeetingDate(rep.committee_meetings?.meeting_date);
      const customFileName = `[${fileDateStr}]${rep.committee_meetings?.title || "회의"}-의결서(디지털봉인).pdf`;

      // 💡 [레이아웃 누락 가드] DOM 삽입 지연을 예방하고자 HTML 문자열(htmlContent)을 html2pdf에 직접 주입
      // 4. html2pdf를 통해 A4 사이즈 PDF Blob 생성
      const opt = {
        margin: [10, 10, 15, 10], // 상하좌우 여백
        filename: customFileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const pdfBlob = await html2pdf().from(htmlContent).set(opt).output('blob');

      // 5. FastAPI 백엔드로 서명 봉인 요청 전송
      const formData = new FormData();
      formData.append("file", pdfBlob, customFileName);

      // 💡 [Vercel 배포 우회 보안 패치] 브라우저가 로컬 호스트가 아닌 배포 서버(Vercel 등)에서 실행 중일 때, 
      // Vercel의 Static Rewrite(405 에러)를 예방하기 위해 로컬 백엔드(http://localhost:8000)를 직접 겨냥하여 호출합니다.
      const apiBase = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? ""
        : "http://localhost:8000";

      const response = await fetch(`${apiBase}/api/pdf/sign-pdf`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`백엔드 디지털 서명 날인 실패 (상태코드: ${response.status})`);
      }

      // 6. 스트리밍 다운로드 리턴받아 로컬 세이브
      const signedBlob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(signedBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = customFileName;
      document.body.appendChild(link);
      link.click();
      
      // 메모리 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (err) {
      alert(`의결 결과보고서 디지털 서명 및 다운로드 처리 중 오류가 발생했습니다:\n${err.message}`);
    } finally {
      setIsDownloadingPdf(null);
    }
  };

  // 9. 결과보고 대장 동적 로드용
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null); // 💡 [UI 개편] 선택된 결과보고서의 ID를 보관하는 상태 추가 (한글 주석)

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
      
      // 💡 [UI 개편] 로드된 결과보고서가 있고 아직 선택된 보고서가 없는 경우 첫 번째 보고서를 자동 선택
      if (data && data.length > 0) {
        setSelectedReportId(prev => prev || data[0].id);
      }
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
                  <span>센터별 운영위원회</span>
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
                  sortMembersByRole(members).map(m => (
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
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          onClick={() => handleEditMeetingStart(selectedMeeting)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            padding: "0.35rem 0.75rem",
                            fontSize: "0.78rem",
                            fontWeight: "600",
                            color: "var(--accent-color)",
                            background: "rgba(99, 102, 241, 0.15)",
                            border: "1px solid rgba(99, 102, 241, 0.35)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(99, 102, 241, 0.25)";
                            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)";
                            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.35)";
                          }}
                        >
                          <Edit size={13} /> 회의 수정
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            padding: "0.35rem 0.75rem",
                            fontSize: "0.78rem",
                            fontWeight: "600",
                            color: "#ff6b6b",
                            background: "rgba(239, 68, 68, 0.12)",
                            border: "1px solid rgba(239, 68, 68, 0.35)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.22)";
                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.35)";
                          }}
                        >
                          <Trash2 size={13} /> 회의 취소
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(120, 120, 120, 0.08)", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--accent-color)", display: "block", marginBottom: "0.25rem" }}>회의 안건 요지</strong>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "pre-line", lineHeight: "1.5" }}>{selectedMeeting.agenda}</p>
                  </div>

                  {/* 💡 [회의 첨부파일 뷰어 / 다운로드 영역] (요구사항 3 반영) */}
                  {selectedMeeting.attachment_name && (
                    <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(99, 102, 241, 0.05)", borderRadius: "6px", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.25rem" }}>
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
                      <strong style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>{qInfo?.total}명</strong>
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

                  {/* 💡 [의안별 투표/평가 실시간 통계 모니터] */}
                  {selectedMeetingAgendas.length > 0 && (
                    <div style={{ marginTop: "1.25rem", padding: "1rem", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "0.75rem", display: "flex", gap: "0.3rem", alignItems: "center" }}>
                        📊 의안별 실시간 의결 및 평가 집계
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {selectedMeetingAgendas.map((agenda, aIdx) => {
                          const stats = getAgendaVoteStats(agenda.id, agenda.is_evaluation);
                          return (
                            <div key={agenda.id} style={{ background: "rgba(120, 120, 120, 0.08)", borderRadius: "6px", padding: "0.6rem 0.75rem", border: "1px solid var(--border-color)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-primary)", marginBottom: "0.4rem", fontWeight: "700" }}>
                                <span>{agenda.title}</span>
                                {agenda.is_evaluation ? (
                                  <span style={{ color: "var(--accent-color)" }}>평균: {stats.avg}점 / 5.00</span>
                                ) : (
                                  <span style={{ color: "var(--success-color)" }}>참여: {stats.totalVotes}명</span>
                                )}
                              </div>
                              {agenda.is_evaluation ? (
                                /* 5점 척도 평점 채점 시각화 (진척도 바 형태로 평균점수 시각화) */
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${(Number(stats.avg) / 5) * 100}%`, background: "var(--accent-color)", borderRadius: "4px", transition: "width 0.3s ease" }} />
                                  </div>
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", minWidth: "30px" }}>{((Number(stats.avg) / 5) * 100).toFixed(0)}%</span>
                                </div>
                              ) : (
                                /* 일반 찬반 투표 비율 막대 바 시각화 (찬성, 반대, 기권 등) */
                                <div style={{ display: "flex", gap: "0.2rem", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden", marginTop: "0.3rem" }}>
                                  {stats.totalVotes > 0 ? (
                                    <>
                                      <div style={{ width: `${(stats.approve / stats.totalVotes) * 100}%`, background: "#22c55e", transition: "width 0.3s ease" }} title={`찬성: ${stats.approve}명`} />
                                      <div style={{ width: `${(stats.reject / stats.totalVotes) * 100}%`, background: "#ef4444", transition: "width 0.3s ease" }} title={`반대: ${stats.reject}명`} />
                                      <div style={{ width: `${(stats.abstain / stats.totalVotes) * 100}%`, background: "#9ca3af", transition: "width 0.3s ease" }} title={`기권: ${stats.abstain}명`} />
                                    </>
                                  ) : (
                                    <div style={{ width: "100%", background: "rgba(255,255,255,0.05)" }} />
                                  )}
                                </div>
                              )}
                              {!agenda.is_evaluation && stats.totalVotes > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
                                  <span>찬성: {stats.approve}명 ({((stats.approve / stats.totalVotes) * 100).toFixed(0)}%)</span>
                                  <span>반대: {stats.reject}명 ({((stats.reject / stats.totalVotes) * 100).toFixed(0)}%)</span>
                                  <span>기권: {stats.abstain}명 ({((stats.abstain / stats.totalVotes) * 100).toFixed(0)}%)</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 💡 [교육용 한글 주석] 의결서 온라인 제출은 별도 외부로그인을 통해 처리하므로 대시보드 내부 폼은 노출하지 않습니다. */}
                {false && isUserCommitteeMember && selectedMeeting.status === "ACTIVE" && (
                  <div className="card" style={{ padding: "1.25rem", border: "1px solid var(--accent-color)", background: "rgba(var(--accent-color-rgb), 0.03)" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Vote size={18} style={{ color: "var(--accent-color)" }} />
                      위원 의사결정서 온라인 제출
                    </h3>

                    {hasSubmitted ? (
                      <div style={{ textAlign: "center", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                        <Check size={32} style={{ color: "var(--success-color)", marginBottom: "0.25rem" }} />
                        <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "bold" }}>의결서 제출이 완료되었습니다.</p>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.25rem", whiteSpace: "pre-line", textAlign: "left", lineHeight: "1.4" }}>
                          {selectedMeetingAgendas.map((a, idx) => {
                            const detail = agendaInputs[a.id] || { vote: "", score: 0 };
                            const choice = a.is_evaluation ? `${detail.score}점` : (detail.vote === "APPROVE" ? "찬성" : detail.vote === "REJECT" ? "반대" : "기권");
                            return `안건 ${idx + 1}. ${a.title.substring(0, 25)}... ➡️ ${choice}`;
                          }).join("\n")}
                        </p>
                        <button className="btn btn-secondary" onClick={() => setHasSubmitted(false)} style={{ marginTop: "0.75rem", fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                          의결서 수정하기
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {/* 💡 [의안 개조] 의안 목록 루프 돌며 개별 투표 카드 렌더링 */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {selectedMeetingAgendas.map((agenda, index) => {
                            const detail = agendaInputs[agenda.id] || { vote: "", score: 0, opinion: "" };
                            return (
                              <div key={agenda.id} style={{ padding: "0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                  <strong style={{ fontSize: "0.85rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                    <span style={{ color: "var(--accent-color)" }}>#{index + 1}</span> {agenda.title}
                                  </strong>
                                  <span style={{ fontSize: "0.65rem", color: "var(--accent-color)", background: "rgba(var(--accent-color-rgb), 0.1)", padding: "0.1rem 0.3rem", borderRadius: "4px", fontWeight: "bold" }}>
                                    {agenda.is_evaluation ? "5점 척도" : "일반의결"}
                                  </span>
                                </div>
                                {agenda.description && (
                                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0 0 0.5rem 0", lineHeight: "1.4" }}>
                                    {agenda.description}
                                  </p>
                                )}

                                {/* 인풋 분기 */}
                                {agenda.is_evaluation ? (
                                  /* 5점 척도 평점 선택 단추 그룹 */
                                  <div style={{ marginBottom: "0.5rem" }}>
                                    <div style={{ display: "flex", gap: "0.3rem" }}>
                                      {[1, 2, 3, 4, 5].map(scoreVal => {
                                        const isSelected = detail.score === scoreVal;
                                        return (
                                          <button
                                            key={scoreVal}
                                            type="button"
                                            onClick={() => setAgendaInputs(prev => ({
                                              ...prev,
                                              [agenda.id]: { ...prev[agenda.id], score: scoreVal }
                                            }))}
                                            style={{
                                              flex: 1,
                                              padding: "0.3rem",
                                              fontSize: "0.78rem",
                                              fontWeight: "bold",
                                              border: "1px solid",
                                              borderColor: isSelected ? "var(--accent-color)" : "var(--border-color)",
                                              background: isSelected ? "var(--accent-color)" : "rgba(0,0,0,0.2)",
                                              color: isSelected ? "white" : "var(--text-primary)",
                                              borderRadius: "4px",
                                              cursor: "pointer",
                                              transition: "all 0.15s ease"
                                            }}
                                          >
                                            {scoreVal}점
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  /* 일반 찬반기권 선택 단추 그룹 */
                                  <div style={{ marginBottom: "0.5rem" }}>
                                    <div style={{ display: "flex", gap: "0.4rem" }}>
                                      {[
                                        { val: "APPROVE", label: "찬성" },
                                        { val: "REJECT", label: "반대" },
                                        { val: "ABSTAIN", label: "기권" }
                                      ].map(item => {
                                        const isSelected = detail.vote === item.val;
                                        return (
                                          <button
                                            key={item.val}
                                            type="button"
                                            onClick={() => setAgendaInputs(prev => ({
                                              ...prev,
                                              [agenda.id]: { ...prev[agenda.id], vote: item.val }
                                            }))}
                                            style={{
                                              flex: 1,
                                              padding: "0.3rem",
                                              fontSize: "0.78rem",
                                              fontWeight: "bold",
                                              border: "1px solid",
                                              borderColor: isSelected ? (item.val === "APPROVE" ? "#22c55e" : item.val === "REJECT" ? "#ef4444" : "#9ca3af") : "var(--border-color)",
                                              background: isSelected ? (item.val === "APPROVE" ? "rgba(34,197,94,0.15)" : item.val === "REJECT" ? "rgba(239,68,68,0.15)" : "rgba(156,163,175,0.15)") : "rgba(0,0,0,0.2)",
                                              color: isSelected ? (item.val === "APPROVE" ? "#4ade80" : item.val === "REJECT" ? "#f87171" : "#d1d5db") : "var(--text-primary)",
                                              borderRadius: "4px",
                                              cursor: "pointer",
                                              transition: "all 0.15s ease"
                                            }}
                                          >
                                            {item.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <textarea
                                    rows={2}
                                    placeholder={agenda.is_evaluation ? "평가 의견을 간략하게 작성해 주세요." : "의견을 1~2문장으로 기술해 주세요. (선택)"}
                                    value={detail.opinion || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setAgendaInputs(prev => ({
                                        ...prev,
                                        [agenda.id]: { ...prev[agenda.id], opinion: val }
                                      }));
                                    }}
                                    style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", background: "rgba(120, 120, 120, 0.05)", color: "var(--text-primary)", border: "1px solid var(--border-color)", fontSize: "0.78rem", resize: "none" }}
                                  />
                                </div>
                              </div>
                            );
                          })}
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
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
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
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>Gemini AI가 위원들의 서면 의견을 통합 분석하고 대시보드 결과 보고서를 구성하고 있습니다...</p>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
                    {responses.length === 0 ? (
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center", padding: "1rem" }}>
                        현재 제출된 위원 심의 의견서가 없습니다.
                      </span>
                    ) : (
                      responses.map((r, idx) => (
                        <div key={r.id} style={{ padding: "0.6rem 0.8rem", borderRadius: "6px", background: "rgba(120, 120, 120, 0.08)", border: "1px solid var(--border-color)", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                          <span style={{
                            fontSize: "0.7rem",
                            padding: "0.15rem 0.4rem",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            background: r.vote === "APPROVE" ? "rgba(34, 197, 94, 0.15)" : r.vote === "REJECT" ? "rgba(239, 68, 68, 0.15)" : r.vote === "EVALUATION" ? "rgba(99, 102, 241, 0.15)" : "rgba(156, 163, 175, 0.15)",
                            color: r.vote === "APPROVE" ? "#22c55e" : r.vote === "REJECT" ? "#ef4444" : r.vote === "EVALUATION" ? "var(--accent-color)" : "#9ca3af"
                          }}>
                            {r.vote === "APPROVE" ? "찬성" : r.vote === "REJECT" ? "반대" : r.vote === "EVALUATION" ? "평가완료" : "기권"}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <strong style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>
                                {r.committee_members?.name} <small style={{ color: "var(--text-secondary)" }}>({r.committee_members?.dept || "소속 없음"})</small>
                              </strong>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                                {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : ""}
                              </span>
                            </div>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem", whiteSpace: "pre-line", lineHeight: "1.4" }}>{r.opinion}</p>
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
                                    background: "transparent",
                                    padding: "2px",
                                    objectFit: "contain",
                                    filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.5))"
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
              <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)" }}>
                위원회 의결 결과보고 대장
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                성원 및 표결 요건을 충족하여 가결/부결 처리된 공식 보고서 목록입니다.
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4.5rem", color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
              <FileText size={48} style={{ display: "block", margin: "0 auto 1rem auto" }} />
              <span>아직 탑재 완료(AI 종합 분석)된 위원회 결과 보고서가 없습니다.</span>
            </div>
          ) : (
            // 💡 [UI 개편 - Master-Detail 2열 레이아웃 적용] 좌측 리스트와 우측 상세 뷰어를 flex 구조로 분리
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", marginTop: "0.5rem" }}>
              
              {/* 왼쪽 블록: 위원회 회의 결과보고 목록 리스트 */}
              <div 
                style={{ 
                  width: "280px", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "0.75rem",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  maxHeight: "650px",
                  overflowY: "auto"
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--text-secondary)", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "0.25rem" }}>
                  회의 목록 ({reports.length}건)
                </div>
                {reports.map((rep) => {
                  const isSelected = selectedReportId === rep.id;
                  return (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedReportId(rep.id)}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "6px",
                        cursor: "pointer",
                        border: isSelected ? "1px solid var(--accent-color)" : "1px solid rgba(255,255,255,0.05)",
                        background: isSelected ? "rgba(37, 99, 235, 0.1)" : "rgba(255,255,255,0.01)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <span style={{ fontSize: "0.68rem", color: "var(--accent-color)", fontWeight: "bold" }}>
                        {rep.committee_meetings?.committees?.name}
                      </span>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)", marginTop: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {rep.committee_meetings?.title}
                      </h4>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        {rep.committee_meetings?.meeting_type === "ONLINE_WRITTEN" ? "서면의결" : "대면의결"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 오른쪽 블록: 선택된 결과보고서 상세 분석 & 다운로드 영역 */}
              <div style={{ flex: 1 }}>
                {(() => {
                  const activeRep = reports.find(r => r.id === selectedReportId) || reports[0];
                  if (!activeRep) return null;

                  // 💡 [의결 형태별 일시 표기 분기] 서면의결인 경우 시간 없이 일자만 표시, 대면인 경우 시작시간까지 표시
                  const isWrittenMeeting = activeRep.committee_meetings?.meeting_type === "ONLINE_WRITTEN";
                  const displayDate = activeRep.committee_meetings?.meeting_date
                    ? new Date(activeRep.committee_meetings.meeting_date).toLocaleDateString("ko-KR", 
                        isWrittenMeeting 
                          ? { year: 'numeric', month: 'long', day: 'numeric' } 
                          : { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                      )
                    : "-";

                  return (
                    <div
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
                            {activeRep.committee_meetings?.committees?.name}
                          </span>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", marginTop: "0.15rem" }}>
                            {activeRep.committee_meetings?.title}
                          </h3>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            의결 형태: {activeRep.committee_meetings?.meeting_type === "ONLINE_WRITTEN" ? "서면의결" : "대면의결"} | 회의 일시: {displayDate} | 보고서 탑재일: {activeRep.published_at ? new Date(activeRep.published_at).toLocaleDateString("ko-KR") : ""}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <span style={{
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            padding: "0.3rem 0.6rem",
                            borderRadius: "6px",
                            background: activeRep.is_established ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: activeRep.is_established ? "#22c55e" : "#ef4444"
                          }}>
                            {activeRep.is_established ? "의결 성원" : "미성원 취소"}
                          </span>
                          <span style={{
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            padding: "0.3rem 0.6rem",
                            borderRadius: "6px",
                            background: activeRep.decision_status === "APPROVED" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                            color: activeRep.decision_status === "APPROVED" ? "#10b981" : "#ef4444"
                          }}>
                            {activeRep.decision_status === "APPROVED" ? "안건 가결" : activeRep.decision_status === "REJECTED" ? "안건 부결" : "의결 취소"}
                          </span>
                        </div>
                      </div>

                      {/* 안건 요지 */}
                      <div style={{ padding: "0.75rem", background: "rgba(0,0,0,0.3)", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "1rem" }}>
                        <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>제출 안건 요지:</strong>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem", whiteSpace: "pre-line" }}>{activeRep.committee_meetings?.agenda}</p>
                      </div>

                      {/* AI 종합 분석 결과 */}
                      <div style={{ padding: "1.25rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                        <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.5rem" }}>
                          <Cpu size={16} style={{ color: "var(--accent-color)" }} />
                          RISE 사업단 AI 심의 분석서
                        </strong>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          {renderMarkdownText(activeRep.ai_summary)}
                        </div>
                      </div>

                      {/* 공식 회의록 인증 및 다운로드 단추 */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", background: "rgba(59, 130, 246, 0.05)", borderRadius: "6px", border: "1px solid rgba(59, 130, 246, 0.2)", fontSize: "0.8rem", color: "#60a5fa" }}>
                          <Award size={14} />
                          <span>{activeRep.official_minutes}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadSignedPDF(activeRep)}
                          disabled={isDownloadingPdf === activeRep.id}
                          className="btn btn-primary"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            padding: "0.5rem 1rem",
                            fontSize: "0.82rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            width: "fit-content",
                            marginTop: "0.25rem",
                            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            border: "none",
                            color: "#fff",
                            boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
                          }}
                        >
                          {isDownloadingPdf === activeRep.id ? (
                            <>
                              <div className="spinner" style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block", marginRight: "4px" }} />
                              PDF 봉인 날인 중...
                            </>
                          ) : (
                            <>
                              <FileText size={15} />
                              의결 결과보고서 다운로드 (디지털 봉인)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          )}
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
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
          <div className="modal-contentcard" style={{ background: "var(--modal-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", width: "500px", maxWidth: "95%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ color: "var(--text-primary)", fontWeight: "800", fontSize: "1.1rem", margin: 0 }}>{isEditMode ? "회의 정보 및 의결 안건 수정" : "신규 회의 의결 개설"}</h3>
              <button 
                type="button" 
                onClick={() => {
                  setIsMeetingModalOpen(false);
                  setIsEditMode(false);
                  setEditingMeetingId(null);
                  setMeetingForm({ title: "", meeting_date: "", meeting_type: "ONLINE_WRITTEN", agenda: "", attachment_name: "", attachment_data: "", access_pin: "", agendas: [{ title: "", description: "", is_evaluation: false }] });
                }}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.25rem", borderRadius: "50%" }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateMeeting} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>회의명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 제1차 앵커총괄위원회 회의"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  className="form-input"
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
                    className="form-input"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>회의 방식</label>
                  <select
                    value={meetingForm.meeting_type}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meeting_type: e.target.value })}
                    className="form-select"
                  >
                    <option value="ONLINE_WRITTEN">서면 의결 (비대면)</option>
                    <option value="OFFLINE_FACE">대면 회의 (시스템 서명)</option>
                  </select>
                </div>
              </div>
              
              {/* 💡 [회의 안건 다중화 개조] 개별 의안 관리 컨트롤러 */}
              <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", padding: "0.75rem", background: "rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-primary)" }}>의결 안건 / 평가 영역 설정 (최소 1개 필수)</label>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {selectedCommittee?.id === "evaluation" && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setMeetingForm(prev => ({
                            ...prev,
                            agendas: [
                              { title: "평가영역 1: 사업 계획의 타당성 및 목표의 구체성", description: "RISE 사업 전체 목표 대비 세부 과제별 사업 계획이 합리적이고 타당하게 설정되었는지 검증합니다.", is_evaluation: true },
                              { title: "평가영역 2: 예산 집행 계획의 합리성 및 집행률 제고 대책", description: "국고 및 대응 자금 예산 집행 계획이 타당하며, 예산 낭비를 막고 효율을 올릴 수 있도록 편성되었는지 심의합니다.", is_evaluation: true },
                              { title: "평가영역 3: 세부 추진 과제(UP/PG)별 성과 지표 달성도", description: "프로그램 진행에 따른 정량/정성 성과지표와 목표치가 지역 발전에 부합하게 설계되어 적절히 추진 중인지 평가합니다.", is_evaluation: true },
                              { title: "평가영역 4: 평가 환류 및 차년도 사업 반영 계획의 적절성", description: "성과 분석을 바탕으로 미흡 과제를 보완하고, 환류 결과를 차년도 계획에 객관적이고 공정하게 연계했는지 검증합니다.", is_evaluation: true }
                            ]
                          }));
                        }}
                        style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", borderRadius: "4px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#fff", cursor: "pointer" }}
                      >
                        📋 4대 평가영역 자동 설정
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setMeetingForm(prev => ({
                          ...prev,
                          agendas: [...(prev.agendas || []), { title: "", description: "", is_evaluation: false }]
                        }));
                      }}
                      style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", borderRadius: "4px", background: "var(--input-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)", fontWeight: "bold", cursor: "pointer" }}
                    >
                      ➕ 의안 추가
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "180px", overflowY: "auto", paddingRight: "0.25rem" }}>
                  {(meetingForm.agendas || []).map((agenda, index) => (
                    <div key={index} style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", padding: "0.5rem", background: "rgba(0,0,0,0.2)" }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: "bold", color: "var(--accent-color)" }}>#{index + 1}</span>
                        <input
                          type="text"
                          required
                          placeholder="예: 제1호 의안 - 2차년도 사업계획서 심의"
                          value={agenda.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMeetingForm(prev => {
                              const updated = [...(prev.agendas || [])];
                              updated[index].title = val;
                              return { ...prev, agendas: updated };
                            });
                          }}
                          className="form-input"
                          style={{ flex: 1, padding: "0.3rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}
                        />
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                          <input
                            type="checkbox"
                            checked={!!agenda.is_evaluation}
                            onChange={(e) => {
                              const chk = e.target.checked;
                              setMeetingForm(prev => {
                                const updated = [...(prev.agendas || [])];
                                updated[index].is_evaluation = chk;
                                return { ...prev, agendas: updated };
                              });
                            }}
                          />
                          5점 척도
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setMeetingForm(prev => {
                              const updated = (prev.agendas || []).filter((_, i) => i !== index);
                              return { ...prev, agendas: updated };
                            });
                          }}
                          style={{ background: "transparent", border: "none", color: "var(--danger-color)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="안건 설명 또는 세부 평가기준을 요약해 주세요. (선택)"
                        value={agenda.description || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMeetingForm(prev => {
                            const updated = [...(prev.agendas || [])];
                            updated[index].description = val;
                            return { ...prev, agendas: updated };
                          });
                        }}
                        className="form-textarea"
                        style={{ width: "100%", padding: "0.3rem 0.5rem", borderRadius: "4px", fontSize: "0.78rem", resize: "none", marginBottom: "0.4rem" }}
                      />
                      
                      {/* 안건별 개별 자료 첨부 입력 컨트롤 (PDF 전용 & 1MB 자동 압축) */}
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>📄 심의자료:</label>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const res = await compressPdfIfNeeded(file);
                            if (!res) {
                              e.target.value = "";
                              return;
                            }
                            setMeetingForm(prev => {
                              const updated = [...(prev.agendas || [])];
                              updated[index].attachment_name = res.name;
                              updated[index].attachment_data = res.dataUrl;
                              return { ...prev, agendas: updated };
                            });
                          }}
                          style={{ flex: 1, fontSize: "0.68rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "0.15rem 0.3rem", borderRadius: "4px" }}
                        />
                        {agenda.attachment_name && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.68rem", color: "var(--success-color)", whiteSpace: "nowrap" }}>
                            <span>📎 {agenda.attachment_name.substring(0, 10)}...</span>
                            <button
                              type="button"
                              onClick={() => {
                                setMeetingForm(prev => {
                                  const updated = [...(prev.agendas || [])];
                                  updated[index].attachment_name = "";
                                  updated[index].attachment_data = "";
                                  return { ...prev, agendas: updated };
                                });
                              }}
                              style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.68rem", fontWeight: "bold" }}
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(meetingForm.agendas || []).length === 0 && (
                    <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                      등록된 의안이 없습니다. 상단 우측 버튼을 통해 안건을 추가해 주세요.
                    </div>
                  )}
                </div>
              </div>

              {/* 💡 [회의 안건 의결 서류 파일 탑재 필드] (PDF 전용 & 1MB 자동 압축 안내) */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>의결 심의 자료 첨부 (선택)</label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="form-input"
                    style={{ width: "100%", padding: "0.4rem", borderRadius: "6px", fontSize: "0.75rem" }}
                  />
                  <small style={{ color: "var(--text-secondary)", fontSize: "0.7rem", marginTop: "0.15rem", display: "block" }}>
                    * pdf 확장자만 지원 (1MB 초과 시 1MB 이하로 자동 최적화 압축)
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
                    className="form-input"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setIsMeetingModalOpen(false);
                  setIsEditMode(false);
                  setEditingMeetingId(null);
                  setMeetingForm({ title: "", meeting_date: "", meeting_type: "ONLINE_WRITTEN", agenda: "", attachment_name: "", attachment_data: "", access_pin: "", agendas: [{ title: "", description: "", is_evaluation: false }] });
                }} style={{ flex: 1 }}>취소</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditMode ? "수정사항 저장" : "회의 등록 및 의결 개시"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
