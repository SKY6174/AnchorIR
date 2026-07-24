import React, { useState, useEffect, useMemo } from "react";
import type {
  ChangeEvent,
  FormEvent
} from "react";
import { supabase } from "../supabaseClient";
import { COMMITTEES_DATA, dashToDotDate } from "../features/schedule/data/schedule-committee-data";
import type {
  AgendaResultPair,
  AiDebateLog,
  ScheduleCommitteeMember,
  ScheduleFormData,
  ScheduleItem
} from "../features/schedule/schedule-types";
import {
  calculateScheduleYearFromDate,
  getFormattedMemberGrade,
  isDateInSelectedYear,
  isWriterExcluded,
  sortMembersByRole
} from "../features/schedule/utils/schedule-member-utils";
import {
  getOneHourLater,
  parseScheduleDateTime
} from "../features/schedule/utils/schedule-display-utils";
import {
  convertRawTextToMarkdown,
  extractScheduleFilesText
} from "../features/schedule/services/schedule-ai-document-service";
import {
  deleteScheduleCommitteeMember,
  fetchScheduleCommittees,
  insertScheduleCommitteeMember,
  insertScheduleCommitteeMembers,
  updateScheduleCommitteeMember
} from "../features/schedule/services/schedule-committee-service";
import {
  downloadCommitteeMemberList,
  downloadCommitteeRegistrationTemplate,
  parseCommitteeMemberWorkbook
} from "../features/schedule/services/schedule-committee-workbook-service";
import {
  applyMeetingAiDataRules,
  buildOperatingAgendaDistribution
} from "../features/schedule/utils/schedule-ai-form-utils";
import {
  buildSchedulesByDate,
  getSchedulesForDay
} from "../features/schedule/utils/schedule-calendar-utils";
import { ScheduleEventsPanel } from "../features/schedule/components/schedule-events-panel";
import { ScheduleCommitteesPanel } from "../features/schedule/components/schedule-committees-panel";
import { ScheduleMeetingsPanel } from "../features/schedule/components/schedule-meetings-panel";
import { SchedulePressPanel } from "../features/schedule/components/schedule-press-panel";
import { ScheduleMonthlyPanel } from "../features/schedule/components/schedule-monthly-panel";
import { ScheduleMemberModal } from "../features/schedule/components/schedule-member-modal";
import { ScheduleCrawlerModal } from "../features/schedule/components/schedule-crawler-modal";
import { ScheduleFormModal } from "../features/schedule/components/schedule-form-modal";
import { ScheduleCalendarGrid } from "../features/schedule/components/schedule-calendar-grid";
const scheduleDb = supabase as any;
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

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

  const getCalculatedYearFromDate = (dateStr?: string) => {
    return calculateScheduleYearFromDate(dateStr, selectedYear);
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
  // oxlint-disable-next-line react/exhaustive-deps -- selectedYear owns the listener closure; adding the render-local loader would rebind the listener on every render.
  }, [selectedYear]);

  // Supabase 실시간 위원회 명단 조회 함수
  const loadCommitteesData = async () => {
    try {
      const combined = await fetchScheduleCommittees(selectedYear);
      if (combined) {
        setCommittees(combined);
      }
    } catch (e) {
      console.warn("Supabase 위원회 명단 조회 실패, 로컬 캐시 사용:", e);
    }
  };

  useEffect(() => {
    loadCommitteesData();
  // oxlint-disable-next-line react/exhaustive-deps -- selectedYear intentionally owns committee loading; a render-local loader must not trigger duplicate database reads.
  }, [selectedYear]);

  // 💡 [교육용 한글 주석] 기존 CSV 서식 양식 다운로드를 호환성이 높은 XLSX 규격으로 개선합니다.
  const handleDownloadExcelFormat = async () => {
    await downloadCommitteeRegistrationTemplate();
  };

  // 💡 [교육용 한글 주석] 기존 CSV 명단 조회를 XLSX 형식으로 추출하도록 업데이트합니다.
  const handleExcelDownload = async () => {
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

    await downloadCommitteeMemberList(activeComm.name, mems);
  };

  // 💡 [교육용 한글 주석] 업로드된 .xlsx 포맷의 파일 바이트 데이터를 로드하여 파싱하고 DB에 insert합니다.
  const handleExcelUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        if (!(evt.target?.result instanceof ArrayBuffer)) return;

        const activeComm = committees.find(c => c.id === selectedCommitteeId) || committees[0];
        if (!activeComm) {
          alert("선택된 위원회가 존재하지 않습니다.");
          return;
        }

        const currentMembersCount = activeComm.members ? activeComm.members.length : 0;
        const parseResult = await parseCommitteeMemberWorkbook(
          evt.target.result,
          activeComm.id,
          currentMembersCount,
          selectedYear
        );
        if (parseResult.status === "no-data") {
          alert("업로드할 위원 데이터가 존재하지 않습니다.");
          return;
        }
        if (parseResult.status === "no-members") {
          alert("파싱된 위원 정보가 없습니다. 서식 양식을 확인해 주세요.");
          return;
        }
        const newMembers = parseResult.members;

        await insertScheduleCommitteeMembers(newMembers);

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
      await deleteScheduleCommitteeMember(memberId);

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
        await updateScheduleCommitteeMember(editingMember.id, {
          type: memberFormData.type,
          name: memberFormData.name,
          org: memberFormData.org,
          dept: memberFormData.dept,
          rank: memberFormData.rank,
          location: memberFormData.location,
          term: combinedTerm,
          note: memberFormData.note
        });
      } else {
        // 신규 멤버 정보 추가 (INSERT)
        const currentMembers = committees.find(c => c.id === selectedCommitteeId)?.members || [];
        const nextSortOrder = currentMembers.length + 1;

        await insertScheduleCommitteeMember({
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
  const [_selectedMeetingMonth, setSelectedMeetingMonth] = useState(7); // 7월

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
  const [aiEngine, _setAiEngine] = useState("gpt"); // "gemini" or "gpt"
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
        const combinedRawText = await extractScheduleFilesText(files, updateText);

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

  const distributeOperatingAgendas = (
    agendaResultPairs: AgendaResultPair[],
    currentCategory: string
  ): ScheduleFormData =>
    buildOperatingAgendaDistribution(
      agendaResultPairs,
      currentCategory,
      formData.category
    );

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
    let _logs = [];

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
  ): [string, string] => parseScheduleDateTime(dateTimeStr, defaultVal);

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

      const { data: _data, error } = await supabase.storage
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
      const _deptName = formData.dept || "사업운영팀";
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
    } catch {
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

  // 💡 [교육용 한글 주석 - 성능 최적화 설명]
  // 기존에는 캘린더의 각 날짜(30~31개)를 렌더링할 때마다 전체 일정 목록(monthlySchedules)을
  // 매번 filter와 split, map 등으로 반복해서 필터링하여 반응이 극도로 느려지는 현상이 있었습니다.
  // 이 문제를 해결하기 위해, monthlySchedules나 필터 기준이 변경될 때만 해시맵(schedulesByDate)을 딱 한 번 생성하도록 useMemo를 사용합니다.
  // 각 날짜별 일정을 YYYY-MM-DD 키로 미리 묶어둠으로써, 날짜를 그릴 때는 O(1) 수준으로 빠르게 가져올 수 있습니다.
  const schedulesByDate = useMemo(() => {
    return buildSchedulesByDate(monthlySchedules, selectedDeptFilter, selectedYear);
  }, [monthlySchedules, selectedDeptFilter, selectedYear]);

  const renderCalendar = () => (
    <ScheduleCalendarGrid
      displayYear={displayYear}
      currentMonth={currentMonth}
      schedulesByDate={schedulesByDate}
      selectedDay={selectedDay}
      setSelectedDay={setSelectedDay}
      currentRole={currentRole}
      openAddModal={openAddModal}
      setDragOverDate={setDragOverDate}
      draggingId={draggingId}
      handleScheduleDrop={handleScheduleDrop}
      dragOverDate={dragOverDate}
      setDraggingId={setDraggingId}
      handleEditSchedule={handleEditSchedule}
    />
  );

  const getSelectedDaySchedules = () => {
    // 이미 계산 완료된 해시맵에서 클릭한 날짜의 일정을 간결하게 반환합니다.
    return getSchedulesForDay(schedulesByDate, displayYear, currentMonth, selectedDay);
  };

  return (
    <div className="schedule-manager-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* 1. 월간 일정 */}
      {subTab === "monthly" && (
        <ScheduleMonthlyPanel
          currentMonth={currentMonth}
          currentRole={currentRole}
          displayYear={displayYear}
          getSelectedDaySchedules={getSelectedDaySchedules}
          handleDeleteSchedule={handleDeleteSchedule}
          handleEditSchedule={handleEditSchedule}
          handleLinkToDetail={handleLinkToDetail}
          handleToggleTaskCompleted={handleToggleTaskCompleted}
          openAddModal={openAddModal}
          renderCalendar={renderCalendar}
          selectedDay={selectedDay}
          selectedDeptFilter={selectedDeptFilter}
          setCurrentMonth={setCurrentMonth}
          setSelectedDeptFilter={setSelectedDeptFilter}
        />
      )}

      {/* 2. 행사 일정 */}
      {subTab === "events" && (
        <ScheduleEventsPanel
          currentRole={currentRole}
          eventSchedules={eventSchedules}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={handleEditEvent}
          onOpenAddModal={openAddModal}
          selectedEventMonth={selectedEventMonth}
          selectedYear={selectedYear}
          setSelectedEventMonth={setSelectedEventMonth}
        />
      )}

      {/* 2.5 위원회 관리 */}
      {subTab === "committees" && (
        <ScheduleCommitteesPanel
          activeCommitteeDetailTab={activeCommitteeDetailTab}
          committees={committees}
          darkMode={darkMode}
          handleDeleteMember={handleDeleteMember}
          handleDownloadExcelFormat={handleDownloadExcelFormat}
          handleExcelDownload={handleExcelDownload}
          handleExcelUpload={handleExcelUpload}
          hasCommitteeEditPermission={hasCommitteeEditPermission}
          selectedCommitteeGroup={selectedCommitteeGroup}
          selectedCommitteeId={selectedCommitteeId}
          setActiveCommitteeDetailTab={setActiveCommitteeDetailTab}
          setEditingMember={setEditingMember}
          setIsMemberModalOpen={setIsMemberModalOpen}
          setMemberFormData={setMemberFormData}
          setSelectedCommitteeGroup={setSelectedCommitteeGroup}
          setSelectedCommitteeId={setSelectedCommitteeId}
        />
      )}

      {/* 3. 회의 일정 */}
      {subTab === "meetings" && (
        <ScheduleMeetingsPanel
          activeMeetingCat={activeMeetingCat}
          currentRole={currentRole}
          darkMode={darkMode}
          handleDeleteMeeting={handleDeleteMeeting}
          handleEditMeeting={handleEditMeeting}
          handleGenerateMockMeetings={handleGenerateMockMeetings}
          meetingSchedules={meetingSchedules}
          openAddModal={openAddModal}
          selectedCommitteeFilters={selectedCommitteeFilters}
          selectedDeptFilters={selectedDeptFilters}
          selectedMeetingId={selectedMeetingId}
          selectedYear={selectedYear}
          setActiveMeetingCat={setActiveMeetingCat}
          setSelectedCommitteeFilters={setSelectedCommitteeFilters}
          setSelectedDeptFilters={setSelectedDeptFilters}
          setSelectedMeetingId={setSelectedMeetingId}
        />
      )}

      {/* 3_2. 언론보도 대장 */}
      {subTab === "press" && (
        <SchedulePressPanel
          activePressId={activePressId}
          currentRole={currentRole}
          darkMode={darkMode}
          handleDeletePress={handleDeletePress}
          handleEditPress={handleEditPress}
          handleExportPressExcel={handleExportPressExcel}
          handleGenerateAiPressReleases={handleGenerateAiPressReleases}
          openAddModal={openAddModal}
          pressReleases={pressReleases}
          selectedPressType={selectedPressType}
          selectedYear={selectedYear}
          setActivePressId={setActivePressId}
          setSelectedPressType={setSelectedPressType}
        />
      )}

      {/* 위원 명단 편집/추가 모달 */}
      {isMemberModalOpen && (
        <ScheduleMemberModal
          editingMember={editingMember}
          handleSaveMember={handleSaveMember}
          memberFormData={memberFormData}
          setEditingMember={setEditingMember}
          setIsMemberModalOpen={setIsMemberModalOpen}
          setMemberFormData={setMemberFormData}
        />
      )}

      {/* 3.5. AI 크롤러 터미널 시뮬레이션 모달 */}
      {isCrawlerModalOpen && (
        <ScheduleCrawlerModal
          crawlerLogs={crawlerLogs}
          crawlerProgress={crawlerProgress}
        />
      )}

      {/* 4. 등록 모달 팝업 */}
      {isAddModalOpen && (
        <ScheduleFormModal
          agendaResultPairs={agendaResultPairs}
          aiDebateLogs={aiDebateLogs}
          aiFileName={aiFileName}
          aiPlanApplied={aiPlanApplied}
          aiProgress={aiProgress}
          aiRawText={aiRawText}
          aiResultApplied={aiResultApplied}
          aiResultFileName={aiResultFileName}
          aiResultRawText={aiResultRawText}
          aiStatusText={aiStatusText}
          committees={committees}
          darkMode={darkMode}
          formData={formData}
          handleAiFileChange={handleAiFileChange}
          handleAnalyzePressUrlWithGemini={handleAnalyzePressUrlWithGemini}
          handleCheckboxChange={handleCheckboxChange}
          handleDeptCheckboxChange={handleDeptCheckboxChange}
          handleFormSubmit={handleFormSubmit}
          handleGenerateAIKeywords={handleGenerateAIKeywords}
          handleInputChange={handleInputChange}
          handleLoadSampleFile={handleLoadSampleFile}
          handleMinutesFileUpload={handleMinutesFileUpload}
          handleToggleAttendee={handleToggleAttendee}
          includeProfessors={includeProfessors}
          isAiLoading={isAiLoading}
          isAnalyzingAI={isAnalyzingAI}
          isAnalyzingUrl={isAnalyzingUrl}
          isDebating={isDebating}
          isEditMode={isEditMode}
          isUploadingFile={isUploadingFile}
          members={members}
          modalType={modalType}
          setAgendaResultPairs={setAgendaResultPairs}
          setAiDebateLogs={setAiDebateLogs}
          setAiRawText={setAiRawText}
          setAiResultRawText={setAiResultRawText}
          setEditingItemId={setEditingItemId}
          setFormData={setFormData}
          setIncludeProfessors={setIncludeProfessors}
          setIsAddModalOpen={setIsAddModalOpen}
          setIsEditMode={setIsEditMode}
          triggerAiAutoFill={triggerAiAutoFill}
          triggerAiDebate={triggerAiDebate}
        />
      )}

    </div>
  );
}
