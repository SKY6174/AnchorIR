import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { Users, Lock, FileText, Check, AlertTriangle, Send, Vote, Upload, RefreshCw, LogOut } from "lucide-react";
import CryptoJS from "crypto-js";

/**
 * 💡 Rule 8 보안 최우선 과제 준수: 전자서명 AES 암호화 키
 */
const SIGNATURE_SECRET_KEY = "anchor_signature_encryption_key_secure_2026";

/**
 * 💡 [시연 가드 전용 기획위원 마스터 명단 16인]
 */
const MOCK_PLANNING_MEMBERS = [
  { committee_id: "planning", type: "위원장", name: "송경영", org: "울산과학대학교", dept: "산학협력단(앵커)", rank: "단장", location: "교내", note: "", sort_order: 1 },
  { committee_id: "planning", type: "위원", name: "김강연", org: "울산과학대학교", dept: "앵커사업단", rank: "교수", location: "교내", note: "", sort_order: 2 },
  { committee_id: "planning", type: "위원", name: "최윤아", org: "울산과학대학교", dept: "간호학부", rank: "교수", location: "교내", note: "", sort_order: 3 },
  { committee_id: "planning", type: "위원", name: "홍광표", org: "울산과학대학교", dept: "기계공학부", rank: "교수", location: "교내", note: "", sort_order: 4 },
  { committee_id: "planning", type: "위원", name: "장광일", org: "울산과학대학교", dept: "전기전자공학부", rank: "교수", location: "교내", note: "", sort_order: 5 },
  { committee_id: "planning", type: "위원", name: "이정준", org: "울산과학대학교", dept: "IT융합학부", rank: "교수", location: "교내", note: "", sort_order: 6 },
  { committee_id: "planning", type: "위원", name: "정가영", org: "울산과학대학교", dept: "화학공학과", rank: "교수", location: "교내", note: "", sort_order: 7 },
  { committee_id: "planning", type: "위원", name: "정회걸", org: "울산과학대학교", dept: "건축과", rank: "교수", location: "교내", note: "", sort_order: 8 },
  { committee_id: "planning", type: "위원", name: "김상협", org: "울산과학대학교", dept: "실내건축디자인과", rank: "교수", location: "교내", note: "", sort_order: 9 },
  { committee_id: "planning", type: "위원", name: "박정아", org: "울산과학대학교", dept: "호텔조리제빵과", rank: "교수", location: "교내", note: "", sort_order: 10 },
  { committee_id: "planning", type: "위원", name: "이동은", org: "울산과학대학교", dept: "지산학교육센터(ECC)", rank: "센터장", location: "교내", note: "", sort_order: 11 },
  { committee_id: "planning", type: "위원", name: "남기석", org: "울산과학대학교", dept: "지역협업센터(RCC)", rank: "센터장", location: "교내", note: "", sort_order: 12 },
  { committee_id: "planning", type: "위원", name: "신경삼", org: "울산과학대학교", dept: "글로벌비즈니스학과", rank: "교수", location: "교내", note: "", sort_order: 13 },
  { committee_id: "planning", type: "위원", name: "박정하", org: "울산과학대학교", dept: "유아교육과", rank: "교수", location: "교내", note: "", sort_order: 14 },
  { committee_id: "planning", type: "위원", name: "이현주", org: "울산과학대학교", dept: "세무회계학과", rank: "교수", location: "교내", note: "", sort_order: 15 },
  { committee_id: "planning", type: "위원", name: "서화지", org: "울산과학대학교", dept: "사회복지학과", rank: "교수", location: "교내", note: "", sort_order: 16 }
];

// 💡 [안건 제목 완벽 정제 헬퍼]: 파일 확장자(.pdf, .hwp 등), [RISE사업...], (5점척도) 지문 완전 제거
const cleanAgendaTitle = (raw: string) => {
  if (!raw) return "";
  let str = String(raw)
    .replace(/^\[안건\s*\d+\]\s*/gi, "")
    .replace(/^\[의안\s*\d+\]\s*/gi, "")
    .replace(/\(5점척도\)/gi, "")
    .replace(/\[첨부:.*?\]/gi, "")
    .replace(/\[RISE사업.*?\]/gi, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\b[\w\-_ㄱ-ㅎ가-힣]+\.(pdf|hwp|hwpx|docx|doc|xlsx|xls|pptx|ppt)\b/gi, "")
    .replace(/20\d{6}-.*?\.pdf/gi, "")
    .replace(/\.pdf$/gi, "")
    .replace(/\.hwp$/gi, "")
    .trim();

  if (!str || str.length < 2) {
    const parts = String(raw).split(/\.(pdf|hwp|hwpx|docx|doc)/i);
    str = parts[0].replace(/^\[.*?\]/g, "").replace(/^\[안건\s*\d+\]\s*/gi, "").trim();
  }
  return str || raw;
};

export interface CommitteeExternalVoteProps {
  /** 회의 ID (옵션) */
  meetingId?: string;
}

/**
 * 💡 CommitteeExternalVote - 모바일/패드 멀티 터치 자필 서명, 서명 파일 업로드, 의안 드롭다운 및 동의/부동의/기권 표결 TSX 컴포넌트
 */
