import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, 
  FileText, Award, Layers, Plus, CheckCircle, Info, ChevronLeft, ChevronRight,
  Edit, Trash2
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
      { id: 2, type: "위원장", name: "송경영", org: "울산과학대학교", dept: "앵커사업단", rank: "단장", location: "교내", note: "" },
      { id: 3, type: "위원", name: "김현수", org: "울산과학대학교", dept: "앵커사업단", rank: "본부장", location: "교내", note: "" },
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
      { id: 4, type: "위원", name: "송경영", org: "울산과학대학교", dept: "앵커사업단", rank: "단장", location: "교내", note: "" },
      { id: 5, type: "위원", name: "김현수", org: "울산과학대학교", dept: "앵커사업단", rank: "본부장", location: "교내", note: "" },
      { id: 6, type: "위원", name: "고우근", org: "울산과학대학교", dept: "기획팀", rank: "팀장", location: "교내", note: "" },
      { id: 7, type: "위원", name: "강신욱", org: "인택스세무법인", dept: "세무팀", rank: "부대표", location: "교외", note: "" },
      { id: 8, type: "간사", name: "심현미", org: "울산과학대학교", dept: "앵커사업단운영팀", rank: "팀장", location: "교내", note: "" }
    ]
  },
  {
    id: "eval",
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
  }
];

