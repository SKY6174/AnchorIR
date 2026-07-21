import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { Users, Lock, FileText, Check, AlertTriangle, Send, Vote } from "lucide-react";
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
 * 💡 CommitteeExternalVote - 위원회 외부 전자 투표 및 의결 수집 TSX 컴포넌트
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

  // 외부 위원이 개별 의안에 대해 채우는 폼 상태
  const [agendaInputs, setAgendaInputs] = useState<Record<string | number, { vote: string; score: number; opinion: string }>>({});

  // 의결 양식 상태
  const [attended, setAttended] = useState<boolean>(true);
  const [vote, setVote] = useState<string>("APPROVE");
  const [opinion, setOpinion] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // 전자서명 캔버스 참조
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentBlobUrl, setCurrentBlobUrl] = useState<string | null>(null);

  const activeAgenda = selectedMeetingAgendas.find(a => a.id === activeAgendaId);
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
        const myResp = parsed.find((r: any) => r.member_id === memberId);
        if (myResp) {
          setAttended(myResp.attended);
          setVote(myResp.vote || "APPROVE");
          setOpinion(myResp.opinion || "");
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
        setAttended(data.attended);
        setVote(data.vote || "APPROVE");
        setOpinion(data.opinion || "");
        setHasSubmitted(true);
      } else {
        throw new Error("No response record");
      }
    } catch (e: any) {
      console.warn("제출 내역 조회 실패 (로컬 스토리지 확인):", e.message);
      const localData = localStorage.getItem(`local_meeting_responses_${mId}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        const myResp = parsed.find((r: any) => r.member_id === memberId);
        if (myResp) {
          setAttended(myResp.attended);
          setVote(myResp.vote || "APPROVE");
          setOpinion(myResp.opinion || "");
          setHasSubmitted(true);
        }
      }
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

      const localVotes = localStorage.getItem(`local_meeting_agenda_votes_${mId}`);
      setSelectedMeetingAgendaVotes(localVotes ? JSON.parse(localVotes) : []);
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
        console.error("회의 조회 에러 (로컬 폴백 검사):", e);
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

  // 개별 첨부파일 비동기 다운로드
  useEffect(() => {
    if (!activeAgendaId || !meeting?.id) return;
    const activeAgendaItem = selectedMeetingAgendas.find(a => a.id === activeAgendaId);
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
            const found = parsed.find((a: any) => a.id === activeAgendaId);
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

  // 캔버스 전자서명 이벤트
  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
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
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // 최종 전자서명 및 의결 표결 제출
  const handleSubmitVote = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureData = canvas.toDataURL("image/png");

    if (signatureData.length < 1000) {
      alert("서명란에 자필 서명을 완성해 주세요.");
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
        return `[의안 ${idx + 1}: ${a.title}] ${inp.vote === "APPROVE" ? "찬성" : (inp.vote === "REJECT" ? "반대" : "기권")}${a.is_evaluation ? ` (점수: ${inp.score || 5}점)` : ""}${inp.opinion ? ` - 의견: ${inp.opinion}` : ""}`;
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
          vote: vote,
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
          vote: vote,
          opinion: summaryOpinion,
          signature: encryptedSignature,
          submitted_at: new Date().toISOString()
        }, { onConflict: "meeting_id,member_id" });
      }

      setHasSubmitted(true);
      alert("전자서명 및 의결 표결이 제출되었습니다.");
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
        {/* 좌측: 안건 및 열람 자료 뷰어 */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText size={20} />
            <span>상정 안건 및 관련 자료</span>
          </h3>

          {/* 안건 탭 선택 */}
          {selectedMeetingAgendas.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", overflowX: "auto" }}>
              {selectedMeetingAgendas.map((agenda, index) => (
                <button
                  key={agenda.id}
                  onClick={() => setActiveAgendaId(agenda.id)}
                  className={`btn-primary ${activeAgendaId === agenda.id ? "" : "inactive"}`}
                  style={{
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.85rem",
                    background: activeAgendaId === agenda.id ? "var(--accent-color)" : "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)"
                  }}
                >
                  의안 #{index + 1}
                </button>
              ))}
            </div>
          )}

          {/* 선택된 안건 내용 */}
          {activeAgenda ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <h4 style={{ fontSize: "1.05rem", fontWeight: "700" }}>{activeAgenda.title}</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                {activeAgenda.description}
              </p>

              {/* 안건 문서 뷰어 */}
              {currentFileName && (
                <div style={{ marginTop: "1.5rem" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                    첨부 파일: {currentFileName}
                  </div>
                  <div ref={viewerRef} style={{ width: "100%", height: "450px", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
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

        {/* 우측: 의결 표결 및 자필 서명 */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Vote size={20} />
            <span>의결 표결 및 서명</span>
          </h3>

          {hasSubmitted ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "3rem 1rem", textAlign: "center", color: "var(--success-color)" }}>
              <Check size={56} />
              <h4 style={{ fontSize: "1.2rem", fontWeight: "800" }}>의결 표결이 완료되었습니다.</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                제출해주신 의결 결과 및 자필 암호화 전자서명이 안전하게 기록되었습니다.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {/* 개별 의안 찬반/점수 표결 */}
              {selectedMeetingAgendas.map((agenda, index) => {
                const currentInp = agendaInputs[agenda.id] || { vote: "APPROVE", score: 5, opinion: "" };
                return (
                  <div key={agenda.id} style={{ border: "1px solid var(--border-color)", padding: "1rem", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ fontWeight: "700", fontSize: "0.95rem", marginBottom: "0.6rem" }}>
                      의안 #{index + 1}: {agenda.title}
                    </div>

                    {/* 찬반 선택 */}
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.8rem" }}>
                      {["APPROVE", "REJECT", "ABSTAIN"].map(vOpt => (
                        <button
                          key={vOpt}
                          type="button"
                          onClick={() => setAgendaInputs({
                            ...agendaInputs,
                            [agenda.id]: { ...currentInp, vote: vOpt }
                          })}
                          style={{
                            flex: 1,
                            padding: "0.4rem",
                            fontSize: "0.8rem",
                            borderRadius: "6px",
                            border: "1px solid var(--border-color)",
                            background: currentInp.vote === vOpt ? (vOpt === "APPROVE" ? "var(--success-color)" : (vOpt === "REJECT" ? "#ef4444" : "#f59e0b")) : "transparent",
                            color: "#fff",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          {vOpt === "APPROVE" ? "찬성" : (vOpt === "REJECT" ? "반대" : "기권")}
                        </button>
                      ))}
                    </div>

                    {/* 정량 평가인 경우 점수 선택 */}
                    {agenda.is_evaluation && (
                      <div style={{ marginBottom: "0.8rem" }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>평가 점수 (5점 만점)</label>
                        <div style={{ display: "flex", gap: "0.3rem" }}>
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
                                padding: "0.3rem",
                                fontSize: "0.75rem",
                                borderRadius: "4px",
                                border: "1px solid var(--border-color)",
                                background: currentInp.score === scoreVal ? "var(--accent-color)" : "transparent",
                                color: "#fff"
                              }}
                            >
                              {scoreVal}점
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 심의 의견 입력 */}
                    <div>
                      <input
                        type="text"
                        value={currentInp.opinion}
                        onChange={(e) => setAgendaInputs({
                          ...agendaInputs,
                          [agenda.id]: { ...currentInp, opinion: e.target.value }
                        })}
                        placeholder="의견이나 수정을 제안할 내용을 입력하세요."
                        style={{ width: "100%", padding: "0.5rem", fontSize: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)" }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* 자필 전자서명 캔버스 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>자필 서명 (AES 암호화 저장)</label>
                  <button type="button" onClick={clearCanvas} style={{ fontSize: "0.75rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
                    지우기
                  </button>
                </div>
                <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff", touchAction: "none" }}>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ width: "100%", height: "150px", cursor: "crosshair" }}
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmitVote}
                style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: "800", marginTop: "0.5rem" }}
              >
                <Send size={18} />
                <span>최종 의결 표결 및 서명 제출</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