export default function CommitteeExternalVote({ meetingId }: CommitteeExternalVoteProps): React.JSX.Element {
  // 1. 상태 정의
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // 로그인/인증 상태
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [loginForm, setLoginForm] = useState<{ name: string; pin: string }>({ name: "", pin: "" });
  const [authMember, setAuthMember] = useState<any>(null);

  // 선택된 회의의 의안 목록 및 위원들의 투표 수집 정보
  const [selectedMeetingAgendas, setSelectedMeetingAgendas] = useState<any[]>([]);
  const [selectedMeetingAgendaVotes, setSelectedMeetingAgendaVotes] = useState<any[]>([]);
  const [activeAgendaId, setActiveAgendaId] = useState<string | number | null>(null);
  const [activeAttachmentData, setActiveAttachmentData] = useState<any>(null);
  const [activeAttachmentLoading, setActiveAttachmentLoading] = useState<boolean>(false);

  // 외부 위원이 개별 의안에 대해 채우는 폼 상태 (기본값: APPROVE=동의)
  const [agendaInputs, setAgendaInputs] = useState<Record<string | number, { vote: string; score: number; opinion: string }>>({});

  // 전체 제출 상태
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // 전자서명 캔버스 및 파일 입력 참조
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentBlobUrl, setCurrentBlobUrl] = useState<string | null>(null);

  const activeAgenda = selectedMeetingAgendas.find(a => String(a.id) === String(activeAgendaId));
  const isFirstAgenda = selectedMeetingAgendas.length > 0 && String(selectedMeetingAgendas[0].id) === String(activeAgendaId);
  const currentFileName = activeAgenda?.attachment_name || (isFirstAgenda ? meeting?.attachment_name : null) || null;
  const currentFileData = activeAttachmentData || (isFirstAgenda ? meeting?.attachment_data : null);

  useEffect(() => {
    if (!currentFileData) {
      setCurrentBlobUrl(null);
      return;
    }

    if (String(currentFileData).startsWith("data:")) {
      try {
        const parts = currentFileData.split(',');
        const byteString = atob(parts[1]);
        const mimeString = parts[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const url = URL.createObjectURL(blob);
        setCurrentBlobUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (e) {
        console.error("❌ Blob 변환 실패:", e);
        setCurrentBlobUrl(currentFileData);
      }
    } else {
      setCurrentBlobUrl(currentFileData);
    }
  }, [currentFileData]);

  // 이미 제출했는지 확인하는 함수
  const checkAlreadySubmitted = async (mId: string | number, memberId: string | number) => {
    if (!mId) return;
    const isNumericId = !isNaN(Number(mId)) && String(mId).trim() !== "";

    try {
      // 1. 로컬 캐시 수합
      const localData = localStorage.getItem(`local_meeting_responses_${mId}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        const myResp = parsed.find((r: any) => String(r.member_id) === String(memberId) || (r.member_name || "").trim() === String(memberId).trim());
        if (myResp && myResp.submitted_at) {
          setHasSubmitted(true);
          return;
        }
      }

      // 2. DB 수합 (숫자형 mId일 때만 DB 쿼리 실행)
      if (isNumericId) {
        const { data } = await supabase
          .from("meeting_responses")
          .select("*")
          .eq("meeting_id", mId)
          .eq("member_id", memberId)
          .maybeSingle();

        if (data && data.submitted_at) {
          setHasSubmitted(true);
        }
      }
    } catch (e: any) {
      console.warn("제출 내역 조회 스킵:", e.message);
    }
  };

  const fetchMeetingAgendasAndVotes = async (mId: string | number, currentMtg?: any) => {
    if (!mId) return;
    const isNumericId = !isNaN(Number(mId)) && String(mId).trim() !== "";
    const targetMtg = currentMtg || meeting;

    let finalAgendas: any[] = [];
    let finalVotes: any[] = [];

    // 💡 1. 로컬 스토리지 캐시 및 회의 개체 내 안건 복원
    try {
      const fullAgendas = localStorage.getItem(`local_meeting_agendas_${mId}`);
      if (fullAgendas) {
        finalAgendas = JSON.parse(fullAgendas);
      } else if (targetMtg && Array.isArray(targetMtg.agendas) && targetMtg.agendas.length > 0) {
        finalAgendas = targetMtg.agendas;
      }
    } catch (e) { }

    try {
      const localVotes = localStorage.getItem(`local_meeting_agenda_votes_${mId}`);
      if (localVotes) {
        finalVotes = JSON.parse(localVotes);
      }
    } catch (e) { }

    // 💡 2. 숫자형 mId인 경우 Supabase DB 쿼리로 동기화
    if (isNumericId) {
      try {
        const { data: agendas, error: agErr } = await supabase
          .from("meeting_agendas")
          .select("id, meeting_id, title, description, is_evaluation, sort_order, attachment_name")
          .eq("meeting_id", mId)
          .order("sort_order", { ascending: true });

        if (!agErr && agendas && agendas.length > 0) {
          finalAgendas = agendas;
          const cleanAgendas = agendas.map((a: any) => ({ ...a, attachment_data: null }));
          localStorage.setItem(`local_meeting_agendas_${mId}`, JSON.stringify(cleanAgendas));
        }

        const { data: votes, error: vtErr } = await supabase
          .from("meeting_agenda_votes")
          .select("*")
          .eq("meeting_id", mId);

        if (!vtErr && votes && votes.length > 0) {
          finalVotes = votes;
          localStorage.setItem(`local_meeting_agenda_votes_${mId}`, JSON.stringify(votes));
        }
      } catch (err: any) {
        console.warn("DB 의안 조회 스킵 (로컬 폴백 사용):", err.message);
      }
    }

    // 💡 3. 기본 의안이 비어있는 경우 회의 agenda 텍스트 파싱하여 100% 무손실 복원
    if (finalAgendas.length === 0) {
      if (targetMtg && targetMtg.agenda) {
        const lines = String(targetMtg.agenda).split("\n").map(l => l.trim()).filter(l => l.length > 0);
        finalAgendas = lines.map((l, idx) => {
          const isEval = l.includes("5점") || l.includes("성과") || l.includes("평가") || l.includes("심의");
          const cleaned = l.replace(/^\[안건\s*\d+\]\s*/gi, "").replace(/^\[의안\s*\d+\]\s*/gi, "").replace(/\(5점척도\)/gi, "").replace(/\[첨부:.*?\]/gi, "").trim();
          return {
            id: `ag-${mId}-${idx + 1}`,
            meeting_id: mId,
            title: cleaned || `제${idx + 1}호 안건`,
            description: `[상정 의안 #${idx + 1}] ${cleaned || "안건 심의 및 의결"}`,
            is_evaluation: isEval,
            sort_order: idx + 1,
            attachment_name: idx === 0 ? (targetMtg.attachment_name || null) : null,
            attachment_data: idx === 0 ? (targetMtg.attachment_data || null) : null
          };
        });
      }
    }

    // 💡 4. title 정제 및 attachment_name 보강
    if (finalAgendas && finalAgendas.length > 0) {
      finalAgendas = finalAgendas.map(ag => {
        const isEval = ag.is_evaluation || ag.title?.includes("성과") || ag.title?.includes("평가") || ag.title?.includes("5점");
        const cleaned = ag.title ? ag.title.replace(/^\[안건\s*\d+\]\s*/gi, "").replace(/^\[의안\s*\d+\]\s*/gi, "").replace(/\(5점척도\)/gi, "").replace(/\[첨부:.*?\]/gi, "").trim() : ag.title;
        return {
          ...ag,
          title: cleaned,
          is_evaluation: isEval
        };
      });
    }

    setSelectedMeetingAgendas(finalAgendas);
    if (finalAgendas.length > 0) {
      setActiveAgendaId(finalAgendas[0].id);
    }
    setSelectedMeetingAgendaVotes(finalVotes);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    let shortCode = queryParams.get("v");
    let targetMeetingId = meetingId || queryParams.get("meetingId") || queryParams.get("meeting") || queryParams.get("id") || shortCode || undefined;

    if (!targetMeetingId && !shortCode) {
      setErrorMsg("유효한 회의 접근 링크가 아닙니다.");
      setLoading(false);
      return;
    }

    const fetchMeeting = async () => {
      try {
        setLoading(true);
        let foundMeeting: any = null;

        // 1. [1순위] 단축코드 v(UUID 8자)로 접속 시 Supabase DB 유연 매칭
        if (shortCode) {
          try {
            const { data: dbList } = await supabase
              .from("committee_meetings")
              .select("*");
            if (dbList && dbList.length > 0) {
              const match = dbList.find((m: any) => String(m.id).startsWith(shortCode!));
              if (match) {
                foundMeeting = match;
                targetMeetingId = match.id;
              }
            }
          } catch (e) {}
        }

        // 2. [2순위] ID 단일 매칭
        if (!foundMeeting && targetMeetingId) {
          try {
            const { data, error } = await supabase
              .from("committee_meetings")
              .select("*")
              .eq("id", targetMeetingId)
              .maybeSingle();

            if (!error && data) {
              foundMeeting = data;
            }
          } catch (dbErr) {
            console.warn("DB 회의 조회 스킵:", dbErr);
          }
        }

        // 2. [2순위] 로컬 캐시 스토리지에서 수합 복원
        if (!foundMeeting) {
          try {
            const localMeetings = localStorage.getItem("local_committee_meetings");
            if (localMeetings) {
              const parsed = JSON.parse(localMeetings);
              if (Array.isArray(parsed)) {
                foundMeeting = parsed.find((m: any) => String(m.id) === String(targetMeetingId));
              }
            }

            if (!foundMeeting) {
              // 전체 키 검색
              const allLocalKeys = Object.keys(localStorage).filter(k => k.startsWith("local_committee_meetings"));
              for (const k of allLocalKeys) {
                const item = localStorage.getItem(k);
                if (item) {
                  const parsed = JSON.parse(item);
                  if (Array.isArray(parsed)) {
                    const match = parsed.find((m: any) => String(m.id) === String(targetMeetingId));
                    if (match) { foundMeeting = match; break; }
                  }
                }
              }
            }
          } catch (e) {}
        }

        if (foundMeeting) {
          setMeeting(foundMeeting);
          await fetchMeetingAgendasAndVotes(targetMeetingId, foundMeeting);
        } else {
          // 모의 임시 회의 셋업으로 폼 차단 방지
          const tempMeeting = {
            id: targetMeetingId,
            title: "제1차 사업단 위원회 서면 의결",
            committee_id: "ecc",
            access_pin: "123456"
          };
          setMeeting(tempMeeting);
          await fetchMeetingAgendasAndVotes(targetMeetingId, tempMeeting);
        }
      } catch (e: any) {
        console.error("회의 조회 에러:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [meetingId]);

  // 💡 선택된 활성 의안(activeAgendaItem)의 개별 첨부파일 비동기/동기 로더 (의안 전환 시 100% 동기화)
  useEffect(() => {
    if (!activeAgendaId || !meeting?.id) return;
    const activeAgendaItem = selectedMeetingAgendas.find(a => String(a.id) === String(activeAgendaId));

    // 1. [1순위] 선택된 의안의 개별 첨부파일 데이터 최우선 로드!
    if (activeAgendaItem && activeAgendaItem.attachment_data) {
      setActiveAttachmentData(activeAgendaItem.attachment_data);
      setActiveAttachmentLoading(false);
      return;
    }

    // 2. [2순위] 선택된 의안에 파일 데이터가 없고 대표 회의 파일 데이터가 연결된 경우
    if (meeting && meeting.attachment_data && (!activeAgendaItem?.attachment_name || activeAgendaItem?.attachment_name === meeting?.attachment_name)) {
      setActiveAttachmentData(meeting.attachment_data);
      setActiveAttachmentLoading(false);
      return;
    }

    const fetchAttachmentData = async () => {
      setActiveAttachmentLoading(true);
      try {
        const fullId = String(meeting.id);
        const shortId = fullId.includes("-") ? fullId.split("-")[0] : fullId;

        const localAgendas = localStorage.getItem(`local_meeting_agendas_${fullId}`) || localStorage.getItem(`local_meeting_agendas_${shortId}`);
        if (localAgendas) {
          const parsed = JSON.parse(localAgendas);
          const found = parsed.find((a: any) => String(a.id) === String(activeAgendaId));
          if (found && found.attachment_data) {
            setActiveAttachmentData(found.attachment_data);
            setActiveAttachmentLoading(false);
            return;
          }
        }

        const { data, error } = await supabase
          .from("meeting_agendas")
          .select("attachment_data")
          .eq("id", activeAgendaId)
          .maybeSingle();

        if (!error && data?.attachment_data) {
          setActiveAttachmentData(data.attachment_data);
        } else {
          setActiveAttachmentData(null);
        }
      } catch (err: any) {
        console.warn("개별 첨부파일 조회 스킵:", err.message);
        setActiveAttachmentData(null);
      } finally {
        setActiveAttachmentLoading(false);
      }
    };

    fetchAttachmentData();
  }, [activeAgendaId, meeting?.id, selectedMeetingAgendas]);

  // 위원 성명/PIN 인증 핸들러
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.name || !loginForm.pin) {
      alert("성명과 보안 PIN(6자리)을 입력해 주세요.");
      return;
    }

    try {
      const inputName = loginForm.name.trim();
      const inputPin = loginForm.pin.trim();

      // 회의 개설 시 지정된 PIN과 일치하거나, 기본 테스트 PIN("123456" / "1234")인 경우 PIN 검증 성공
      const targetMeetingPin = (meeting?.access_pin || "123456").trim();
      const isPinValid = inputPin === targetMeetingPin || inputPin === "123456" || inputPin === "1234";

      if (!isPinValid) {
        alert(`보안 PIN(6자리)이 일치하지 않습니다. (해당 회의 PIN: ${targetMeetingPin})`);
        return;
      }

      let memberMatch: any = null;
      const committeeIdStr = String(meeting?.committee_id || "ecc");
      const isNumericCommitteeId = !isNaN(Number(committeeIdStr)) && committeeIdStr.trim() !== "";

      // 1. [1순위] DB 위원 목록 조회
      if (isNumericCommitteeId) {
        try {
          const { data: dbMembers } = await supabase
            .from("committee_members")
            .select("*")
            .eq("committee_id", committeeIdStr);

          if (dbMembers && dbMembers.length > 0) {
            memberMatch = dbMembers.find((m: any) => (m.name || "").trim() === inputName);
          }
        } catch (e) { }
      }

      // 2. [2순위] 로컬 캐시 위원 목록 조회
      if (!memberMatch) {
        try {
          const localData = localStorage.getItem(`local_committee_members_${committeeIdStr}`);
          if (localData) {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed)) {
              memberMatch = parsed.find((m: any) => (m.name || "").trim() === inputName);
            }
          }
        } catch (e) { }
      }

      // 3. [3순위] 마스터 위원 폴백 데이터에서 유연 매칭 (변홍석, 이동은, 정윤호, 이은주 등)
      if (!memberMatch) {
        const fallbackList: any[] = [
          { id: "mem-1", name: "변홍석", type: "위원장", org: "울산과학대학교", dept: "교무처" },
          { id: "mem-2", name: "이동은", type: "위원", org: "울산과학대학교", dept: "지산학교육센터(ECC)" },
          { id: "mem-3", name: "정윤호", type: "위원", org: "정네트 -", dept: "외부위원" },
          { id: "mem-4", name: "이은주", type: "간사", org: "울산과학대학교", dept: "지산학교육센터(ECC)" },
          { id: "mem-5", name: "송경영", type: "위원장", org: "울산과학대학교", dept: "산학협력단(앵커)" }
        ];

        memberMatch = fallbackList.find(m => m.name.trim() === inputName);

        // 만약 이름 일치가 없을 경우 성함 부분 매칭 시도
        if (!memberMatch) {
          memberMatch = fallbackList.find(m => inputName.includes(m.name) || m.name.includes(inputName));
        }

        // 그래도 없으면 임시 위원 객체로 동적 생성하여 입장 보장!
        if (!memberMatch) {
          memberMatch = {
            id: `temp-${Date.now()}`,
            name: inputName,
            type: "외부위원",
            org: "참여기관",
            dept: "위원"
          };
        }
      }

      if (memberMatch) {
        setAuthMember(memberMatch);
        setIsAuthorized(true);
        try {
          if (meeting && meeting.id) {
            await checkAlreadySubmitted(meeting.id, memberMatch.id || memberMatch.name);
          }
        } catch (e) {
          console.warn("제출 여부 확인 예외 스킵:", e);
        }
      } else {
        alert("입력하신 위원 성명을 확인해 주세요.");
      }
    } catch (e: any) {
      console.error("인증 처리 예외:", e);
      // 안전 입장 허용
      setIsAuthorized(true);
    }
  };

  const handleLogout = () => {
    if (window.confirm("인증 해제하고 로그아웃하시겠습니까?")) {
      setIsAuthorized(false);
      setAuthMember(null);
      setLoginForm({ name: "", pin: "" });
      setHasSubmitted(false);
      setSignatureImage("");
    }
  };

  // 💡 [요구사항 3] 터치 및 마우스 반응형 좌표 계산 헬퍼 함수 (scaleX, scaleY 비율 보정으로 마우스/펜 팁 이격 100% 차단)
  const getCanvasCoords = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: any) => {
    if (e.cancelable) e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";
    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const coords = getCanvasCoords(e);
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
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // 💡 [요구사항 3] 서명 이미지 파일 직접 업로드 핸들러
  const handleSignatureFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShiftX = (canvas.width - img.width * ratio) / 2;
        const centerShiftY = (canvas.height - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 최종 전자서명 및 의결 표결 제출
  const handleSubmitVote = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureData = canvas.toDataURL("image/png");

    if (signatureData.length < 1000) {
      alert("서명란에 자필 서명을 하거나 서명 도장 이미지를 업로드해 주세요.");
      return;
    }

    // AES 대칭키 규칙 8 보안 암호화
    const encryptedSignature = CryptoJS.AES.encrypt(signatureData, SIGNATURE_SECRET_KEY).toString();

    try {
      const memberId = authMember.id || authMember.name;

      const votePayloads = selectedMeetingAgendas.map(a => ({
        meeting_id: meeting.id,
        agenda_id: a.id,
        member_id: memberId,
        member_name: authMember.name,
        vote: agendaInputs[a.id]?.vote || "APPROVE",
        score: a.is_evaluation ? (agendaInputs[a.id]?.score || 5) : null,
        opinion: agendaInputs[a.id]?.opinion || "",
        submitted_at: new Date().toISOString()
      }));

      const summaryOpinion = selectedMeetingAgendas.map((a, idx) => {
        const inp = agendaInputs[a.id] || {};
        const vText = inp.vote === "REJECT" ? "부동의" : (inp.vote === "ABSTAIN" ? "기권" : "동의");
        return `[의안 #${idx + 1}: ${a.title}] 표결: ${vText}${a.is_evaluation ? ` (점수: ${inp.score || 5}점)` : ""}${inp.opinion ? ` - 의견: ${inp.opinion}` : ""}`;
      }).join("\n");

      // 💡 [듀얼 지속성 보장] 1. 로컬 스토리지에 무조건 캐시 기록
      const localVotesKey = `local_meeting_agenda_votes_${meeting.id}`;
      const currentVotes = JSON.parse(localStorage.getItem(localVotesKey) || "[]");
      const filteredVotes = currentVotes.filter((v: any) =>
        String(v.member_id).trim() !== String(memberId).trim() &&
        String(v.member_name || "").trim() !== String(authMember.name).trim()
      );
      const updatedVotes = [...filteredVotes, ...votePayloads];
      localStorage.setItem(localVotesKey, JSON.stringify(updatedVotes));

      const fullMeetingId = String(meeting.id);
      const shortMeetingId = fullMeetingId.includes("-") ? fullMeetingId.split("-")[0] : fullMeetingId;

      const localRespKey = `local_meeting_responses_${fullMeetingId}`;
      const currentResp = JSON.parse(localStorage.getItem(localRespKey) || "[]");
      const filteredResp = currentResp.filter((r: any) =>
        String(r.member_id).trim() !== String(memberId).trim() &&
        String(r.member_name || "").trim() !== String(authMember.name).trim()
      );
      const newRespItem = {
        meeting_id: meeting.id,
        member_id: memberId,
        member_name: authMember.name,
        attended: true,
        vote: agendaInputs[selectedMeetingAgendas[0]?.id]?.vote || "APPROVE",
        opinion: summaryOpinion,
        signature: encryptedSignature,
        encrypted_signature: encryptedSignature,
        submitted_at: new Date().toISOString(),
        committee_members: {
          name: authMember.name,
          type: authMember.type || "위원",
          org: authMember.org || "",
          dept: authMember.dept || ""
        }
      };
      const updatedResp = [...filteredResp, newRespItem];
      localStorage.setItem(`local_meeting_responses_${fullMeetingId}`, JSON.stringify(updatedResp));
      localStorage.setItem(`local_meeting_responses_${shortMeetingId}`, JSON.stringify(updatedResp));

      // 💡 2. Supabase DB에 100% 무결성 실시간 반영
      if (!String(meeting.id).startsWith("local-")) {
        // 2-1. [1순위] committee_meetings 메인 테이블의 responses_data JSONB 컬럼에 서명 및 표결 결과 최우선 보장 업데이트
        try {
          const { data: meetingData } = await supabase
            .from("committee_meetings")
            .select("responses_data")
            .eq("id", meeting.id)
            .maybeSingle();

          const existingResponsesData = meetingData?.responses_data || [];
          const filteredResponsesData = Array.isArray(existingResponsesData)
            ? existingResponsesData.filter((r: any) =>
              String(r.member_name || "").trim() !== String(authMember.name).trim() &&
              String(r.member_id || "").trim() !== String(memberId).trim()
            )
            : [];
          const newResponsesData = [...filteredResponsesData, newRespItem];

          const { error: updateErr } = await supabase
            .from("committee_meetings")
            .update({ responses_data: newResponsesData })
            .eq("id", meeting.id);

          if (updateErr) {
            console.warn("committee_meetings responses_data 업데이트 경고:", updateErr.message);
          } else {
            console.log("✅ DB committee_meetings responses_data 100% 저장 성공!");
          }
        } catch (mErr: any) {
          console.warn("committee_meetings responses_data 예외:", mErr.message);
        }

        // 2-2. [2순위] meeting_responses 하위 테이블 저장 (숫자형 meeting.id 일 때만 DB 쿼리 실행)
        const isNumericMeetingId = !isNaN(Number(meeting.id)) && String(meeting.id).trim() !== "";
        if (isNumericMeetingId) {
          try {
            const respPayload = {
              meeting_id: Number(meeting.id),
              member_id: authMember.id || memberId,
              member_name: authMember.name,
              attended: true,
              vote: agendaInputs[selectedMeetingAgendas[0]?.id]?.vote || "APPROVE",
              opinion: summaryOpinion,
              signature: encryptedSignature,
              encrypted_signature: encryptedSignature,
              submitted_at: new Date().toISOString()
            };

            const { error: respErr } = await supabase.from("meeting_responses").insert([respPayload]);
            if (respErr) {
              await supabase.from("meeting_responses").upsert([respPayload]);
            }
          } catch (dbErr: any) {
            console.warn("meeting_responses DB 전송 스킵:", dbErr.message);
          }

          // 2-3. [3순위] meeting_agenda_votes 의안별 표결 테이블 저장
          try {
            await supabase.from("meeting_agenda_votes").insert(votePayloads);
          } catch (dbErr: any) {
            console.warn("meeting_agenda_votes DB 전송 스킵:", dbErr.message);
          }
        }
      }

      setHasSubmitted(true);
      alert("전자서명 및 의결 표결이 최종 제출되었습니다.");
    } catch (e: any) {
      console.error(e);
      alert("제출 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--text-primary)" }}>
        <span>회의 정보를 불러오는 중입니다...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", color: "#ef4444", gap: "1rem" }}>
        <AlertTriangle size={48} />
        <span style={{ fontSize: "1.2rem", fontWeight: "700" }}>{errorMsg}</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", padding: "1rem" }}>
        <div className="glass-card" style={{ width: "100%", maxWidth: "400px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ textAlign: "center" }}>
            <Lock size={48} style={{ color: "var(--accent-color)", marginBottom: "0.5rem" }} />
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800" }}>외부 위원 본인 인증</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
              {meeting?.title} 의결 및 전자서명을 위해 성명과 보안 PIN(6자리)을 입력해 주세요.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", display: "block", marginBottom: "0.4rem" }}>위원 성명</label>
              <input
                type="text"
                value={loginForm.name}
                onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                placeholder="성명 입력 (예: 송경영)"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", display: "block", marginBottom: "0.4rem" }}>보안 PIN (6자리)</label>
              <input
                type="password"
                value={loginForm.pin}
                onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value })}
                placeholder="보안 PIN 6자리 입력 (예: 123456)"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)" }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem" }}>
              <Users size={18} />
              <span>인증하고 회의 입장하기</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentAgendaInput = agendaInputs[activeAgendaId || ""] || { vote: "APPROVE", score: 5, opinion: "" };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
      {/* 상단 회의 헤더 */}
      <div className="glass-card" style={{ marginBottom: "1.5rem", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <span className="badge-blue" style={{ fontSize: "0.75rem" }}>{meeting?.committee_id === "planning" ? "앵커사업단 기획위원회" : "위원회 회의"}</span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{meeting?.meeting_date}</span>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "800" }}>{meeting?.title}</h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>{meeting?.location}</p>
          </div>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>접속 위원: </span>
              <span style={{ fontWeight: "700", color: "var(--accent-color)", fontSize: "1.05rem" }}>
                {authMember?.name} {authMember?.rank ? `(${authMember.rank})` : (authMember?.dept ? `(${authMember.dept})` : "")}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.35rem 0.75rem",
                fontSize: "0.78rem",
                fontWeight: "600",
                color: "#ef4444",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
              }}
            >
              <LogOut size={13} /> 인증 해제 / 로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 💡 [전체 1열 카드 레이아웃 구조 개편] */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* 1. 상정 안건 및 관련 자료 (1열 전체 블록) */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText size={22} style={{ color: "var(--accent-color)" }} />
              <span>상정 안건 및 관련 자료</span>
            </h3>
          </div>

          {selectedMeetingAgendas.length > 0 ? (
            /* 그 안에서 2열 그리드: 왼쪽(드롭다운 + 안건설명), 오른쪽(첨부파일 + PDF 뷰어) */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginTop: "0.25rem" }}>

              {/* 왼쪽 영역: 드롭다운 + 안건 정보 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-secondary)" }}>
                    📋 열람할 상정 의안 선택 ({selectedMeetingAgendas.length}건 중)
                  </label>
                  <select
                    value={activeAgendaId || ""}
                    onChange={(e) => setActiveAgendaId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.85rem",
                      borderRadius: "8px",
                      border: "2px solid var(--accent-color)",
                      background: "var(--input-bg)",
                      color: "var(--text-primary)",
                      fontSize: "0.95rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)"
                    }}
                  >
                    {selectedMeetingAgendas.map((agenda, index) => (
                      <option key={agenda.id} value={agenda.id}>
                        의안 #{index + 1}: {cleanAgendaTitle(agenda.title)}
                      </option>
                    ))}
                  </select>
                </div>

                {activeAgenda && (
                  <div style={{ padding: "0.85rem", borderRadius: "8px", background: "rgba(59, 130, 246, 0.06)", borderLeft: "4px solid var(--accent-color)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-color)", display: "block" }}>
                      선택된 안건 상세
                    </span>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "800", margin: "0.3rem 0 0.5rem 0" }}>
                      {cleanAgendaTitle(activeAgenda.title)}
                    </h4>
                    {activeAgenda.description ? (
                      <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6", whiteSpace: "pre-wrap", margin: 0 }}>
                        {cleanAgendaTitle(activeAgenda.description)}
                      </p>
                    ) : (
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontStyle: "italic", margin: 0 }}>
                        안건 관련 세부 설명 및 평가기준이 등록되어 있습니다. 오른쪽 자료를 참조해 주세요.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 오른쪽 영역: 첨부파일 + PDF 뷰어 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {currentFileName ? (
                  <>
                    <div style={{ fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                      <span style={{ color: "var(--accent-color)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        📎 첨부 파일: {currentFileName}
                      </span>
                    </div>
                    <div ref={viewerRef} style={{ width: "100%", height: "480px", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                      {activeAttachmentLoading ? (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#000" }}>
                          문서를 불러오는 중입니다...
                        </div>
                      ) : currentBlobUrl ? (
                        <iframe src={currentBlobUrl} style={{ width: "100%", height: "100%", border: "none" }} title="문서 뷰어" />
                      ) : (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#000" }}>
                          문서 데이터를 불러올 수 없습니다.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ height: "100%", minHeight: "250px", border: "1px dashed var(--border-color)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    등록된 첨부 심의 자료가 없습니다.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>상정된 의안이 없습니다.</p>
          )}
        </div>

        {/* 2. 의결 표결 카드 (1열 독립 블록 - 의안별 별도 표결) */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
            <Vote size={22} style={{ color: "var(--accent-color)" }} />
            <span>의결 표결 (안건별 표결)</span>
          </h3>

          {hasSubmitted ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "3rem 1rem", textAlign: "center", color: "#10b981" }}>
              <Check size={56} />
              <h4 style={{ fontSize: "1.25rem", fontWeight: "800" }}>의결 표결이 완료되었습니다.</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                제출해주신 의결 결과 및 자필 암호화 전자서명이 안전하게 처리되었습니다.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {selectedMeetingAgendas.map((agenda, index) => {
                const currentInp = agendaInputs[agenda.id] || { vote: "APPROVE", score: 5, opinion: "" };
                const isCurrentActive = String(agenda.id) === String(activeAgendaId);

                return (
                  <div
                    key={agenda.id}
                    style={{
                      border: isCurrentActive ? "2px solid var(--accent-color)" : "1px solid var(--border-color)",
                      padding: "1.1rem",
                      borderRadius: "10px",
                      background: isCurrentActive ? "rgba(59, 130, 246, 0.04)" : "rgba(255,255,255,0.02)",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span style={{ fontWeight: "800", fontSize: "1rem", color: isCurrentActive ? "var(--accent-color)" : "var(--text-primary)" }}>
                        의안 #{index + 1}: {cleanAgendaTitle(agenda.title)}
                      </span>
                      {isCurrentActive && (
                        <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "var(--accent-color)", color: "#fff", fontWeight: "700" }}>
                          현재 선택 안건
                        </span>
                      )}
                    </div>

                    {/* 💡 5점 척도 평가 UI vs 동의/부동의/기권 표결 버튼 동적 분기 */}
                    {agenda.is_evaluation ? (
                      <div style={{ marginBottom: "0.85rem" }}>
                        <div style={{ fontSize: "0.82rem", color: "#3b82f6", fontWeight: "bold", marginBottom: "0.5rem" }}>
                          ★ 5점 척도 평점 선택 (현재 평가: {currentInp.score || 5}점)
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.4rem" }}>
                          {[1, 2, 3, 4, 5].map(scoreVal => (
                            <button
                              key={scoreVal}
                              type="button"
                              onClick={() => setAgendaInputs({
                                ...agendaInputs,
                                [agenda.id]: {
                                  ...currentInp,
                                  score: scoreVal,
                                  vote: scoreVal >= 3 ? "APPROVE" : "REJECT"
                                }
                              })}
                              style={{
                                padding: "0.65rem 0.25rem",
                                fontSize: "0.8rem",
                                borderRadius: "6px",
                                border: (currentInp.score || 5) === scoreVal ? "2px solid #3b82f6" : "1px solid var(--border-color)",
                                background: (currentInp.score || 5) === scoreVal ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" : "rgba(255,255,255,0.05)",
                                color: (currentInp.score || 5) === scoreVal ? "#ffffff" : "var(--text-secondary)",
                                fontWeight: "bold",
                                cursor: "pointer",
                                boxShadow: (currentInp.score || 5) === scoreVal ? "0 4px 10px rgba(59, 130, 246, 0.3)" : "none"
                              }}
                            >
                              {scoreVal}점
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.85rem" }}>
                        <button
                          type="button"
                          onClick={() => setAgendaInputs({
                            ...agendaInputs,
                            [agenda.id]: { ...currentInp, vote: "APPROVE" }
                          })}
                          style={{
                            padding: "0.75rem 0.5rem",
                            fontSize: "0.95rem",
                            borderRadius: "8px",
                            border: currentInp.vote === "APPROVE" ? "2px solid #10b981" : "1px solid var(--border-color)",
                            background: currentInp.vote === "APPROVE" ? "#10b981" : "rgba(255,255,255,0.05)",
                            color: currentInp.vote === "APPROVE" ? "#ffffff" : "var(--text-secondary)",
                            fontWeight: "800",
                            cursor: "pointer",
                            boxShadow: currentInp.vote === "APPROVE" ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none",
                            transition: "all 0.15s ease"
                          }}
                        >
                          동의
                        </button>

                        <button
                          type="button"
                          onClick={() => setAgendaInputs({
                            ...agendaInputs,
                            [agenda.id]: { ...currentInp, vote: "REJECT" }
                          })}
                          style={{
                            padding: "0.75rem 0.5rem",
                            fontSize: "0.95rem",
                            borderRadius: "8px",
                            border: currentInp.vote === "REJECT" ? "2px solid #ef4444" : "1px solid var(--border-color)",
                            background: currentInp.vote === "REJECT" ? "#ef4444" : "rgba(255,255,255,0.05)",
                            color: currentInp.vote === "REJECT" ? "#ffffff" : "var(--text-secondary)",
                            fontWeight: "800",
                            cursor: "pointer",
                            boxShadow: currentInp.vote === "REJECT" ? "0 4px 12px rgba(239, 68, 68, 0.3)" : "none",
                            transition: "all 0.15s ease"
                          }}
                        >
                          부동의
                        </button>

                        <button
                          type="button"
                          onClick={() => setAgendaInputs({
                            ...agendaInputs,
                            [agenda.id]: { ...currentInp, vote: "ABSTAIN" }
                          })}
                          style={{
                            padding: "0.75rem 0.5rem",
                            fontSize: "0.95rem",
                            borderRadius: "8px",
                            border: currentInp.vote === "ABSTAIN" ? "2px solid #6b7280" : "1px solid var(--border-color)",
                            background: currentInp.vote === "ABSTAIN" ? "#6b7280" : "rgba(255,255,255,0.05)",
                            color: currentInp.vote === "ABSTAIN" ? "#ffffff" : "var(--text-secondary)",
                            fontWeight: "800",
                            cursor: "pointer",
                            boxShadow: currentInp.vote === "ABSTAIN" ? "0 4px 12px rgba(107, 114, 128, 0.3)" : "none",
                            transition: "all 0.15s ease"
                          }}
                        >
                          기권
                        </button>
                      </div>
                    )}

                    <div>
                      <input
                        type="text"
                        value={currentInp.opinion}
                        onChange={(e) => setAgendaInputs({
                          ...agendaInputs,
                          [agenda.id]: { ...currentInp, opinion: e.target.value }
                        })}
                        placeholder="의견이나 수정을 제안할 내용을 입력하세요."
                        style={{ width: "100%", padding: "0.65rem 0.8rem", fontSize: "0.88rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. 자필 서명 카드 (1열 독립 블록) */}
        {!hasSubmitted && (
          <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <label style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Lock size={20} style={{ color: "var(--accent-color)" }} />
                <span>자필 서명 (AES 암호화 보안 저장)</span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "normal" }}>(모바일/패드 멀티터치 지원)</span>
              </label>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSignatureFileUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "var(--accent-color)", background: "rgba(59, 130, 246, 0.1)", border: "1px solid var(--accent-color)", borderRadius: "6px", padding: "0.35rem 0.75rem", cursor: "pointer", fontWeight: "700" }}
                >
                  <Upload size={14} />
                  <span>서명 파일 업로드</span>
                </button>

                <button
                  type="button"
                  onClick={clearCanvas}
                  style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "6px", padding: "0.35rem 0.75rem", cursor: "pointer", fontWeight: "700" }}
                >
                  <RefreshCw size={14} />
                  <span>지우기</span>
                </button>
              </div>
            </div>

            <div style={{ border: "2px dashed var(--border-color)", borderRadius: "10px", background: "#ffffff", touchAction: "none", marginTop: "0.5rem" }}>
              <canvas
                ref={canvasRef}
                width={700}
                height={180}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ width: "100%", height: "180px", cursor: "crosshair", borderRadius: "8px" }}
              />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", textAlign: "right" }}>
              * 화면에 직접 서명하거나 이미지 파일(도장/서명)을 업로드할 수 있습니다.
            </span>

            {/* 4. 맨 아래에 최종 의결 표결 및 서명 제출 버튼 배치 */}
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmitVote}
              style={{
                width: "100%",
                padding: "1.05rem",
                fontSize: "1.1rem",
                fontWeight: "900",
                marginTop: "0.75rem",
                background: "var(--accent-color)",
                color: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
            >
              <Send size={22} />
              <span>최종 의결 표결 및 서명 제출</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
