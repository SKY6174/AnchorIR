import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, 
  FileText, Award, Layers, Plus, CheckCircle, Info, ChevronLeft, ChevronRight,
  Edit, Trash2
} from "lucide-react";

// RISE 사업을 이끌어가는 5대 거버넌스 위원회 상세 정의 상수
const COMMITTEES_DATA = [
  {
    id: "total",
    name: "RISE총괄위원회",
    fullName: "RISE총괄위원회 (구. RISE사업위원회)",
    badge: "최고의사결정",
    color: "linear-gradient(135deg, #ec4899 0%, #be123c 100%)",
    purpose: "RISE 사업 총괄 / 사업계획서 심의 / 교육환경 및 기자재 구축심의 / 예산변경안 최종승인 등",
    desc: "울산 지역 RISE 사업의 최고 의사 결정 기구로, 사업의 총괄 방향 설정, 주요 계획의 심의·의결, 성과 지표 평가 및 환류 체계 조율 등의 핵심 역할을 담당합니다. 본 대학 대학혁신위원회규정(UCS-D-314)에 의한 대학혁신위원회에서 그 기능을 대신합니다.",
    constitution: "내부 9인, 외부 2인을 포함한 11인 내외",
    cycle: "반기별 1회 개최 (필요 시 임시 위원회 소집)",
    functions: [
      "RISE 사업 총괄 및 연도별 사업계획서 심의·의결",
      "교육환경 개선 및 기자재 구축 심의·확정",
      "사업비 대규모 변경(예산변경안) 최종 승인 및 조율",
      "기타 RISE 사업 운영 상 최고 의사결정이 필요한 현안 해결"
    ],
    members: [
      { id: 1, type: "위원장", name: "조홍래", org: "울산과학대학교", dept: "-", rank: "총장", location: "교내", note: "" },
      { id: 2, type: "위원", name: "김성철", org: "울산과학대학교", dept: "-", rank: "부총장", location: "교내", note: "" },
      { id: 3, type: "위원", name: "변홍석", org: "울산과학대학교", dept: "교무처", rank: "처장", location: "교내", note: "" },
      { id: 4, type: "위원", name: "김강연", org: "울산과학대학교", dept: "기획처", rank: "처장", location: "교내", note: "인사발령으로 인한 변경" },
      { id: 5, type: "위원", name: "이주영", org: "울산과학대학교", dept: "학생취업처", rank: "처장", location: "교내", note: "" },
      { id: 6, type: "위원", name: "박일현", org: "울산과학대학교", dept: "총무처", rank: "처장", location: "교내", note: "" },
      { id: 7, type: "위원", name: "송경영", org: "울산과학대학교", dept: "산학협력단(RISE)", rank: "단장", location: "교내", note: "" },
      { id: 8, type: "위원", name: "미지정", org: "울산과학대학교", dept: "직원노동조합", rank: "위원장", location: "교내", note: "" },
      { id: 9, type: "위원", name: "미지정", org: "울산과학대학교", dept: "총학생회", rank: "회장", location: "교내", note: "" },
      { id: 10, type: "위원", name: "정문호", org: "정테크", dept: "-", rank: "대표", location: "교외", note: "신규 추가" },
      { id: 11, type: "위원", name: "이경우", org: "울산발전연구원", dept: "경제산업연구실", rank: "실장", location: "교외", note: "신규 추가" },
      { id: 12, type: "간사", name: "고우근", org: "울산과학대학교", dept: "기획처", rank: "팀장", location: "교내", note: "" }
    ]
  },
  {
    id: "planning",
    name: "RISE기획위원회",
    fullName: "RISE기획위원회 (구. RISE사업추진위원회)",
    badge: "기획·실무조율",
    color: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    purpose: "대학/지자체 발전계획에 의거한 RISE사업계획서 작성 및 타당성 검토 / 사업계획서 및 사업결과보고서 운영 등",
    desc: "세부 추진전략 수립 및 프로그램 기획을 실무적으로 조율하는 위원회로, 대학발전계획 및 울산광역시 발전계획에 근거하여 사업계획의 적합성과 타당성을 검토합니다. 위원장은 RISE사업단장과 기획처장이 공동으로 맡습니다.",
    constitution: "RISE사업단장 및 내부위원 11인, 외부위원 4인을 포함한 15인 내외",
    cycle: "분기별 1회 개최 (실무 단계 상시 협의)",
    functions: [
      "대학발전계획 및 울산광역시 기본계획 연계성 타당성 검토",
      "RISE 사업계획서 기획·작성 및 결과보고서 운영 검토",
      "추진전략(S) 및 프로그램(PG) 실무 심의 및 조율",
      "참여 대학 및 외부 대학/기관과의 협력 연계 프로세스 설계"
    ],
    members: [
      { id: 1, type: "위원장", name: "김강연", org: "울산과학대학교", dept: "기획처", rank: "처장", location: "교내", note: "" },
      { id: 2, type: "위원장", name: "송경영", org: "울산과학대학교", dept: "RISE사업단", rank: "단장", location: "교내", note: "" },
      { id: 3, type: "위원", name: "김현수", org: "울산과학대학교", dept: "RISE사업단", rank: "본부장", location: "교내", note: "" },
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
      { id: 16, type: "간사", name: "심현미", org: "울산과학대학교", dept: "RISE사업단운영팀", rank: "팀장", location: "교내", note: "" }
    ]
  },
  {
    id: "eval",
    name: "RISE사업자체평가위원회",
    fullName: "RISE사업자체평가위원회 (상임)",
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
      { id: 10, type: "간사", name: "심현미", org: "울산과학대학교", dept: "RISE사업단운영팀", rank: "팀장", location: "교내", note: "" }
    ]
  },
  {
    id: "budget",
    name: "RISE사업비관리위원회",
    fullName: "RISE사업비관리위원회",
    badge: "재정투명성",
    color: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
    purpose: "사업비 집행 가이드라인에 따라 사업 예산 집행 모니터링 / 집행률 점검 및 관리 / 사업비 조정 심의 등",
    desc: "사업 예산 집행의 규정 준수 여부를 모니터링하고 집행률을 극대화하기 위해 재정 건전성을 상시 관리·심의하는 특별 재정 관리 기구입니다.",
    constitution: "RISE사업단장을 포함하여 7인 내외 (내부 6인, 외부 1인)",
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
      { id: 4, type: "위원", name: "송경영", org: "울산과학대학교", dept: "RISE사업단", rank: "단장", location: "교내", note: "" },
      { id: 5, type: "위원", name: "김현수", org: "울산과학대학교", dept: "RISE사업단", rank: "본부장", location: "교내", note: "" },
      { id: 6, type: "위원", name: "고우근", org: "울산과학대학교", dept: "기획팀", rank: "팀장", location: "교내", note: "" },
      { id: 7, type: "위원", name: "강신욱", org: "인택스세무법인", dept: "세무팀", rank: "부대표", location: "교외", note: "" },
      { id: 8, type: "간사", name: "심현미", org: "울산과학대학교", dept: "RISE사업단운영팀", rank: "팀장", location: "교내", note: "" }
    ]
  },
  {
    id: "advisory",
    name: "RISE사업자문회의",
    fullName: "RISE사업자문회의",
    badge: "외부전문가자문",
    color: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    purpose: "RISE 사업 정책 방향 및 지역 정주형 인재 양성을 위한 다변화 정책 자문",
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
      { id: 8, type: "간사", name: "심현미", org: "울산과학대학교", dept: "RISE사업단운영팀", rank: "팀장", location: "교내", note: "" }
    ]
  }
];

