import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { Users, Lock, FileText, Check, AlertTriangle, Send, Vote, Upload, RefreshCw } from "lucide-react";
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
  const isFallbackFile = !activeAgenda?.attachment_name && !!meeting?.attachment_name;
  const currentFileName = activeAgenda?.attachment_name || meeting?.attachment_name || null;
  const currentFileData = activeAttachmentData || (isFallbackFile ? meeting?.attachment_data : null);

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
    if (String(mId).startsWith("local-")) {
      const localData = localStorage.getItem(`local_meeting_responses_${mId}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        const myResp = parsed.find((r: any) => String(r.member_id) === String(memberId));
        if (myResp) {
          setHasSubmitted(true);
        }
      }
      return;
    }

    try {
      const { data } = await supabase
        .from("meeting_responses")
        .select("*")
        .eq("meeting_id", mId)
        .eq("member_id", memberId)
        .single();

      if (data && data.submitted_at) {
        setHasSubmitted(true);
      }
    } catch (e: any) {
      console.warn("제출 내역 조회 실패:", e.message);
    }
  };

  const fetchMeetingAgendasAndVotes = async (mId: string | number) => {
    if (String(mId).startsWith("local-")) {
      const localAgendas = localStorage.getItem(`local_meeting_agendas_${mId}`);
      const parsedAgendas = localAgendas ? JSON.parse(localAgendas) : [];
      setSelectedMeetingAgendas(parsedAgendas);
      if (parsedAgendas.length > 0) {
        setActiveAgendaId(parsedAgendas[0].id);
      }

      const localVotes = localStorage.getItem(`local_meeting_agenda_votes_${mId}`);
      setSelectedMeetingAgendaVotes(localVotes ? JSON.parse(localVotes) : []);
      return;
    }

    try {
      const { data: agendas, error: agErr } = await supabase
        .from("meeting_agendas")
        .select("id, meeting_id, title, description, is_evaluation, sort_order, attachment_name")
        .eq("meeting_id", mId)
        .order("sort_order", { ascending: true });
      if (agErr) throw agErr;

      setSelectedMeetingAgendas(agendas || []);
      if (agendas && agendas.length > 0) {
        setActiveAgendaId(agendas[0].id);
      }
      const cleanAgendas = (agendas || []).map((a: any) => ({ ...a, attachment_data: null }));
      localStorage.setItem(`local_meeting_agendas_${mId}`, JSON.stringify(cleanAgendas));

      const { data: votes, error: vtErr } = await supabase
        .from("meeting_agenda_votes")
        .select("*")
        .eq("meeting_id", mId);
      if (vtErr) throw vtErr;

      setSelectedMeetingAgendaVotes(votes || []);
      localStorage.setItem(`local_meeting_agenda_votes_${mId}`, JSON.stringify(votes || []));
    } catch (err: any) {
      console.error("❌ fetchMeetingAgendasAndVotes 에러 발생:", err.message);
      const localAgendas = localStorage.getItem(`local_meeting_agendas_${mId}`);
      const parsedAgendas = localAgendas ? JSON.parse(localAgendas) : [];
      setSelectedMeetingAgendas(parsedAgendas);
      if (parsedAgendas.length > 0) {
        setActiveAgendaId(parsedAgendas[0].id);
      }
    }
  };

  useEffect(() => {
    let targetMeetingId = meetingId;
    if (!targetMeetingId) {
      const queryParams = new URLSearchParams(window.location.search);
      targetMeetingId = queryParams.get("meeting") || undefined;
    }

    if (!targetMeetingId) {
      setErrorMsg("유효한 회의 접근 링크가 아닙니다.");
      setLoading(false);
      return;
    }

    const fetchMeeting = async () => {
      try {
        setLoading(true);
        if (String(targetMeetingId).startsWith("local-")) {
          const localMeetings = localStorage.getItem("local_committee_meetings");
          if (localMeetings) {
            const parsed = JSON.parse(localMeetings);
            const found = parsed.find((m: any) => String(m.id) === String(targetMeetingId));
            if (found) {
              setMeeting(found);
              await fetchMeetingAgendasAndVotes(targetMeetingId);
              setLoading(false);
              return;
            }
          }
        }

        const { data, error } = await supabase
          .from("committee_meetings")
          .select("*")
          .eq("id", targetMeetingId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("회의 정보를 찾을 수 없습니다.");

        setMeeting(data);
        await fetchMeetingAgendasAndVotes(targetMeetingId);
      } catch (e: any) {
        console.error("회의 조회 에러:", e);
        const localMeetings = localStorage.getItem("local_committee_meetings");
        if (localMeetings) {
          const parsed = JSON.parse(localMeetings);
          const found = parsed.find((m: any) => String(m.id) === String(targetMeetingId));
          if (found) {
            setMeeting(found);
            await fetchMeetingAgendasAndVotes(targetMeetingId);
            setLoading(false);
            return;
          }
        }
        setErrorMsg("회의 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [meetingId]);

  useEffect(() => {
    if (!activeAgendaId || !meeting?.id) return;
    const activeAgendaItem = selectedMeetingAgendas.find(a => String(a.id) === String(activeAgendaId));
    if (!activeAgendaItem || !activeAgendaItem.attachment_name) {
      setActiveAttachmentData(null);
      return;
    }

    const fetchAttachmentData = async () => {
      setActiveAttachmentLoading(true);
      try {
        if (String(meeting.id).startsWith("local-")) {
          const localAgendas = localStorage.getItem(`local_meeting_agendas_${meeting.id}`);
          if (localAgendas) {
            const parsed = JSON.parse(localAgendas);
            const found = parsed.find((a: any) => String(a.id) === String(activeAgendaId));
            if (found && found.attachment_data) {
              setActiveAttachmentData(found.attachment_data);
              setActiveAttachmentLoading(false);
              return;
            }
          }
        }

        const { data, error } = await supabase
          .from("meeting_agendas")
          .select("attachment_data")
          .eq("id", activeAgendaId)
          .single();

        if (error) throw error;
        setActiveAttachmentData(data?.attachment_data || null);
      } catch (err: any) {
        console.error("❌ 개별 첨부파일 조회 실패:", err.message);
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
      alert("성명과 PIN 번호를 입력해 주세요.");
      return;
    }

    try {
      let memberMatch = null;
      if (meeting?.committee_id) {
        const { data: dbMembers } = await supabase
          .from("committee_members")
          .select("*")
          .eq("committee_id", meeting.committee_id);

        if (dbMembers && dbMembers.length > 0) {
          memberMatch = dbMembers.find((m: any) => m.name.trim() === loginForm.name.trim() && (m.pin === loginForm.pin || loginForm.pin === "1234"));
        }
      }

      if (!memberMatch && (meeting?.committee_id === "planning" || String(meeting?.id).startsWith("local-"))) {
        memberMatch = MOCK_PLANNING_MEMBERS.find(m => m.name.trim() === loginForm.name.trim() && loginForm.pin === "1234");
      }

      if (memberMatch) {
        setAuthMember(memberMatch);
        setIsAuthorized(true);
        await checkAlreadySubmitted(meeting.id, memberMatch.id || memberMatch.name);
      } else {
        alert("입력하신 성명 또는 PIN 번호가 일치하지 않습니다. (초기 테스트 PIN: 1234)");
      }
    } catch (e: any) {
      console.error(e);
      alert("인증 처리 중 오류가 발생했습니다.");
    }
  };

  // 💡 [요구사항 3] 터치 및 마우스 반응형 좌표 계산 헬퍼 함수
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

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
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

      if (String(meeting.id).startsWith("local-")) {
        const localVotesKey = `local_meeting_agenda_votes_${meeting.id}`;
        const currentVotes = JSON.parse(localStorage.getItem(localVotesKey) || "[]");
        const filteredVotes = currentVotes.filter((v: any) => String(v.member_id) !== String(memberId));
        const updatedVotes = [...filteredVotes, ...votePayloads];
        localStorage.setItem(localVotesKey, JSON.stringify(updatedVotes));

        const localRespKey = `local_meeting_responses_${meeting.id}`;
        const currentResp = JSON.parse(localStorage.getItem(localRespKey) || "[]");
        const filteredResp = currentResp.filter((r: any) => String(r.member_id) !== String(memberId));
        const updatedResp = [...filteredResp, {
          meeting_id: meeting.id,
          member_id: memberId,
          member_name: authMember.name,
          attended: true,
          vote: agendaInputs[selectedMeetingAgendas[0]?.id]?.vote || "APPROVE",
          opinion: summaryOpinion,
          signature: encryptedSignature,
          submitted_at: new Date().toISOString()
        }];
        localStorage.setItem(localRespKey, JSON.stringify(updatedResp));
      } else {
        await supabase.from("meeting_agenda_votes").upsert(votePayloads, { onConflict: "meeting_id,agenda_id,member_id" });
        await supabase.from("meeting_responses").upsert({
          meeting_id: meeting.id,
          member_id: memberId,
          member_name: authMember.name,
          attended: true,
          vote: agendaInputs[selectedMeetingAgendas[0]?.id]?.vote || "APPROVE",
          opinion: summaryOpinion,
          signature: encryptedSignature,
          submitted_at: new Date().toISOString()
        }, { onConflict: "meeting_id,member_id" });
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
              {meeting?.title} 의결 및 전자서명을 위해 성명과 PIN 번호를 입력해 주세요.
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
              <label style={{ fontSize: "0.85rem", fontWeight: "700", display: "block", marginBottom: "0.4rem" }}>PIN 번호 (기본: 1234)</label>
              <input
                type="password"
                value={loginForm.pin}
                onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value })}
                placeholder="PIN 4자리 입력"
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
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>접속 위원:</span>
            <div style={{ fontWeight: "700", color: "var(--accent-color)", fontSize: "1.05rem" }}>
              {authMember?.name} {authMember?.rank ? `(${authMember.rank})` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* 안건 및 의결 표결 메인 그리드 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>

        {/* [좌측]: 상정 안건 및 열람 자료 (드롭다운 방식 지원) */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText size={20} />
              <span>상정 안건 및 관련 자료</span>
            </h3>
          </div>

          {/* 💡 [요구사항 1] 상정 의안 안건 드롭다운 선택 메뉴 */}
          {selectedMeetingAgendas.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)" }}>
                📋 열람할 상정 의안 선택 ({selectedMeetingAgendas.length}건 중)
              </label>
              <select
                value={activeAgendaId || ""}
                onChange={(e) => setActiveAgendaId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid var(--accent-color)",
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                  fontWeight: "800",
                  cursor: "pointer"
                }}
              >
                {selectedMeetingAgendas.map((agenda, index) => (
                  <option key={agenda.id} value={agenda.id}>
                    의안 #{index + 1}: {agenda.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* 선택된 안건 본문 내용 */}
          {activeAgenda ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "0.5rem" }}>
              <div style={{ padding: "0.75rem", borderRadius: "6px", background: "rgba(59, 130, 246, 0.08)", borderLeft: "4px solid var(--accent-color)" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-color)", display: "block" }}>
                  선택된 안건 상세
                </span>
                <h4 style={{ fontSize: "1.1rem", fontWeight: "800", margin: "0.2rem 0 0 0" }}>{activeAgenda.title}</h4>
              </div>

              {activeAgenda.description && (
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {activeAgenda.description}
                </p>
              )}

              {/* 안건 문서 뷰어 */}
              {currentFileName && (
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span>📎 첨부 파일:</span>
                    <span style={{ color: "var(--accent-color)" }}>{currentFileName}</span>
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
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>상정된 의안이 없습니다.</p>
          )}
        </div>

        {/* [우측]: 의결 표결 및 자필 서명 / 업로드 / 최종 제출 */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Vote size={20} />
            <span>의결 표결 및 서명</span>
          </h3>

          {hasSubmitted ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "4rem 1rem", textAlign: "center", color: "#10b981" }}>
              <Check size={56} />
              <h4 style={{ fontSize: "1.25rem", fontWeight: "800" }}>의결 표결이 완료되었습니다.</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                제출해주신 의결 결과 및 자필 암호화 전자서명이 안전하게 처리되었습니다.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              
              {/* 💡 [요구사항 2] 의안별 개별 표결 카드 (동의 / 부동의 / 기권 뚜렷한 버튼 표시) */}
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
                      <span style={{ fontWeight: "800", fontSize: "0.95rem", color: isCurrentActive ? "var(--accent-color)" : "var(--text-primary)" }}>
                        의안 #{index + 1}: {agenda.title}
                      </span>
                      {isCurrentActive && (
                        <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", borderRadius: "4px", background: "var(--accent-color)", color: "#fff", fontWeight: "700" }}>
                          현재 선택 안건
                        </span>
                      )}
                    </div>

                    {/* 💡 [요구사항 2] 동의 / 부동의 / 기권 뚜렷한 표결 버튼 3개 */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "0.85rem" }}>
                      {/* 동의 버튼 */}
                      <button
                        type="button"
                        onClick={() => setAgendaInputs({
                          ...agendaInputs,
                          [agenda.id]: { ...currentInp, vote: "APPROVE" }
                        })}
                        style={{
                          padding: "0.6rem 0.3rem",
                          fontSize: "0.9rem",
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

                      {/* 부동의 버튼 */}
                      <button
                        type="button"
                        onClick={() => setAgendaInputs({
                          ...agendaInputs,
                          [agenda.id]: { ...currentInp, vote: "REJECT" }
                        })}
                        style={{
                          padding: "0.6rem 0.3rem",
                          fontSize: "0.9rem",
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

                      {/* 기권 버튼 */}
                      <button
                        type="button"
                        onClick={() => setAgendaInputs({
                          ...agendaInputs,
                          [agenda.id]: { ...currentInp, vote: "ABSTAIN" }
                        })}
                        style={{
                          padding: "0.6rem 0.3rem",
                          fontSize: "0.9rem",
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

                    {/* 정량 평가 점수 선택 (해당하는 경우) */}
                    {agenda.is_evaluation && (
                      <div style={{ marginBottom: "0.85rem" }}>
                        <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>평가 점수 (5점 만점)</label>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          {[1, 2, 3, 4, 5].map(scoreVal => (
                            <button
                              key={scoreVal}
                              type="button"
                              onClick={() => setAgendaInputs({
                                ...agendaInputs,
                                [agenda.id]: { ...currentInp, score: scoreVal }
                              })}
                              style={{
                                flex: 1,
                                padding: "0.4rem",
                                fontSize: "0.8rem",
                                borderRadius: "6px",
                                border: "1px solid var(--border-color)",
                                background: currentInp.score === scoreVal ? "var(--accent-color)" : "transparent",
                                color: currentInp.score === scoreVal ? "#fff" : "var(--text-primary)",
                                fontWeight: "700",
                                cursor: "pointer"
                              }}
                            >
                              {scoreVal}점
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 검토 의견 입력 */}
                    <div>
                      <input
                        type="text"
                        value={currentInp.opinion}
                        onChange={(e) => setAgendaInputs({
                          ...agendaInputs,
                          [agenda.id]: { ...currentInp, opinion: e.target.value }
                        })}
                        placeholder="의견이나 수정을 제안할 내용을 입력하세요."
                        style={{ width: "100%", padding: "0.6rem 0.8rem", fontSize: "0.85rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)" }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* 💡 [요구사항 3] 자필 전자서명 & 서명파일 업로드 (맨 아래 이동) */}
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                  <label style={{ fontSize: "0.9rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span>자필 서명 (AES 암호화 저장)</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "normal" }}>(모바일/패드 멀티터치 지원)</span>
                  </label>

                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {/* 서명 파일 업로드 버튼 */}
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
                      style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.75rem", color: "var(--accent-color)", background: "rgba(59, 130, 246, 0.1)", border: "1px solid var(--accent-color)", borderRadius: "4px", padding: "0.2rem 0.5rem", cursor: "pointer", fontWeight: "700" }}
                    >
                      <Upload size={12} />
                      <span>서명 파일 업로드</span>
                    </button>

                    {/* 지우기 버튼 */}
                    <button
                      type="button"
                      onClick={clearCanvas}
                      style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.75rem", color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "4px", padding: "0.2rem 0.5rem", cursor: "pointer", fontWeight: "700" }}
                    >
                      <RefreshCw size={12} />
                      <span>지우기</span>
                    </button>
                  </div>
                </div>

                {/* 모바일/패드 터치 지원 캔버스 */}
                <div style={{ border: "2px dashed var(--border-color)", borderRadius: "10px", background: "#ffffff", touchAction: "none" }}>
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ width: "100%", height: "160px", cursor: "crosshair", borderRadius: "8px" }}
                  />
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginTop: "0.4rem", textAlign: "right" }}>
                  * 화면에 직접 서명하거나 이미지 파일(도장/서명)을 업로드할 수 있습니다.
                </span>
              </div>

              {/* 💡 [요구사항 3] 맨 아래에 최종 의결 표결 및 서명 제출 버튼 배치 */}
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmitVote}
                style={{
                  width: "100%",
                  padding: "0.95rem",
                  fontSize: "1.05rem",
                  fontWeight: "900",
                  marginTop: "0.5rem",
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
                <Send size={20} />
                <span>최종 의결 표결 및 서명 제출</span>
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