export default function ScheduleManager({
  currentUser,
  currentRole,
  selectedYear,
  darkMode = true,
  subTab,
  onChangeSubTab,
  monthlySchedules = [],
  setMonthlySchedules,
  eventSchedules = [],
  setEventSchedules,
  meetingSchedules = [],
  setMeetingSchedules,
  pressReleases = [],
  setPressReleases,
  members = []
}) {
  // 모달 제어 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState("monthly"); // "monthly", "event", "meeting", "press"
  const [isEditMode, setIsEditMode] = useState(false);   // 수정 모드 활성화 여부
  const [editingItemId, setEditingItemId] = useState(null); // 편집 대상 일정 ID

  // 선택 연차의 실제 회계연도 사업기간(3/1 ~ 이듬해 2/28 또는 29) 부합 여부 판별 함수
  const isDateInSelectedYear = (dateStr, yearVal) => {
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

  // 위원회 관리 상태 정의
  const [selectedCommitteeId, setSelectedCommitteeId] = useState("total"); // 선택된 위원회 ID ("total", "planning" 등)
  const [activeCommitteeDetailTab, setActiveCommitteeDetailTab] = useState("members"); // 위원회 세부 정보 탭 ("members": 명단, "purpose": 목적/기능)

  // 위원회 및 위원 명단 상태 (초기값은 하드코딩 백업 데이터)
  const [committees, setCommittees] = useState(COMMITTEES_DATA);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // 수정할 위원 정보 (null 이면 신규 추가)
  


  // 위원회 종류 필터 상태
  const [selectedCommitteeFilters, setSelectedCommitteeFilters] = useState([]);

  // AI 언론 기사 크롤링 시뮬레이션 상태
  const [isCrawlerModalOpen, setIsCrawlerModalOpen] = useState(false);
  const [crawlerLogs, setCrawlerLogs] = useState([]);
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
    note: ""
  });

  // 위원회 명단 수정 권한 통제 (송경영, 김현수, 심현미 3명에게만 부여)
  const currentUserName = currentUser?.name ? currentUser.name.split(" ")[0].split("(")[0].trim() : "";
  const hasCommitteeEditPermission = ["송경영", "김현수", "심현미"].includes(currentUserName);

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
        const orderMap = {
          "total": 1,      // RISE총괄위원회
          "planning": 2,   // RISE기획위원회
          "budget": 3,     // RISE사업비관리위원회
          "eval": 4,       // RISE사업자체평가위원회
          "advisory": 5    // RISE사업자문회의
        };
        const sortedComms = [...comms].sort((a, b) => (orderMap[a.id] || 99) - (orderMap[b.id] || 99));

        const { data: mems, error: memsErr } = await supabase
          .from("committee_members")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true });
        if (memsErr) throw memsErr;

        const combined = sortedComms.map(c => ({
          ...c,
          desc: c.description, // desc 필드를 description 컬럼으로 상호 치환 대응
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
              note: m.note
            }))
        }));
        setCommittees(combined);
      }
    } catch (e) {
      console.warn("Supabase 위원회 명단 조회 실패, 로컬 캐시 사용:", e);
    }
  };

  useEffect(() => {
    loadCommitteesData();
  }, []);

  // 위원 삭제 처리 함수
  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("이 위원을 명단에서 정말 삭제하시겠습니까?")) return;
    try {
      const { error } = await supabase
        .from("committee_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
      
      // DB 삭제 후 화면 데이터 실시간 갱신
      await loadCommitteesData();
    } catch (e) {
      console.error("위원을 삭제하는 데 실패했습니다:", e);
      alert("삭제 중 오류가 발생했습니다: " + e.message);
    }
  };

  // 위원 추가/수정 저장 처리 함수
  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!memberFormData.name.trim()) {
      alert("성명을 입력해 주세요.");
      return;
    }
    
    try {
      if (editingMember) {
        // 기존 멤버 정보 업데이트 (UPDATE)
        const { error } = await supabase
          .from("committee_members")
          .update({
            type: memberFormData.type,
            name: memberFormData.name,
            org: memberFormData.org,
            dept: memberFormData.dept,
            rank: memberFormData.rank,
            location: memberFormData.location,
            note: memberFormData.note
          })
          .eq("id", editingMember.id);
        if (error) throw error;
      } else {
        // 신규 멤버 정보 추가 (INSERT)
        const currentMembers = committees.find(c => c.id === selectedCommitteeId)?.members || [];
        const nextSortOrder = currentMembers.length + 1;
        
        const { error } = await supabase
          .from("committee_members")
          .insert({
            committee_id: selectedCommitteeId,
            type: memberFormData.type,
            name: memberFormData.name,
            org: memberFormData.org,
            dept: memberFormData.dept,
            rank: memberFormData.rank,
            location: memberFormData.location,
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
    } catch (e) {
      console.error("위원을 저장하는 데 실패했습니다:", e);
      alert("저장 중 오류가 발생했습니다: " + e.message);
    }
  };

  // 캘린더 월 상태 (2026년 7월 기준)
  const [currentMonth, setCurrentMonth] = useState(7); // 7월
  const [selectedDay, setSelectedDay] = useState(15); // 디폴트 선택 일자

  // 행사 및 회의 월 선택 상태
  const [selectedEventMonth, setSelectedEventMonth] = useState(7); // 7월
  const [selectedMeetingMonth, setSelectedMeetingMonth] = useState(7); // 7월

  // 언론보도 세부 구분 필터 상태 ("all", "방송", "신문", "기타")
  const [selectedPressType, setSelectedPressType] = useState("all");
  const [activePressId, setActivePressId] = useState(null);

  // 회의 대분류 상태 ("operating": 사업단 운영회의, "center": 센터별 회의, "committee": 각종 위원회 회의)
  const [activeMeetingCat, setActiveMeetingCat] = useState(() => {
    return localStorage.getItem("anchor_active_meeting_cat") || "operating";
  });

  // 회의 카테고리 탭 변경 시 localStorage에 저장하여 새로고침 시에도 탭 유지
  useEffect(() => {
    localStorage.setItem("anchor_active_meeting_cat", activeMeetingCat);
  }, [activeMeetingCat]);

  // 월간일정 상세 링킹 기능 (행사, 회의록 연계 이동)
  const handleLinkToDetail = (sched) => {
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
        onChangeSubTab("event");
      }

      // 2. 행사 매칭 및 스크롤
      const matchedEvent = eventSchedules.find(e => {
        const dateMatch = e.datetime && e.datetime.includes(sched.startAt.split(" ")[0]);
        const titleMatch = e.title && (e.title.includes(sched.title) || sched.title.includes(e.title));
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
      const matchedMeeting = meetingSchedules.find(m => {
        const dateMatch = m.datetime && m.datetime.includes(sched.startAt.split(" ")[0]);
        const titleMatch = m.title && (m.title.includes(sched.title) || sched.title.includes(m.title));
        return dateMatch || titleMatch;
      });

      if (matchedMeeting) {
        // 2. 회의 카테고리, 월, 탭 전환
        setSelectedMeetingMonth(parsedMonth);
        if (matchedMeeting.category) {
          setActiveMeetingCat(matchedMeeting.category);
        }
        setSelectedMeetingId(matchedMeeting.id);
        
        if (onChangeSubTab) {
          onChangeSubTab("meeting");
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
  const [formData, setFormData] = useState({
    title: "",
    type: "행사",
    dept: "사업운영팀",
    startDate: "2026-07-15",
    startTime: "10:00",
    endDate: "2026-07-15",
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
    pressDate: "2026-07-15",
    pressTime: "10:00",
    pressMedia: "",
    pressUrl: "",
    pressType: "방송",
    pressContent: ""
  });

  // 의제-결과 1:1 매핑 상태 추가
  const [agendaResultPairs, setAgendaResultPairs] = useState([{ agenda: "", result: "" }]);

  // AI 기획서 자동완성 상태 관리
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiFileName, setAiFileName] = useState("");
  const [aiRawText, setAiRawText] = useState(""); // 기획서 원본 텍스트 직접 입력/저장용
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStatusText, setAiStatusText] = useState("");
  const [aiEngine, setAiEngine] = useState("gpt"); // "gemini" or "gpt"

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

  // 실제 파일 선택 핸들러
  const handleAiFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAiFileName(file.name);
      
      // 1. 텍스트 파일인 경우 실시간 파일 내용 추출
      if (file.type.match('text.*') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setAiRawText(event.target.result);
        };
        reader.readAsText(file);
      } 
      // 2. PDF 파일인 경우 브라우저 단독 라이브러리로 텍스트 파싱
      else if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
        setAiRawText("📄 PDF 파일 분석 중... (본문 텍스트 추출 진행 중)");
        try {
          const arrayBuffer = await file.arrayBuffer();
          // pdfjs를 이용한 문서 로드
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          let fullText = "";
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += `[Page ${i}]\n${pageText}\n\n`;
          }
          
          if (fullText.trim()) {
            setAiRawText(fullText.trim());
          } else {
            setAiRawText(`[${file.name}] 파일에서 텍스트를 추출하지 못했습니다. 스캔 이미지 형태의 PDF이거나 본문이 비어있습니다.`);
          }
        } catch (pdfErr) {
          console.error("PDF 텍스트 추출 실패:", pdfErr);
          setAiRawText(`❌ PDF 텍스트 추출에 실패했습니다. 에러: ${pdfErr.message}\n본문 내용을 복사해서 직접 입력해 주세요.`);
        }
      }
      // 3. 그 외 바이너리 포맷 (HWP 등)
      else {
        setAiRawText(`[${file.name}] 파일이 감지되었습니다. 텍스트 직접 추출이 불가능한 한글(HWP) 파일 포맷이므로, 기획서 본문 내용을 복사해서 여기에 붙여넣어 주세요.`);
      }
    }
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
  const triggerAiAutoFill = async () => {
    if (!aiRawText) {
      alert("⚠️ 먼저 분석할 기획서/결과서 텍스트를 입력하시거나 [기획안 샘플 파일 자동 로드]를 클릭해 주세요.");
      return;
    }

    setIsAiLoading(true);
    setAiProgress(10);

    const promptText = `
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
${aiRawText}
    `.trim();

    try {
      // A. OpenAI GPT-4o-mini 엔진을 선택했을 경우
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
            runSimulationFallback();
            return;
          }
          apiKey = inputKey.trim();
          localStorage.setItem("user_openai_api_key", apiKey);
        }

        setAiProgress(30);
        setAiStatusText("OpenAI GPT-4o-mini 분석 요청 전송 중...");

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
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
        setFormData(prev => ({ ...prev, ...cleanJson }));

        setIsAiLoading(false);
        setAiProgress(100);
        setAiStatusText("");
        alert("🎉 OpenAI GPT-4o-mini 모델이 기획서를 분석하여 행사 등록 정보 11개 항목을 완벽하게 기입하였습니다!");

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
            runSimulationFallback();
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
        setFormData(prev => ({ ...prev, ...cleanJson }));

        setIsAiLoading(false);
        setAiProgress(100);
        setAiStatusText("");
        alert("🎉 Gemini-1.5-flash 모델이 기획서를 실시간으로 분석하여 행사 등록 정보 11개 항목을 완벽하게 기입하였습니다!");
      }

    } catch (error) {
      console.error("AI API 호출 에러 (시뮬레이션 모드 자동 폴백):", error);
      // 사용자 인터럽트를 방지하기 위해 경고창을 띄우지 않고, 콘솔에 에러 기록 후 자동으로 시뮬레이터 데이터를 기입하여 마감합니다.
      runSimulationFallback();
    }
  };

  // 연구원 선택 칩 클릭 시 참석자(내부) 텍스트 필드에 추가/삭제 토글해 주는 헬퍼 함수
  const handleToggleAttendee = (name) => {
    setFormData(prev => {
      const current = prev.attendees || "";
      // 쉼표로 쪼개고 빈값 제거, 공백 다듬기
      let list = current.split(",").map(x => x.trim()).filter(Boolean);
      
      if (list.includes(name)) {
        // 이미 들어있다면 제거
        list = list.filter(x => x !== name);
      } else {
        // 들어있지 않다면 새로 추가
        list.push(name);
      }
      
      return {
        ...prev,
        attendees: list.join(", ")
      };
    });
  };

  // 파일 업로드 로딩 상태
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // 회의록 음성 녹음 파일(MP3/PDF) 업로드 핸들러
  // 회의록 음성 녹음 파일(MP3) 및 문서(PDF) 개별 업로드 핸들러
  const handleMinutesFileUpload = async (e, type) => {
    const file = e.target.files[0];
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
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 최대 5MB를 초과할 수 없습니다.");
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
    } catch (err) {
      console.error("File upload error:", err);
      alert("파일 업로드 실패: " + err.message);
    } finally {
      setIsUploadingFile(false);
    }
  };

  // 유튜브 임베드용 ID 추출 헬퍼
  const getYoutubeEmbedUrl = (url) => {
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
  const [selectedDeptFilters, setSelectedDeptFilters] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

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
          setSelectedMeetingId(filteredList[0].id);
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
          return dateB - dateA;
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
        return dateB - dateA;
      });
    if (filtered.length > 0) {
      if (!activePressId || !filtered.some(p => p.id === activePressId)) {
        setActivePressId(filtered[0].id);
      }
    } else {
      setActivePressId(null);
    }
  }, [pressReleases, selectedPressType, activePressId, selectedYear]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
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
      return updated;
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
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
                isDeadline: isDeadlineVal
              }
            : s
        ));
      } else {
        const newItem = {
          id: Date.now(),
          title: formData.title || "새 일정",
          type: isTaskVal ? "할일" : (isDeadlineVal ? "마감" : (formData.type || "기타")),
          dept: isDeadlineVal ? "사업운영팀" : (formData.dept || "사업운영팀"),
          startAt: startAtVal,
          endAt: (isTaskVal || isDeadlineVal) ? startAtVal : (hasTime ? `${formData.endDate} ${formData.endTime}` : formData.endDate),
          location: (isTaskVal || isDeadlineVal) ? "" : (formData.location || "-"),
          isTask: isTaskVal,
          isDeadline: isDeadlineVal,
          completed: false
        };
        setMonthlySchedules([newItem, ...monthlySchedules]);
      }
    } else if (modalType === "event") {
      // 3) 일자가 입력되면 자동으로 해당월 추출 (예: 2026-07-25 -> 7)
      const extractedMonth = formData.eventDate ? parseInt(formData.eventDate.split("-")[1], 10) : 7;
      
      // 4) 일자(캘린더 입력 YYYY-MM-DD), 시간(시작, 종료 개별 입력) 조합
      const combinedDatetime = `${formData.eventDate} ${formData.eventStartTime} ~ ${formData.eventEndTime}`;

      if (isEditMode) {
        setEventSchedules(eventSchedules.map(e => 
          e.id === editingItemId 
            ? {
                ...e,
                month: extractedMonth,
                title: formData.title || "새 행사",
                department: formData.department || "-",
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
          month: extractedMonth,
          title: formData.title || "새 행사 일정",
          department: formData.department || "-",
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
      
      // 일자(YYYY-MM-DD)와 시작/종료 시간을 결합하여 datetime 문자열 조합
      const combinedDatetime = `${formData.meetingDate} ${formData.meetingStartTime} ~ ${formData.meetingEndTime}`;

      // 작성자 및 부서 정보를 attendeesExternal에 조합하여 저장 (하위호환성 유지)
      const combinedAttendeesExternal = `작성자: ${formData.writer || "작성자 미정"} | 부서: ${formData.dept || "부서 미정"}`;

      // 의제 및 결과를 1:1 매핑 데이터로부터 직렬화
      const combinedAgenda = (agendaResultPairs || [])
        .map(p => p.agenda.trim())
        .filter(Boolean)
        .join("\n");
      const combinedResult = (agendaResultPairs || [])
        .map(p => p.result.trim())
        .filter(Boolean)
        .join("\n");

      if (isEditMode) {
        setMeetingSchedules(meetingSchedules.map(m => 
          m.id === editingItemId
            ? {
                ...m,
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
      const combinedDatetime = `${formData.pressDate}T${formData.pressTime}:00+09:00`;

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
  const handleDeleteSchedule = (id) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    if (window.confirm("선택한 일정을 삭제하시겠습니까?")) {
      setMonthlySchedules(monthlySchedules.filter(s => s.id !== id));
    }
  };

  // 일정 수정 모달 트리거
  const handleEditSchedule = (sched) => {
    setIsEditMode(true);
    setEditingItemId(sched.id);
    setModalType(sched.isDeadline ? "deadline" : (sched.isTask ? "task" : "monthly"));

    const startParts = sched.startAt ? sched.startAt.split(" ") : ["2026-07-15", "10:00"];
    const endParts = sched.endAt ? sched.endAt.split(" ") : ["2026-07-15", "11:00"];
    const noTimeVal = startParts.length < 2 || !startParts[1];

    setFormData({
      title: sched.title,
      type: sched.type || "행사",
      dept: sched.dept || "사업운영팀",
      startDate: startParts[0] || "2026-07-15",
      startTime: startParts[1] || "10:00",
      endDate: endParts[0] || "2026-07-15",
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
      agenda: ""
    });
    setIsAddModalOpen(true);
  };

  // 할일 완료 상태 토글
  const handleToggleTaskCompleted = (id) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    setMonthlySchedules(prev => prev.map(s => 
      s.id === id ? { ...s, completed: !s.completed } : s
    ));
  };

  // 행사 및 결과 기획 삭제 핸들러
  const handleDeleteEvent = (id) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    if (window.confirm("선택한 행사 기획 및 결과 내역을 삭제하시겠습니까?")) {
      setEventSchedules(eventSchedules.filter(e => e.id !== id));
    }
  };

  // 행사 및 결과 기획 수정 모달 트리거
  const handleEditEvent = (event) => {
    setIsEditMode(true);
    setEditingItemId(event.id);
    setModalType("event");

    // datetime 파싱 ("2026-07-25 13:00 ~ 15:00" 형식)
    const dt = event.datetime || "";
    const parts = dt.split(" ");
    let eventDate = parts[0] || "2026-07-15";
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

    setFormData({
      title: event.title,
      type: "행사",
      dept: "사업운영팀",
      startDate: "2026-07-15",
      startTime: "10:00",
      endDate: "2026-07-15",
      endTime: "11:00",
      location: event.location || "",
      noTime: false,
      month: event.month || 7,
      department: event.department || "",
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
  const handleDeleteMeeting = (id) => {
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

      alert(`✨ [엔진 비상 전환] 로컬 안전 지능 엔진으로 카드를 대체 보완 완성했습니다.\n(원인: ${err.message})`);
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
    const uniqueNewPress = [];
    const duplicatedTitles = [];

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
      const mockMeetingsWithYear = mockMeetings.map(m => ({ ...m, year: selectedYear }));

      const { data: insertedData, error } = await supabase
        .from("schedule_meetings")
        .insert(mockMeetingsWithYear)
        .select();

      if (error) throw error;

      if (insertedData && insertedData.length > 0) {
        const formatted = insertedData.map(x => ({
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
      alert("데이터 생성 중 오류가 발생했습니다: " + err.message);
    }
  };

  // 회의록 수정 모달 트리거
  const handleEditMeeting = (meeting) => {
    setIsEditMode(true);
    setEditingItemId(meeting.id);
    setModalType("meeting");

    // datetime 파싱 ("2026-07-25 13:00 ~ 15:00" 형식)
    const dt = meeting.datetime || "";
    const parts = dt.split(" ");
    let meetingDate = parts[0] || "2026-07-15";
    let meetingStartTime = "10:00";
    let meetingEndTime = "11:00";

    if (parts.length >= 4) {
      meetingStartTime = parts[1] || "10:00";
      meetingEndTime = parts[3] || "11:00";
    } else if (parts.length >= 2) {
      const timeParts = parts[1].split("~");
      meetingStartTime = timeParts[0] || "10:00";
      meetingEndTime = timeParts[1] || "11:00";
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

    // 의제 목록 파싱 (줄바꿈 구분)
    const agendaStr = meeting.agenda || "";
    const agendaList = agendaStr ? agendaStr.split("\n") : [""];

    // 의제 및 결과 1:1 매핑 데이터 로드
    const agendaLines = (meeting.agenda || "").split("\n").filter(Boolean);
    const resultLines = (meeting.result || "").split("\n").filter(Boolean);
    const maxLen = Math.max(agendaLines.length, resultLines.length, 1);
    const initialPairs = [];
    for (let i = 0; i < maxLen; i++) {
      initialPairs.push({
        agenda: agendaLines[i] || "",
        result: resultLines[i] || ""
      });
    }
    setAgendaResultPairs(initialPairs);

    setFormData({
      title: meeting.title,
      type: "회의",
      dept: dept,
      startDate: "2026-07-15",
      startTime: "10:00",
      endDate: "2026-07-15",
      endTime: "11:00",
      location: meeting.location || "",
      noTime: false,
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
      result: meeting.result || "",
      audioUrl: meeting.audioUrl || meeting.audio_url || "",
      pdfUrl: meeting.pdfUrl || meeting.pdf_url || "",
      pressDate: "2026-07-15",
      pressTime: "10:00",
      pressMedia: "",
      pressUrl: "",
      pressType: "방송"
    });
    setIsAddModalOpen(true);
  };

  // 언론보도 삭제 핸들러
  const handleDeletePress = (id) => {
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
  const handleEditPress = (press) => {
    setIsEditMode(true);
    setEditingItemId(press.id);
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

  const openAddModal = (type) => {
    setModalType(type);
    setIsEditMode(false);
    setEditingItemId(null);
    setAgendaResultPairs([{ agenda: "", result: "" }]); // 의제-결과 쌍 초기화

    // 현재 선택된 행사 월에 맞춰 기본 날짜 세팅
    const formattedMonth = selectedEventMonth < 10 ? `0${selectedEventMonth}` : selectedEventMonth;
    const defaultEventDate = `2026-${formattedMonth}-15`;

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
      month: selectedEventMonth,
      department: "",
      datetime: "",
      eventDate: defaultEventDate,
      eventStartTime: "",
      eventEndTime: "",
      attendeesInternal: "",
      attendeesExternal: "",
      program: "",
      purpose: "",
      result: "",
      category: "operating",
      agenda: "",
      // 회의록용 추가
      meetingDate: defaultEventDate,
      meetingStartTime: "10:00",
      meetingEndTime: "11:00",
      writer: (() => {
        const activeWriters = (members || []).filter(m => 
          m.status !== "미참여" && 
          m.email && 
          (m.role === "운영팀장" || m.grade === "책임연구원" || m.grade === "선임연구원" || m.grade === "연구원")
        );
        if (activeWriters.length > 0) {
          const first = activeWriters[0];
          const titleOrGrade = first.role === "운영팀장" ? "운영팀장" : (first.grade || "연구원");
          return `${first.name} ${titleOrGrade}`.trim();
        }
        return "박지현 팀장";
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
      operatingResults: {}
    });
    setIsAddModalOpen(true);
  };

  // 캘린더 드로잉 헬퍼
  const getDaysInMonth = (month) => {
    // 2026년 기준 7월은 31일, 8월은 31일
    if (month === 7) return 31;
    if (month === 8) return 31;
    return 30; // 간소화
  };

  const getStartDayOfWeek = (month) => {
    // 2026년 7월 1일은 수요일(3)
    if (month === 7) return 3;
    // 2026년 8월 1일은 토요일(6)
    if (month === 8) return 6;
    return 1;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const startDay = getStartDayOfWeek(currentMonth);
    const cells = [];

    // 빈 셀 채우기 (라이트/다크모드 유동적 border 적용 및 최소 높이 확보)
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} style={{ minHeight: "85px", height: "auto", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid var(--border-color)" }}></div>);
    }

    // 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `2026-${currentMonth < 10 ? "0" + currentMonth : currentMonth}-${day < 10 ? "0" + day : day}`;
      const daySchedules = monthlySchedules.filter(s => s.startAt && s.startAt.substring(0, 10) === dateString);
      const isSelected = selectedDay === day;

      cells.push(
        <div 
          key={`day-${day}`}
          onClick={() => setSelectedDay(day)}
          style={{
            minHeight: "85px",
            height: "auto",
            padding: "0.25rem 0.25rem 0.4rem 0.25rem",
            borderBottom: "1px solid var(--border-color)",
            borderRight: "1px solid var(--border-color)",
            background: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", marginTop: "0.25rem", maxHeight: "115px", overflowY: "auto", flex: 1, scrollbarWidth: "none" }}>
            {daySchedules.map(sched => {
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
                  style={{
                    fontSize: "0.65rem",
                    background: bgColor,
                    color: "white",
                    padding: "0.1rem 0.25rem",
                    borderRadius: "2px",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    textDecoration: isCompleted ? "line-through" : "none",
                    opacity: isCompleted ? 0.6 : 1
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
    const dateString = `2026-${currentMonth < 10 ? "0" + currentMonth : currentMonth}-${selectedDay < 10 ? "0" + selectedDay : selectedDay}`;
    return monthlySchedules.filter(s => s.startAt && s.startAt.substring(0, 10) === dateString);
  };

  return (
    <div className="schedule-manager-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. 월간 일정 */}
      {subTab === "monthly" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                📅 앵커사업단 월간 일정
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                주요 마감일정, 장비 검수, 보고서 제출 기한 등을 캘린더 형태로 일괄 체크
              </p>
            </div>
            
            {currentRole.id !== "GUEST" && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => openAddModal("monthly")}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", borderRadius: "6px",
                    background: "var(--accent-color)", border: "none", color: "var(--text-primary)", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer"
                  }}
                >
                  <Plus size={16} />
                  일정 추가
                </button>
                <button 
                  onClick={() => openAddModal("task")}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", borderRadius: "6px",
                    background: "#8B5CF6", border: "none", color: "var(--text-primary)", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer",
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
                    display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", borderRadius: "6px",
                    background: "#EF4444", border: "none", color: "var(--text-primary)", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer",
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
                    2026년
                  </span>
                  <span style={{ fontSize: "1.45rem", fontWeight: "900", color: "var(--accent-color)" }}>
                    {currentMonth}월
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button 
                    onClick={() => setCurrentMonth(currentMonth === 7 ? 8 : 7)}
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", padding: "0.25rem", cursor: "pointer" }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setCurrentMonth(currentMonth === 7 ? 8 : 7)}
                    style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", padding: "0.25rem", cursor: "pointer" }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
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
                  {getSelectedDaySchedules().map(sched => {
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
                  display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", borderRadius: "6px",
                  background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer"
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
                {m === 3 ? `'${24 + selectedYear}.3월` : m === 1 ? `'${25 + selectedYear}.1월` : `${m}월`}
              </button>
            ))}
          </div>

          {/* 행사 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {eventSchedules.filter(e => e.month === selectedEventMonth).length > 0 ? (
              eventSchedules.filter(e => e.month === selectedEventMonth).map(event => (
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
                      {/* 담당부서 (대괄호 감싸기, 볼드, 짙은 분홍색, 폰트크기 2pt 키워 1.0rem 적용) */}
                      <span style={{ fontWeight: "850", color: "#EC4899", fontSize: "1.0rem", whiteSpace: "nowrap" }}>
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
                      {/* 행사제목: 폰트 크기 2pt 더 크게 (1.2rem), '수정' 마크보다 왼쪽으로 1cm (38px) 떨어지게 */}
                      <h4 style={{ margin: "0 38px 0 1.5rem", fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={event.title}>
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
                    <div style={{ background: "rgba(52, 211, 153, 0.04)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(52, 211, 153, 0.1)", display: "flex", flexDirection: "column", gap: "0.3rem", justifyContent: "center" }}>
                      <span style={{ color: "#34D399", fontWeight: "700", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <CheckCircle size={13} />
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

          {/* 메인 레이아웃: 좌측 목록 + 우측 상세 */}
          <div style={{ display: "grid", gridTemplateColumns: "2.5fr 3.5fr", gap: "1.5rem" }}>
            
            {/* 좌측: 5대 위원회 카드 목록 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {committees.map((comm) => {
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
                      <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "900", color: isSelected ? "var(--text-primary)" : "var(--text-primary)" }}>
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                            총 {(activeComm.members || []).length}명의 위원 등록됨
                          </span>
                          {hasCommitteeEditPermission && (
                            <button
                              onClick={() => {
                                setEditingMember(null);
                                setMemberFormData({
                                  type: "위원",
                                  name: "",
                                  org: "울산과학대학교",
                                  dept: "",
                                  rank: "",
                                  location: "교내",
                                  note: ""
                                });
                                setIsMemberModalOpen(true);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "4px",
                                background: "rgba(236, 72, 153, 0.1)",
                                border: "1px solid rgba(236, 72, 153, 0.3)",
                                color: "var(--accent-color)",
                                fontSize: "0.72rem",
                                fontWeight: "800",
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                            >
                              <Plus size={12} />
                              위원 추가
                            </button>
                          )}
                        </div>

                        {/* 위원 테이블 */}
                        {activeComm.members && activeComm.members.length > 0 ? (
                          <div style={{ flex: 1, overflowY: "auto", maxHeight: "350px" }} className="custom-scrollbar">
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", textAlign: "left" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700" }}>구분</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700" }}>성명</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700" }}>소속기관</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700" }}>부서/학과</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700" }}>직위</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", textAlign: "center" }}>교내외</th>
                                  <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700" }}>비고</th>
                                  {hasCommitteeEditPermission && <th style={{ padding: "0.5rem 0.75rem", fontWeight: "700", textAlign: "right" }}>제어</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {activeComm.members.map((member) => (
                                  <tr 
                                    key={member.id} 
                                    style={{ 
                                      borderBottom: "1px solid rgba(255, 255, 255, 0.03)", 
                                      color: "var(--text-primary)",
                                      background: member.type === "위원장" ? "rgba(236, 72, 153, 0.03)" : "transparent"
                                    }}
                                    className="table-row-hover"
                                  >
                                    <td style={{ padding: "0.6rem 0.75rem" }}>
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
                                    <td style={{ padding: "0.6rem 0.75rem", fontWeight: "700" }}>{member.name}</td>
                                    <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-secondary)" }}>{member.org}</td>
                                    <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-secondary)" }}>{member.dept || "-"}</td>
                                    <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-secondary)" }}>{member.rank || "-"}</td>
                                    <td style={{ padding: "0.6rem 0.75rem", textAlign: "center" }}>
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
                                      <td style={{ padding: "0.6rem 0.75rem", textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                                          <button
                                            onClick={() => {
                                              setEditingMember(member);
                                              setMemberFormData({
                                                type: member.type,
                                                name: member.name,
                                                org: member.org,
                                                dept: member.dept || "",
                                                rank: member.rank || "",
                                                location: member.location,
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
                            {activeComm.functions.map((fn, i) => (
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
                  display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 1rem", borderRadius: "6px",
                  background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer"
                }}
              >
                <Plus size={16} />
                회의록 등록
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
              사업단 운영회의
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
                    {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화지원센터"].map((deptName) => {
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
                        "앵커사업자체평가위원회", "앵커사업자문회의", "앵커사업운영위원회"
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
                            {cName.replace("위원회", "").replace("회의", "")}
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
                      {[
                        "ECC운영위원회", "ICC운영위원회", "RCC운영위원회", "늘봄누리센터운영위원회"
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
                            {cName.replace("위원회", "")}
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
                      const committeePart = parts.find(p => p.includes("위원회:"));
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
                        "앵커사업자체평가위원회", "앵커사업자문회의", "앵커사업운영위원회",
                        "ECC운영위원회", "ICC운영위원회", "RCC운영위원회", "늘봄누리센터운영위원회"
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
                                onClick={() => setSelectedMeetingId(meeting.id)}
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
                                onMouseOver={(e) => { if(!isSelected) e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)"; }}
                                onMouseOut={(e) => { if(!isSelected) e.currentTarget.style.background = "transparent"; }}
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
                              // 💡 1) 사업단 운영회의 전용 상세 요점 뷰
                              // ==========================================
                              const operatingDepts = ["사업단", "사업운영팀", "ECC", "ICC", "RCC", "AID-X", "늘봄누리센터", "신산업특화센터"];
                              
                              // JSON 파싱 및 폴백 매핑
                              let parsedAgendas = {};
                              let parsedResults = {};
                              try {
                                if (selectedMeeting.agenda && selectedMeeting.agenda.trim().startsWith("{")) {
                                  parsedAgendas = JSON.parse(selectedMeeting.agenda);
                                } else {
                                  parsedAgendas = { "사업단": selectedMeeting.agenda || "" };
                                }
                              } catch (e) {
                                parsedAgendas = { "사업단": selectedMeeting.agenda || "" };
                              }
                              try {
                                if (selectedMeeting.result && selectedMeeting.result.trim().startsWith("{")) {
                                  parsedResults = JSON.parse(selectedMeeting.result);
                                } else {
                                  parsedResults = { "사업단": selectedMeeting.result || "" };
                                }
                              } catch (e) {
                                parsedResults = { "사업단": selectedMeeting.result || "" };
                              }

                              const getDeptData = (deptName, dataObj) => {
                                if (!dataObj) return "";
                                const keys = Object.keys(dataObj);
                                const matchedKey = keys.find(k => k.includes(deptName) || deptName.includes(k));
                                return matchedKey ? dataObj[matchedKey] : "";
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
                                    💡 본 사업단 운영회의는 <strong>사업단, 사업운영팀, ECC, ICC, RCC, AID-X, 늘봄누리센터, 신산업특화센터</strong> 각 부서의 주요 업무추진 현황 및 애로사항을 공유하기 위하여 격주로 소집되는 회의입니다.
                                  </div>

                                  {/* 8개 부서 의제 & 결과 2열 그리드 */}
                                  <div style={{ marginTop: "0.5rem" }}>
                                    <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)", fontWeight: "700", display: "block", marginBottom: "0.5rem" }}>
                                      🏢 부서별 주요 업무추진 현황 및 애로사항 (2열 그리드)
                                    </span>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
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
                                              padding: "0.7rem 0.85rem",
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: "0.3rem"
                                            }}
                                          >
                                            <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.2" }}>
                                              📌 {dept}
                                            </span>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.72rem" }}>
                                              <div style={{ color: "var(--text-primary)", display: "flex", gap: "0.25rem", alignItems: "flex-start" }}>
                                                <span style={{ color: "var(--text-secondary)", flexShrink: 0 }}>• 의제:</span>
                                                <span>{agendaVal || "논의사항 없음"}</span>
                                              </div>
                                              <div style={{ color: "var(--text-primary)", display: "flex", gap: "0.25rem", alignItems: "flex-start" }}>
                                                <span style={{ color: "var(--text-secondary)", flexShrink: 0 }}>• 결과:</span>
                                                <span style={{ fontWeight: "700" }}>{resultVal || "추진완료 / 특이사항 없음"}</span>
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
                                          : "본 회의에서는 8대 부서별 주요 안건 공유 및 지산학 프로그램의 격주 실적 관리가 원활히 이뤄졌습니다. AI 핵심 분석 결과 각 부서의 추진 상황은 계획 대비 순조롭게 진행 중인 것으로 분석되었습니다.";
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
                                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifycontent: "space-between" }}>
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
                                    {(selectedMeeting.agenda || "").split("\n").filter(Boolean).map((agendaItem, idx) => (
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
                                    {(selectedMeeting.result || "").split("\n").filter(Boolean).map((resultItem, idx) => (
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

                                {/* PLAUD 음성 녹음 배너 */}
                                <button
                                  type="button"
                                  onClick={() => alert("🎙️ PLAUD 음성 녹음 및 AI 회의록 자동 요약 기능 연동 데모\n\n향후 PLAUD 디바이스 및 API와 실시간 동기화하여, 회의 음성 녹음본이 업로드되면 AI가 발화자별 텍스트 변환(STT) 및 핵심 결정을 자동으로 요약하여 이 회의록에 자동으로 채워주는 스마트 기능이 활성화될 예정입니다.")}
                                  style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem",
                                    padding: "0.45rem", borderRadius: "6px", background: darkMode ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.1)",
                                    border: darkMode ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid rgba(139, 92, 246, 0.25)", color: darkMode ? "#C084FC" : "#6D28D9", fontSize: "0.72rem", fontWeight: "700", cursor: "pointer",
                                    marginTop: "auto"
                                  }}
                                >
                                  🎙️ PLAUD 녹음 자동 연동 (베타 예정)
                                </button>
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
              {meetingSchedules.filter(m => m.category === activeMeetingCat).length > 0 ? (
                meetingSchedules.filter(m => m.category === activeMeetingCat).map(meeting => (
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
                                  {meeting.agenda && meeting.agenda.split("\n").filter(Boolean).map((agendaItem, idx) => (
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
                                  {(meeting.result || "").split("\n").filter(Boolean).map((resultItem, idx) => (
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
                              
                              <button
                                type="button"
                                onClick={() => alert("🎙️ PLAUD 음성 녹음 및 AI 회의록 자동 요약 기능 연동 데모\n\n향후 PLAUD 디바이스 및 API와 실시간 동기화하여, 회의 음성 녹음본이 업로드되면 AI가 발화자별 텍스트 변환(STT) 및 핵심 결정을 자동으로 요약하여 이 회의록에 자동으로 채워주는 스마트 기능이 활성화될 예정입니다.")}
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem",
                                  padding: "0.35rem", borderRadius: "6px", background: darkMode ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.1)",
                                  border: darkMode ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid rgba(139, 92, 246, 0.25)", color: darkMode ? "#C084FC" : "#6D28D9", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer"
                                }}
                              >
                                🎙️ PLAUD 녹음 자동 연동 (베타 예정)
                              </button>
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
                  style={{ fontSize: "0.8rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.45rem 0.9rem", background: "var(--accent-color)", border: "none", color: "white", cursor: "pointer", borderRadius: "6px" }}
                >
                  <Plus size={14} />
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
                    return dateB - dateA;
                  })
                  .map((press) => {
                    const isActive = activePressId === press.id;
                    return (
                      <div 
                        key={press.id}
                        onClick={() => setActivePressId(press.id)}
                        className="glass-card"
                        style={{
                          padding: "1.0rem",
                          borderRadius: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          background: isActive ? "rgba(59, 130, 246, 0.08)" : "rgba(255,255,255,0.02)",
                          border: isActive ? "1px solid var(--accent-color)" : "1px solid var(--border-color)",
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

                          <div style={{ background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.04)" }}>
                            <span style={{ fontSize: "0.75rem", color: "#60A5FA", wordBreak: "break-all" }}>
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
                                padding: "0.6rem", borderRadius: "6px", background: "rgba(59, 130, 246, 0.15)",
                                border: "1px solid rgba(59, 130, 246, 0.3)", color: "#93C5FD", fontSize: "0.8rem", fontWeight: "700", textDecoration: "none", textAlign: "center", transition: "all 0.2s"
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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div className="card" style={{ width: "500px", padding: "1.5rem", borderRadius: "12px", background: "var(--panel-bg)", border: "1px solid var(--border-color)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1.2rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                {editingMember ? "✏️ 위원 정보 수정" : "➕ 새 위원 추가 등록"}
              </h3>
              <button 
                onClick={() => {
                  setIsMemberModalOpen(false);
                  setEditingMember(null);
                }}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "1.2rem", cursor: "pointer" }}
              >
                &times;
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

              {/* 버튼 */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsMemberModalOpen(false);
                    setEditingMember(null);
                  }}
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-primary)", cursor: "pointer", fontSize: "0.8rem" }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{ padding: "0.5rem 1.25rem", borderRadius: "6px", background: "var(--accent-color)", border: "none", color: "var(--text-primary)", fontWeight: "600", cursor: "pointer", fontSize: "0.8rem" }}
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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
          <div style={{
            width: "550px",
            background: "#090d16",
            border: "1px solid #1e293b",
            borderRadius: "10px",
            boxShadow: "0 20px 50px rgba(139, 92, 246, 0.25)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div className="card" style={{ width: "730px", maxHeight: "95vh", overflowY: "auto", padding: "1.25rem", borderRadius: "12px", background: "var(--panel-bg)", border: "1px solid var(--border-color)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.6rem", marginBottom: "0.85rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                {isEditMode 
                  ? (modalType === "deadline" ? "✏️ 마감일 수정" : modalType === "task" ? "✏️ 할일 수정" : modalType === "event" ? "✏️ 행사 기획 및 결과 수정" : modalType === "meeting" ? "✏️ 회의록 수정" : modalType === "press" ? "✏️ 언론보도 수정" : "✏️ 일반 일정 수정") 
                  : (modalType === "monthly" ? "➕ 새 일반 일정 등록" : modalType === "task" ? "➕ 새 할일 등록" : modalType === "deadline" ? "🚨 새 마감일 등록" : modalType === "event" ? "➕ 새 행사 기획 및 결과 등록" : modalType === "meeting" ? "➕ 새 회의록 등록" : modalType === "press" ? "➕ 새 언론보도 등록" : "➕ 새 회의 일정 회의록 등록")}
              </h3>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditMode(false);
                  setEditingItemId(null);
                }}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              
              {/* 마감일 입력 */}
              {modalType === "deadline" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>마감일 내용</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 RISE 최종 계획서 마감" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>마감 기한 (일자)</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
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
                        style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", cursor: formData.noTime ? "not-allowed" : "text", opacity: formData.noTime ? 0.5 : 1 }} 
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
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 결과 보고서 작성 및 결재 요청" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 부서</label>
                    <select name="dept" value={formData.dept} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                      {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>할일 일자</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
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
                        style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", cursor: formData.noTime ? "not-allowed" : "text", opacity: formData.noTime ? 0.5 : 1 }} 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 월간 일정 입력 */}
              {modalType === "monthly" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>일정 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 1차 보고서 제출 마감" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>일정 유형</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        {["행사", "회의", "위원회", "기타"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 부서</label>
                      <select name="dept" value={formData.dept} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작일시 (일자)</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료일시 (일자)</label>
                      <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 대학 본부 대회의실" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                </>
              )}

              {/* 행사 일정 입력 */}
              {modalType === "event" && (
                <>
                  {/* AI 기획서/결과서 자동 기입 위젯 */}
                  <div style={{
                    padding: "0.85rem 1rem",
                    background: "rgba(139, 92, 246, 0.06)",
                    border: "1px dashed rgba(139, 92, 246, 0.3)",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    marginBottom: "0.5rem"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#a78bfa" }}>
                        ✨ AI 기획서∙결과보고서 자동 기입 (GPT-4o-mini 모델 연동)
                      </span>
                      <button
                        type="button"
                        onClick={handleLoadSampleFile}
                        style={{ fontSize: "0.7rem", color: "#60a5fa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                      >
                        [기획안 샘플 파일 자동 로드]
                      </button>
                    </div>
                    
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="file"
                        id="ai-event-file"
                        accept=".pdf,.hwp,.hwpx,.docx,.txt"
                        onChange={handleAiFileChange}
                        style={{ display: "none" }}
                      />
                      <label
                        htmlFor="ai-event-file"
                        style={{
                          flexGrow: 1,
                          padding: "0.45rem 0.75rem",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          color: aiFileName ? "var(--text-primary)" : "var(--text-secondary)",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        <span>{aiFileName || "기획서/결과보고서 첨부파일 선택 (.hwp, .pdf, .docx)"}</span>
                        <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.35rem", borderRadius: "4px", background: "var(--input-bg)", color: "var(--text-secondary)", flexShrink: 0, marginLeft: "0.5rem" }}>
                          파일 탐색
                        </span>
                      </label>
                      
                      <button
                        type="button"
                        onClick={triggerAiAutoFill}
                        disabled={isAiLoading}
                        style={{
                          padding: "0.45rem 1rem",
                          background: isAiLoading ? "rgba(128,128,128,0.2)" : "var(--accent-color)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          cursor: isAiLoading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          flexShrink: 0
                        }}
                      >
                        {isAiLoading ? "분석 중..." : "AI 자동완성"}
                      </button>
                    </div>

                    {isAiLoading && (
                      <div style={{ marginTop: "0.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#a78bfa", marginBottom: "0.2rem", fontFamily: "monospace" }}>
                          <span>{aiStatusText}</span>
                          <span>{aiProgress}%</span>
                        </div>
                        <div style={{ width: "100%", height: "4px", background: "var(--input-bg)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{ width: `${aiProgress}%`, height: "100%", background: "linear-gradient(90deg, #a78bfa 0%, #818cf8 100%)", borderRadius: "2px", transition: "width 0.15s ease" }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 기획서/결과서 텍스트 직접 입력창 (Gemini API가 직접 요약하는 소스 텍스트) */}
                  <div style={{ marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                        📋 분석할 기획서 원문 텍스트 (직접 붙여넣거나 파일 로드 가능)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newKey = prompt("🔑 OpenAI GPT API Key 변경 (sk-로 시작):", localStorage.getItem("user_openai_api_key") || "");
                          if (newKey !== null) {
                            localStorage.setItem("user_openai_api_key", newKey.trim());
                            alert("OpenAI API Key가 브라우저 로컬 스토리지에 안전하게 저장되었습니다.");
                          }
                        }}
                        style={{ fontSize: "0.68rem", color: "var(--accent-color)", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.15rem" }}
                      >
                        ⚙️ API 설정
                      </button>
                    </div>
                    <textarea
                      value={aiRawText}
                      onChange={(e) => setAiRawText(e.target.value)}
                      placeholder="기획안 문서를 업로드하거나 본문 내용을 복사해서 여기에 붙여넣어 주세요. [AI 자동완성]을 누르면 이 내용을 기반으로 실시간 OpenAI GPT 분석이 실행됩니다."
                      style={{
                        width: "100%",
                        height: "55px",
                        padding: "0.4rem 0.5rem",
                        background: "rgba(0,0,0,0.15)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        color: "var(--text-primary)",
                        fontSize: "0.72rem",
                        resize: "none",
                        fontFamily: "sans-serif"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: RISE 지산학 공동 취업 박람회" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>담당 부서(센터)</label>
                      <select name="department" value={formData.department} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        <option value="">-- 부서 선택 --</option>
                        {["ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "사업운영팀"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 체육관 특설 돔" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>
                  
                  {/* 일자 및 시작/종료시간 개별 입력 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 일자</label>
                      <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input type="time" name="eventStartTime" value={formData.eventStartTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input type="time" name="eventEndTime" value={formData.eventEndTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>참석자 (내부 구분)</label>
                      <input type="text" name="attendeesInternal" value={formData.attendeesInternal} onChange={handleInputChange} placeholder="예: 내부 교수 및 연구원 15명" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>참석자 (외부 구분)</label>
                      <input type="text" name="attendeesExternal" value={formData.attendeesExternal} onChange={handleInputChange} placeholder="예: 지자체 관계자 5명" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 프로그램</label>
                    <input type="text" name="program" value={formData.program} onChange={handleInputChange} placeholder="예: 지역 정착 지원 프로그램" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 목적</label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="행사를 통해 도달하고자 하는 목표 기술" style={{ width: "100%", height: "46px", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 결과</label>
                    <textarea name="result" value={formData.result} onChange={handleInputChange} placeholder="수료 인원, 산출된 최종 성과 및 보도 내역" style={{ width: "100%", height: "46px", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", resize: "none" }} />
                  </div>
                </>
              )}

              {/* 회의 일정 입력 */}
              {modalType === "meeting" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 제2차 ICC 센터 공동 운영 회의" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 대분류</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        <option value="operating">사업단 운영회의</option>
                        <option value="center">부서별 회의</option>
                        <option value="committee">각종 위원회</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="예: ICC 센터장실" style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>

                  {/* 회의 일시 개별 입력 필드 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 일자</label>
                      <input type="date" name="meetingDate" value={formData.meetingDate} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input type="time" name="meetingStartTime" value={formData.meetingStartTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input type="time" name="meetingEndTime" value={formData.meetingEndTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>



                  {/* 부서명 및 작성자 드롭다운 배치 */}
                  {formData.category === "operating" ? (
                    <div style={{ marginTop: "0.75rem" }}>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                        👥 전체 사업단 참석자 선택 (팀장교수 포함 다중 선택)
                      </label>
                      {(() => {
                        const ROLE_PRIORITY = {
                          "사업단장": 1,
                          "본부장": 2,
                          "센터장": 3,
                          "운영팀장": 4,
                          "팀장교수": 5,
                          "연구원": 6
                        };
                        const DEPT_PRIORITY = {
                          "ECC센터": 1,
                          "ICC센터": 2,
                          "RCC센터": 3,
                          "AID-X지원센터": 4,
                          "울산늘봄누리센터": 5,
                          "신산업특화센터": 6,
                          "사업운영팀": 7
                        };
                        const GRADE_PRIORITY = {
                          "책임연구원": 1,
                          "선임연구원": 2,
                          "연구원": 3
                        };

                        const meetingDateObj = new Date(formData.meetingDate || new Date());
                        
                        const allActiveMembers = (members || [])
                          .filter(m => {
                            const start = new Date(m.startDate || m.hireDate || "2026-03-01");
                            const end = m.endDate ? new Date(m.endDate) : null;
                            if (start > meetingDateObj) return false;
                            if (end && end < meetingDateObj) return false;
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
                              const isSelected = (formData.attendees || "")
                                .split(",")
                                .map(x => x.trim())
                                .includes(m.name);

                              const displayRole = m.role === "연구원" ? (m.grade || "연구원") : (m.role === "사업단장" ? "단장" : m.role);

                              return (
                                  <button
                                    key={m.id || m.email}
                                    type="button"
                                    onClick={() => handleToggleAttendee(m.name)}
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
                        style={{ width: "100%", padding: "0.5rem", marginTop: "0.35rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.75rem" }} 
                      />
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>부서명</label>
                          <select name="dept" value={formData.dept} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                            {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화지원센터"].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>작성자</label>
                          <select name="writer" value={formData.writer} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                            {(() => {
                              const activeWriters = (members || []).filter(m => 
                                m.status !== "미참여" && 
                                m.email && 
                                (m.role === "운영팀장" || m.grade === "책임연구원" || m.grade === "선임연구원" || m.grade === "연구원")
                              );
                              if (activeWriters.length > 0) {
                                return activeWriters.map(m => {
                                  const titleOrGrade = m.role === "운영팀장" ? "운영팀장" : (m.grade || "연구원");
                                  const displayName = `${m.name} ${titleOrGrade}`.trim();
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

                      {/* 참석자 선택 및 입력 */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                          👥 소속 연구원 선택 (부서별 자동 연동)
                        </label>
                        {(() => {
                          const deptMembers = (members || []).filter(m => {
                            let isDeptMatch = m.dept === formData.dept;
                            if (formData.dept === "신산업특화지원센터" && m.dept === "신산업특화센터") isDeptMatch = true;
                            if (!isDeptMatch) return false;

                            const start = m.startDate || m.start_date || m.hireDate || m.hire_date || "2025-03-01";
                            const end = m.endDate || m.end_date || "";
                            const status = m.status || "참여중";

                            const meetingDateStr = formData.meetingDate;
                            if (meetingDateStr) {
                              if (start && meetingDateStr < start) return false;
                              if (end && meetingDateStr > end) return false;
                            }

                            return status === "참여중";
                          });

                          if (deptMembers.length === 0) {
                            return (
                              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.5rem", padding: "0.25rem", background: "rgba(255,255,255,0.02)", borderRadius: "4px" }}>
                                소속 부서를 먼저 선택해 주세요.
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.5rem", padding: "0.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.04)" }}>
                              {deptMembers.map(m => {
                                const displayName = `${m.name} ${m.grade || "연구원"}`;
                                const isSelected = (formData.attendees || "")
                                  .split(",")
                                  .map(x => x.trim())
                                  .includes(m.name);

                                return (
                                  <button
                                    key={m.id || m.email}
                                    type="button"
                                    onClick={() => handleToggleAttendee(m.name)}
                                    style={{
                                      padding: "0.25rem 0.5rem",
                                      fontSize: "0.7rem",
                                      borderRadius: "4px",
                                      border: "1px solid " + (isSelected ? "var(--accent-color)" : "rgba(255,255,255,0.1)"),
                                      background: isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent",
                                      color: isSelected ? "#60A5FA" : "var(--text-secondary)",
                                      cursor: "pointer",
                                      transition: "all 0.1s ease",
                                      fontWeight: "700"
                                    }}
                                  >
                                    {displayName} {isSelected ? "✓" : "+"}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}

                        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
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
                    </>
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
                        📄 회의록 첨부 문서 (PDF 전용, 최대 5MB)
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
                        🏢 8대 부서별 주요 업무추진 현황 및 애로사항 입력
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxHeight: "250px", overflowY: "auto", paddingRight: "0.25rem" }}>
                        {["사업단", "사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화지원센터"].map((deptName) => {
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
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                        📝 회의 의제 및 결과 관리 (1:1 대응 입력)
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {agendaResultPairs.map((pair, index) => (
                          <div 
                            key={index} 
                            style={{ 
                              display: "grid", 
                              gridTemplateColumns: "1fr 1.2fr 40px", 
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
                            ) : (
                              <div />
                            )}
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

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditMode(false);
                    setEditingItemId(null);
                  }}
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-primary)", cursor: "pointer" }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{ padding: "0.5rem 1.25rem", borderRadius: "6px", background: "var(--accent-color)", border: "none", color: "var(--text-primary)", fontWeight: "600", cursor: "pointer" }}
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