export default function ScheduleManager({
  currentRole,
  selectedYear,
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

  // 위원회 관리 상태 정의
  const [selectedCommitteeId, setSelectedCommitteeId] = useState("total"); // 선택된 위원회 ID ("total", "planning" 등)
  const [activeCommitteeDetailTab, setActiveCommitteeDetailTab] = useState("members"); // 위원회 세부 정보 탭 ("members": 명단, "purpose": 목적/기능)

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
  const [activeMeetingCat, setActiveMeetingCat] = useState("operating");

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
    // 언론보도용
    pressDate: "2026-07-15",
    pressTime: "10:00",
    pressMedia: "",
    pressUrl: "",
    pressType: "방송",
    pressContent: ""
  });

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
  }, [pressReleases, selectedPressType, activePressId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

      // 의제 목록을 줄바꿈으로 묶어서 저장
      const combinedAgenda = (formData.agendaList || []).filter(Boolean).join("\n");

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
                result: formData.result || "-"
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
          result: formData.result || "-"
        };
        setMeetingSchedules([newItem, ...meetingSchedules]);
      }
    } else if (modalType === "press") {
      const combinedDatetime = `${formData.pressDate}T${formData.pressTime}:00+09:00`;

      if (isEditMode) {
        setPressReleases(pressReleases.map(p => 
          p.id === editingItemId
            ? {
                ...p,
                year: selectedYear,
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
          year: selectedYear,
          type: formData.pressType,
          media: formData.pressMedia || "미상",
          title: formData.title || "새 보도자료",
          broadcastDate: combinedDatetime,
          contentUrl: formData.pressUrl || "",
          pressContent: formData.pressContent || ""
        };
        setPressReleases([newItem, ...pressReleases]);
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
    if (window.confirm("선택한 회의록을 삭제하시겠습니까?")) {
      setMeetingSchedules(meetingSchedules.filter(m => m.id !== id));
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
      department: "ECC센터",
      datetime: "",
      eventDate: defaultEventDate,
      eventStartTime: "10:00",
      eventEndTime: "11:00",
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
      // 언론보도용 추가
      pressDate: defaultEventDate,
      pressTime: "10:00",
      pressMedia: "",
      pressUrl: "",
      pressType: "방송"
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
                    style={{ background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", padding: "0.25rem", cursor: "pointer" }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setCurrentMonth(currentMonth === 7 ? 8 : 7)}
                    style={{ background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", padding: "0.25rem", cursor: "pointer" }}
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
                    
                    let cardBg = "rgba(255,255,255,0.02)";
                    let cardBorder = "1px solid rgba(255,255,255,0.05)";
                    if (isDeadline) {
                      cardBg = "rgba(239, 68, 68, 0.03)";
                      cardBorder = "1px solid rgba(239, 68, 68, 0.15)";
                    } else if (isTask) {
                      cardBg = "rgba(139, 92, 246, 0.03)";
                      cardBorder = "1px solid rgba(139, 92, 246, 0.15)";
                    }

                    return (
                      <div 
                        key={sched.id} 
                        style={{
                          padding: "0.75rem", borderRadius: "6px",
                          background: cardBg,
                          border: cardBorder,
                          position: "relative",
                          opacity: isCompleted ? 0.6 : 1
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", flex: 1 }}>
                            {(isTask || isDeadline) && (
                              <input 
                                type="checkbox" 
                                checked={isCompleted} 
                                onChange={() => handleToggleTaskCompleted(sched.id)}
                                style={{ marginTop: "0.2rem", cursor: "pointer", width: "15px", height: "15px", accentColor: isDeadline ? "#EF4444" : "#8B5CF6" }}
                              />
                            )}
                            <strong style={{ 
                              fontSize: "0.9rem", 
                              color: "var(--text-primary)", 
                              display: "block", 
                              marginBottom: "0.25rem",
                              textDecoration: isCompleted ? "line-through" : "none"
                            }}>
                              {sched.title}
                            </strong>
                          </div>
                          {currentRole.id !== "GUEST" && (
                            <div style={{ display: "flex", gap: "0.25rem" }}>
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
                {m === 3 ? "'26.3월" : m === 1 ? "'27.1월" : `${m}월`}
              </button>
            ))}
          </div>

          {/* 행사 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {eventSchedules.filter(e => e.month === selectedEventMonth).length > 0 ? (
              eventSchedules.filter(e => e.month === selectedEventMonth).map(event => (
                <div 
                  key={event.id}
                  className="card"
                  style={{ padding: "1.5rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA", fontWeight: "700" }}>
                      소속부서: {event.department}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", marginRight: "0.5rem" }}>
                        <Clock size={14} />
                        {event.datetime}
                      </span>
                      {currentRole.id !== "GUEST" && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>

                  <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    {event.title}
                  </h4>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      <div>
                        <span style={{ color: "var(--text-secondary)", display: "block" }}>📍 행사 장소</span>
                        <strong>{event.location}</strong>
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <div>
                          <span style={{ color: "var(--text-secondary)", display: "block" }}>👥 참석자 (내부)</span>
                          <span>{event.attendeesInternal}</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-secondary)", display: "block" }}>👥 참석자 (외부)</span>
                          <span>{event.attendeesExternal}</span>
                        </div>
                      </div>

                      <div>
                        <span style={{ color: "var(--text-secondary)", display: "block" }}>🔗 연계 프로그램</span>
                        <span>{event.program}</span>
                      </div>
                      
                      <div>
                        <span style={{ color: "var(--text-secondary)", display: "block" }}>🎯 행사 목적</span>
                        <p style={{ margin: "0.1rem 0 0 0", lineHeight: "1.3" }}>{event.purpose}</p>
                      </div>
                    </div>

                    <div style={{ background: "rgba(52, 211, 153, 0.05)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(52, 211, 153, 0.1)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ color: "#34D399", fontWeight: "700", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <CheckCircle size={14} />
                        행사 결과 보고
                      </span>
                      <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: "1.4" }}>{event.result}</p>
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
                🏛️ RISE 사업단 의사결정 거버넌스 (위원회 관리)
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                울산과학대학교 RISE(앵커) 사업의 성공을 위한 최고 의사결정 기구 및 핵심 실무/평가 위원회 종합 현황
              </p>
            </div>
          </div>

          {/* 메인 레이아웃: 좌측 목록 + 우측 상세 */}
          <div style={{ display: "grid", gridTemplateColumns: "2.5fr 3.5fr", gap: "1.5rem" }}>
            
            {/* 좌측: 5대 위원회 카드 목록 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {COMMITTEES_DATA.map((comm) => {
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

            {/* 우측: 선택된 위원회 상세 정보 */}
            {(() => {
              const activeComm = COMMITTEES_DATA.find(c => c.id === selectedCommitteeId) || COMMITTEES_DATA[0];
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
                      👥 위원 명단 (추후 입력)
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
                        <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-secondary-dark)", lineHeight: "1.5" }}>
                          본 위원회의 명단 정보는 추후 구성 완료 시 시스템에 직접 입력될 예정입니다.<br />
                          관련 권한을 가진 관리자 또는 사업단 총괄 책임자가 추후 업데이트할 수 있습니다.
                        </p>
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

          {/* 월별 선택 가로바 */}
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.02)", padding: "0.4rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMeetingMonth(m)}
                style={{
                  padding: "0.3rem 0.8rem", borderRadius: "4px", border: "none",
                  background: selectedMeetingMonth === m ? "var(--accent-color)" : "transparent",
                  color: selectedMeetingMonth === m ? "white" : "var(--text-secondary)",
                  fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", transition: "all 0.15s ease"
                }}
              >
                {m === 3 ? "'26.3월" : m === 1 ? "'27.1월" : `${m}월`}
              </button>
            ))}
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
              센터별 회의
            </button>
            <button
              onClick={() => setActiveMeetingCat("committee")}
              style={{
                background: "transparent", border: "none", fontSize: "0.875rem", fontWeight: "800", cursor: "pointer", padding: "0.5rem 1rem",
                color: activeMeetingCat === "committee" ? "var(--accent-color)" : "var(--text-secondary)",
                borderBottom: activeMeetingCat === "committee" ? "2px solid var(--accent-color)" : "none"
              }}
            >
              각종 위원회 회의
            </button>
          </div>

          {/* 회의 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {meetingSchedules.filter(m => m.month === selectedMeetingMonth && m.category === activeMeetingCat).length > 0 ? (
              meetingSchedules.filter(m => m.month === selectedMeetingMonth && m.category === activeMeetingCat).map(meeting => (
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
                            <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA", fontWeight: "700" }}>
                              소속부서: {isCustomFormatted ? dept : "사업운영팀"}
                            </span>
                            <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(16, 185, 129, 0.15)", color: "#34D399", fontWeight: "700" }}>
                              작성자: {isCustomFormatted ? writer : "박지현 팀장"}
                            </span>
                          </div>
                          
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", marginRight: "0.5rem" }}>
                              <Clock size={14} />
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
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", margin: "0.1rem 0 0 0" }}>
                                {meeting.agenda && meeting.agenda.split("\n").filter(Boolean).map((agendaItem, idx) => (
                                  <span key={idx} style={{ display: "block", lineHeight: "1.3" }}>
                                    • {agendaItem}
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
                            <div style={{ background: "rgba(59, 130, 246, 0.05)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.1)", display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
                              <span style={{ color: "#60A5FA", fontWeight: "700", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <CheckCircle size={14} />
                                회의 결정 결과
                              </span>
                              <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>{meeting.result}</p>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => alert("🎙️ PLAUD 음성 녹음 및 AI 회의록 자동 요약 기능 연동 데모\n\n향후 PLAUD 디바이스 및 API와 실시간 동기화하여, 회의 음성 녹음본이 업로드되면 AI가 발화자별 텍스트 변환(STT) 및 핵심 결정을 자동으로 요약하여 이 회의록에 자동으로 채워주는 스마트 기능이 활성화될 예정입니다.")}
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem",
                                padding: "0.35rem", borderRadius: "6px", background: "rgba(139, 92, 246, 0.15)",
                                border: "1px solid rgba(139, 92, 246, 0.3)", color: "#C084FC", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer"
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
                <span>{selectedMeetingMonth}월에 분류된 회의 일정이 없습니다.<br />[회의 일정 등록] 버튼을 눌러 회의록 틀을 보충해 보세요.</span>
              </div>
            )}
          </div>

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
              {pressReleases.filter(p => selectedPressType === "all" || p.type === selectedPressType).length > 0 ? (
                pressReleases
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
                            <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", fontWeight: "700" }}>
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
                        
                        <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "800", color: isActive ? "white" : "var(--text-primary)", lineHeight: "1.4", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
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

      {/* 4. 등록 모달 팝업 */}
      {isAddModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div className="card" style={{ width: "600px", maxHeight: "85vh", overflowY: "auto", padding: "1.5rem", borderRadius: "12px", background: "var(--panel-bg)", border: "1px solid var(--border-color)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
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

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* 마감일 입력 */}
              {modalType === "deadline" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>마감일 내용</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 RISE 최종 계획서 마감" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>마감 기한 (일자)</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
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
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: formData.noTime ? "rgba(255,255,255,0.2)" : "white", cursor: formData.noTime ? "not-allowed" : "text", opacity: formData.noTime ? 0.5 : 1, colorScheme: "dark" }} 
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
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 결과 보고서 작성 및 결재 요청" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 부서</label>
                    <select name="dept" value={formData.dept} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                      {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>할일 일자</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
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
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: formData.noTime ? "rgba(255,255,255,0.2)" : "white", cursor: formData.noTime ? "not-allowed" : "text", opacity: formData.noTime ? 0.5 : 1, colorScheme: "dark" }} 
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
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 2차년도 1차 보고서 제출 마감" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>일정 유형</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        {["행사", "회의", "위원회", "기타"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 부서</label>
                      <select name="dept" value={formData.dept} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작일시 (일자)</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료일시 (일자)</label>
                      <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 대학 본부 대회의실" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                </>
              )}

              {/* 행사 일정 입력 */}
              {modalType === "event" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: RISE 지산학 공동 취업 박람회" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>담당 부서(센터)</label>
                      <select name="department" value={formData.department} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        {["ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "사업운영팀"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 체육관 특설 돔" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>
                  
                  {/* 일자 및 시작/종료시간 개별 입력 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 일자</label>
                      <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input type="time" name="eventStartTime" value={formData.eventStartTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input type="time" name="eventEndTime" value={formData.eventEndTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>참석자 (내부 구분)</label>
                      <input type="text" name="attendeesInternal" value={formData.attendeesInternal} onChange={handleInputChange} placeholder="예: 내부 교수 및 연구원 15명" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>참석자 (외부 구분)</label>
                      <input type="text" name="attendeesExternal" value={formData.attendeesExternal} onChange={handleInputChange} placeholder="예: 지자체 관계자 5명" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 프로그램</label>
                    <input type="text" name="program" value={formData.program} onChange={handleInputChange} placeholder="예: 지역 정착 지원 프로그램" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 목적</label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="행사를 통해 도달하고자 하는 목표 기술" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>행사 결과</label>
                    <textarea name="result" value={formData.result} onChange={handleInputChange} placeholder="수료 인원, 산출된 최종 성과 및 보도 내역" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", resize: "none" }} />
                  </div>
                </>
              )}

              {/* 회의 일정 입력 */}
              {modalType === "meeting" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 명칭</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 제2차 ICC 센터 공동 운영 회의" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 대분류</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        <option value="operating">사업단 운영회의</option>
                        <option value="center">센터별 회의</option>
                        <option value="committee">각종 위원회 회의</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>장소</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="예: ICC 센터장실" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>

                  {/* 회의 일시 개별 입력 필드 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 0.9fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 일자</label>
                      <input type="date" name="meetingDate" value={formData.meetingDate} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>시작 시간</label>
                      <input type="time" name="meetingStartTime" value={formData.meetingStartTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>종료 시간</label>
                      <input type="time" name="meetingEndTime" value={formData.meetingEndTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                  </div>

                  {/* 관련 부서 및 작성자 드롭다운 배치 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련 부서</label>
                      <select name="dept" value={formData.dept} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        {["ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "사업운영팀"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>작성자</label>
                      <select name="writer" value={formData.writer} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
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

                  {/* 참석자 직접 입력 */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>참석자 (직접 입력)</label>
                    <input type="text" name="attendees" value={formData.attendees} onChange={handleInputChange} placeholder="예: 박지현 팀장, 이진우 PD, 김현주 실무 위원 (총 3명)" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>

                  {/* 주요의제 동적 리스트 추가/삭제 폼 */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>주요 의제 (한 줄에 하나의 의제)</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {formData.agendaList && formData.agendaList.map((agenda, index) => (
                        <div key={index} style={{ display: "flex", gap: "0.5rem" }}>
                          <input 
                            type="text" 
                            value={agenda} 
                            onChange={(e) => {
                              const newList = [...formData.agendaList];
                              newList[index] = e.target.value;
                              setFormData({ ...formData, agendaList: newList });
                            }}
                            placeholder={`의제 ${index + 1} (예: 2차년도 사업계획서 검토)`}
                            style={{ flex: 1, padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}
                          />
                          {formData.agendaList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newList = formData.agendaList.filter((_, idx) => idx !== index);
                                setFormData({ ...formData, agendaList: newList });
                              }}
                              style={{ padding: "0.5rem 0.75rem", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", color: "#F87171", cursor: "pointer", fontWeight: "700" }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, agendaList: [...formData.agendaList, ""] })}
                        style={{ marginTop: "0.25rem", padding: "0.35rem 0.8rem", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "6px", color: "#60A5FA", cursor: "pointer", fontSize: "0.75rem", display: "inline-flex", alignSelf: "flex-start", fontWeight: "700" }}
                      >
                        + 의제 추가
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>회의 결과</label>
                    <textarea name="result" value={formData.result} onChange={handleInputChange} placeholder="결정된 결의 사항 및 향후 조치 내역" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", resize: "none" }} />
                  </div>
                </>
              )}

              {/* 언론보도 일정 등록 */}
              {modalType === "press" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 구분</label>
                      <select name="pressType" value={formData.pressType} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }}>
                        <option value="방송">📺 방송</option>
                        <option value="신문">📰 신문</option>
                        <option value="기타">🌐 기타 (뉴미디어 등)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 매체</label>
                      <input type="text" name="pressMedia" value={formData.pressMedia} onChange={handleInputChange} required placeholder="예: 울산MBC, 경상일보, 블로그 등" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 제목</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 울산과학대학교, 지역 창업 연계 RISE 앵커사업 활성화 시동" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 일자</label>
                      <input type="date" name="pressDate" value={formData.pressDate} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도/방송 시간</label>
                      <input type="time" name="pressTime" value={formData.pressTime} onChange={handleInputChange} required style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", colorScheme: "dark" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도내용 (기사 상세 본문)</label>
                    <textarea name="pressContent" value={formData.pressContent || ""} onChange={handleInputChange} placeholder="기사 본문 또는 세부 보도 내용을 기술해 주세요." style={{ width: "100%", height: "100px", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", resize: "none" }} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>보도 내용 URL (유튜브 링크 또는 기사 링크)</label>
                    <input type="url" name="pressUrl" value={formData.pressUrl} onChange={handleInputChange} required placeholder="예: https://www.youtube.com/watch?v=... 또는 기사 원문 링크" style={{ width: "100%", padding: "0.5rem", background: "rgba(128,128,128,0.1)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)" }} />
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
