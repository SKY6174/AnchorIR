import React, { useState, useEffect, useRef } from "react";
import { Lock, FileText, Check, AlertTriangle, Send, Vote, Upload, RefreshCw, LogOut, ArrowRight, ShieldCheck } from "lucide-react";
import {
  authenticateCommitteeVoter,
  getCommitteeVoteContext,
  getCommitteeVoteErrorMessage,
  getPublicCommitteeMeeting,
  submitCommitteeVote
} from "../services/committee-vote-service";
import { CommitteeVoteContext } from "../types/committee-vote";
import { buildValidatedVoteItems, createIdempotencyKey } from "../utils/committee-vote-validation";
import { buildCommitteeHumanCode } from "../utils/committee-code";
import { formatCommitteeMemberDisplay } from "../utils/committee-member-display";

const COMMITTEE_DISPLAY_NAMES: Record<string, string> = {
  total: "앵커총괄위원회",
  planning: "앵커기획위원회",
  planning_op: "앵커기획위원회",
  budget: "앵커사업비관리위원회",
  evaluation: "앵커사업자체평가위원회",
  advisory: "앵커사업자문회의",
  ecc: "ECC센터운영위원회",
  ecc_op: "ECC센터운영위원회",
  icc: "ICC센터운영위원회",
  icc_op: "ICC센터운영위원회",
  rcc: "RCC센터운영위원회",
  rcc_op: "RCC센터운영위원회",
  aidx_op: "AID-X지원센터운영위원회",
  neulbom_op: "울산늘봄누리센터운영위원회",
  newind_op: "신산업특화센터운영위원회"
};

const getCommitteeSystemName = (committeeId: unknown): string => {
  return COMMITTEE_DISPLAY_NAMES[String(committeeId || "").toLowerCase()] || "위원회";
};

// 💡 [안건 제목 완벽 정제 헬퍼]: 파일 확장자(.pdf, .hwp 등), 서술형 파일명, [RISE사업...], (5점척도) 지문 완전 제거
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

  // 사용자가 "성과심의 2026년 유학생 문화교류..." 처럼 파일명을 안건 제목으로 기입한 경우 '성과심의' 핵심 안건명 추출
  if (str.includes("성과심의")) {
    return "성과심의";
  }
  if (str.includes("수정사업계획서")) {
    return "수정사업계획서";
  }

  if (str.length > 25 && str.includes(" ")) {
    const firstWord = str.split(" ")[0];
    if (firstWord.length >= 2) return firstWord;
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
  const [voterToken, setVoterToken] = useState<string>("");

  // 선택된 회의의 의안 목록 및 위원들의 투표 수집 정보
  const [selectedMeetingAgendas, setSelectedMeetingAgendas] = useState<any[]>([]);
  const [activeAgendaId, setActiveAgendaId] = useState<string | number | null>(null);
  const [activeAttachmentData, setActiveAttachmentData] = useState<any>(null);
  const [activeAttachmentLoading, setActiveAttachmentLoading] = useState<boolean>(false);

  // 사용자가 실제로 선택한 값만 기록하며, 미선택 상태를 표결 완료처럼 표시하지 않습니다.
  const [agendaInputs, setAgendaInputs] = useState<Record<string | number, { vote: string; score: number; opinion: string }>>({});

  // 전체 제출 상태
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // 전자서명 캔버스 및 파일 입력 참조
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentBlobUrl, setCurrentBlobUrl] = useState<string | null>(null);

  const activeAgendaIndex = selectedMeetingAgendas.findIndex(a => String(a.id) === String(activeAgendaId));
  const activeAgenda = selectedMeetingAgendas[activeAgendaIndex] || selectedMeetingAgendas.find(a => String(a.id) === String(activeAgendaId));

  // 💡 선택된 의안 개별 파일이 최우선이며, 1번 의안일 경우에만 회의 대표 파일 폴백 인정! (2번, 3번 의안에 1번 파일 엉킴 원천 방지)
  const currentFileName = activeAgenda?.attachment_name || (activeAgendaIndex === 0 ? meeting?.attachment_name : null);
  const currentFileData = activeAttachmentData || (activeAgendaIndex === 0 ? meeting?.attachment_data : null);

  useEffect(() => {
    if (!currentFileData) {
      setCurrentBlobUrl(null);
      return;
    }

    let rawStr = String(currentFileData).trim();

    // 0. 2중/3중 겹친 URL인코딩(%22, %5B) 및 JSON 배열 문자열 완전 탈피(Unwrap) 5중 디코더
    for (let depth = 0; depth < 5; depth++) {
      if (rawStr.includes("%22") || rawStr.includes("%5B")) {
        try {
          rawStr = decodeURIComponent(rawStr);
        } catch { }
      }
      rawStr = rawStr.trim();
      if (rawStr.startsWith('"') || rawStr.startsWith("'") || rawStr.startsWith('[')) {
        try {
          const parsed = JSON.parse(rawStr);
          if (Array.isArray(parsed)) {
            const targetIdx = activeAgendaIndex || 0;
            rawStr = String(parsed[targetIdx] || parsed[0] || "").trim();
          } else if (typeof parsed === "string") {
            rawStr = parsed.trim();
          } else {
            break;
          }
        } catch {
          rawStr = rawStr.replace(/^["'\x5B]+/, "").replace(/["'\]]+$/, "").trim();
          break;
        }
      } else {
        break;
      }
    }

    // 1. 순수 웹 URL (http://, https://, blob:) 및 data: 미포함 주소
    if (
      (rawStr.startsWith("http://") || rawStr.startsWith("https://") || rawStr.startsWith("blob:")) &&
      !rawStr.includes("data:application/pdf")
    ) {
      try {
        const safeUrl = rawStr.startsWith("http") ? encodeURI(decodeURI(rawStr)) : rawStr;
        setCurrentBlobUrl(safeUrl);
      } catch {
        setCurrentBlobUrl(rawStr);
      }
      return;
    }

    // 2. data: 헤더 또는 JVBERi (PDF 헤더 Base64) 감지 시 무조건 100% Blob 변환 (Vercel 414 에러 완전 방지)
    if (rawStr.includes("data:") || rawStr.includes("JVBERi") || /^[A-Za-z0-9+/=]{50,}/.test(rawStr)) {
      try {
        let base64Content = rawStr;
        let mimeType = "application/pdf";

        if (rawStr.includes("data:")) {
          const dataMatch = rawStr.match(/data:([^;]+);base64,(.*)/s);
          if (dataMatch) {
            mimeType = dataMatch[1] || "application/pdf";
            base64Content = dataMatch[2] || "";
          } else {
            base64Content = rawStr.split("base64,")[1] || rawStr;
          }
        }

        // URL 인코딩 정제 및 영문/숫자/+/=/ 외 특수문자 정제
        try {
          if (base64Content.includes("%")) {
            base64Content = decodeURIComponent(base64Content);
          }
        } catch { }

        base64Content = base64Content.replace(/[^A-Za-z0-9+/=]/g, "");

        // 4의 배수 길이 padding 보정
        while (base64Content.length % 4 !== 0) {
          base64Content += "=";
        }

        const byteString = atob(base64Content);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeType });
        const url = URL.createObjectURL(blob);
        setCurrentBlobUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (e) {
        console.warn("❌ PDF Base64 Blob 변환 예외 가드 (안전 rawStr 폴백 적용):", e);
        setCurrentBlobUrl(rawStr);
      }
    } else {
      setCurrentBlobUrl(rawStr);
    }
    return undefined;
  }, [currentFileData, activeAgendaIndex]);

  const applyVoteContext = (context: CommitteeVoteContext) => {
    setMeeting(context.meeting);
    setAuthMember(context.member);
    setSelectedMeetingAgendas(context.agendas);
    setHasSubmitted(context.has_submitted);
    if (context.agendas.length > 0) setActiveAgendaId(context.agendas[0].id);

    if (context.existing_votes?.length) {
      const restoredInputs = Object.fromEntries(context.existing_votes.map(item => [item.agenda_id, {
        vote: item.vote || "",
        score: item.score || 0,
        opinion: item.opinion || ""
      }]));
      setAgendaInputs(restoredInputs);
      return;
    }

    const draftKey = `local_meeting_draft_${context.meeting.id}_${context.member.name}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) setAgendaInputs(JSON.parse(savedDraft));
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const accessCode = meetingId || queryParams.get("v") || queryParams.get("meetingId") || queryParams.get("meeting") || queryParams.get("id") || "";

    if (!accessCode) {
      setErrorMsg("유효한 회의 접근 링크가 아닙니다.");
      setLoading(false);
      return;
    }

    const fetchMeeting = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const publicMeeting = await getPublicCommitteeMeeting(accessCode);
        setMeeting(publicMeeting);

        const sessionKey = `committee_auth_session_${accessCode}`;
        const savedSession = sessionStorage.getItem(sessionKey);
        if (savedSession) {
          const parsedSession = JSON.parse(savedSession);
          if (parsedSession.token) {
            const context = await getCommitteeVoteContext(parsedSession.token);
            setVoterToken(parsedSession.token);
            setIsAuthorized(true);
            applyVoteContext(context);
          }
        }
      } catch (e: any) {
        console.error("회의 조회 에러:", e);
        sessionStorage.removeItem(`committee_auth_session_${accessCode}`);
        setErrorMsg(getCommitteeVoteErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [meetingId]);

  // 💡 선택된 활성 의안(activeAgendaItem)의 개별 첨부파일 비동기/동기 로더 (의안 전환 시 100% 동기화)
  useEffect(() => {
    if (!activeAgendaId || !meeting?.id) return;
    const activeAgendaIndex = selectedMeetingAgendas.findIndex(a => String(a.id) === String(activeAgendaId));
    const activeAgendaItem = selectedMeetingAgendas[activeAgendaIndex] || selectedMeetingAgendas.find(a => String(a.id) === String(activeAgendaId));
    setActiveAttachmentData(activeAgendaItem?.attachment_data || null);
    setActiveAttachmentLoading(false);
  }, [activeAgendaId, meeting?.id, selectedMeetingAgendas]);

  // 위원 성명/PIN 인증 핸들러
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.name || !loginForm.pin) {
      alert("위원 성명과 안내받은 6자리 보안코드를 입력해 주세요.");
      return;
    }

    try {
      const queryParams = new URLSearchParams(window.location.search);
      const accessCode = meetingId || queryParams.get("v") || queryParams.get("meetingId") || queryParams.get("meeting") || queryParams.get("id") || "";
      const authentication = await authenticateCommitteeVoter(accessCode, loginForm.name, loginForm.pin);
      const context = await getCommitteeVoteContext(authentication.token);

      setVoterToken(authentication.token);
      setIsAuthorized(true);
      applyVoteContext(context);
      sessionStorage.setItem(`committee_auth_session_${accessCode}`, JSON.stringify({
        token: authentication.token,
        expires_at: authentication.expires_at
      }));
    } catch (e: any) {
      console.error("인증 처리 예외:", e);
      setIsAuthorized(false);
      setVoterToken("");
      alert(getCommitteeVoteErrorMessage(e));
    }
  };

  const handleLogout = () => {
    if (window.confirm("인증 해제하고 로그아웃하시겠습니까?")) {
      const queryParams = new URLSearchParams(window.location.search);
      const accessCode = meetingId || queryParams.get("v") || queryParams.get("meetingId") || queryParams.get("meeting") || queryParams.get("id") || "";
      sessionStorage.removeItem(`committee_auth_session_${accessCode}`);
      setIsAuthorized(false);
      setAuthMember(null);
      setVoterToken("");
      setLoginForm({ name: "", pin: "" });
      setHasSubmitted(false);
      clearCanvas();
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
    const pixels = canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height).data;
    const hasSignature = pixels ? Array.from({ length: Math.floor(pixels.length / 4) }, (_, index) => index * 4)
      .some(index => pixels[index + 3] > 0 && (pixels[index] < 245 || pixels[index + 1] < 245 || pixels[index + 2] < 245)) : false;

    if (!hasSignature) {
      alert("서명란에 자필 서명을 하거나 서명 도장 이미지를 업로드해 주세요.");
      return;
    }

    const validation = buildValidatedVoteItems(selectedMeetingAgendas, agendaInputs);
    if (!validation.valid) {
      if (validation.firstInvalidAgendaId) setActiveAgendaId(validation.firstInvalidAgendaId);
      alert("모든 안건의 표결 또는 평가 점수를 직접 선택해 주세요.");
      return;
    }

    if (!voterToken) {
      alert("인증 세션이 만료되었습니다. 다시 인증해 주세요.");
      setIsAuthorized(false);
      return;
    }

    try {
      await submitCommitteeVote(voterToken, {
        idempotency_key: createIdempotencyKey(),
        signature_data_url: canvas.toDataURL("image/png"),
        votes: validation.items
      });
      localStorage.removeItem(`local_meeting_draft_${meeting.id}_${authMember.name}`);
      setHasSubmitted(true);
      alert("전자서명 및 의결 표결이 최종 제출되었습니다.");
    } catch (e: any) {
      console.error(e);
      alert(getCommitteeVoteErrorMessage(e));
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
    const committeeSystemName = getCommitteeSystemName(meeting?.committee_id);
    const committeeCode = buildCommitteeHumanCode({
      committeeId: meeting?.committee_id,
      title: meeting?.title,
      meetingDate: meeting?.meeting_date
    });

    return (
      <main className="committee-login-page">
        <section className="committee-login-hero" aria-label="위원회 보안 안내">
          <div className="committee-login-brand">
            <span className="committee-login-brand-mark">
              <img src="/logo.png" alt="" aria-hidden="true" />
            </span>
            <span
              className="committee-login-brand-copy"
              aria-label={`울산과학대학교 앵커사업단 ${committeeSystemName}`}
            >
              <strong>울산과학대학교 앵커사업단</strong>
              <small>{committeeSystemName}</small>
            </span>
          </div>

          <div className="committee-login-hero-content">
            <span className="committee-login-eyebrow">SECURE COMMITTEE</span>
            <h1>자료 검토부터<br />심의와 서명까지</h1>
            <p>위원별 보안코드와 비공개 PDF 열람으로 안전하게 심의에 참여하세요.</p>

            <div className="committee-login-trust-grid">
              <div className="committee-login-trust-card">
                <FileText size={24} aria-hidden="true" />
                <strong>PDF 보안 열람</strong>
                <span>권한 확인 후 단기 링크</span>
              </div>
              <div className="committee-login-trust-card">
                <ShieldCheck size={24} aria-hidden="true" />
                <strong>심의 증적 보존</strong>
                <span>제출·서명 감사 추적</span>
              </div>
            </div>
          </div>

          <p className="committee-login-environment">인가된 위원만 접근할 수 있는 보안 심의 환경입니다.</p>
        </section>

        <section className="committee-login-access" aria-label="외부위원 로그인">
          <div className="committee-login-access-inner">
            <div className="committee-login-lock">
              <Lock size={30} strokeWidth={2.25} aria-hidden="true" />
            </div>
            <span className="committee-login-access-label">MEMBER ACCESS</span>
            <h2>위원 로그인</h2>
            <p className="committee-login-access-description">
              해당 위원회의 위원 성명과 안내받은 6자리 보안코드를 입력해 주세요.
            </p>

            <form className="committee-login-form" onSubmit={handleAuthSubmit}>
              <label htmlFor="committee-access-code">위원회 코드</label>
              <input
                id="committee-access-code"
                type="text"
                value={committeeCode}
                readOnly
                aria-readonly="true"
                className="form-input committee-login-input committee-login-input-readonly"
              />

              <label htmlFor="committee-member-code">위원 성명</label>
              <input
                id="committee-member-code"
                type="text"
                value={loginForm.name}
                onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                placeholder="해당 위원회 위원만 가능합니다."
                autoComplete="name"
                className="form-input committee-login-input"
              />

              <label htmlFor="committee-security-code">보안코드</label>
              <input
                id="committee-security-code"
                type="password"
                value={loginForm.pin}
                onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value })}
                placeholder="안내받은 6자리 숫자를 입력해 주세요."
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="off"
                className="form-input committee-login-input"
              />

              <button type="submit" className="committee-login-submit">
                <span>위원회 입장</span>
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            </form>

            <p className="committee-login-security-note">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>5회 연속 실패하면 15분간 로그인이 제한됩니다. 보안코드를 다른 사람과 공유하지 마세요.</span>
            </p>
          </div>
        </section>
      </main>
    );
  }

  const committeeSystemName = getCommitteeSystemName(meeting?.committee_id);

  return (
    <main className="committee-workspace-page">
      <div className="committee-workspace-shell">
        {/* 상단 회의 헤더 */}
        <header className="committee-workspace-header">
        <div className="committee-workspace-brand">
          <span className="committee-workspace-brand-mark">
            <img src="/logo.png" alt="" aria-hidden="true" />
          </span>
          <span className="committee-workspace-brand-copy">
            <strong>울산과학대학교 앵커사업단</strong>
            <small>{committeeSystemName}</small>
          </span>
        </div>

        <div className="committee-workspace-meeting">
          <span className="committee-workspace-eyebrow">
            <ShieldCheck size={16} aria-hidden="true" />
            SECURE COMMITTEE
          </span>
          <div className="committee-workspace-meta">
            <span>{meeting?.committee_id === "planning" ? "앵커사업단 기획위원회" : "위원회 회의"}</span>
            <time>{meeting?.meeting_date}</time>
          </div>
          <h1>{meeting?.title}</h1>
          {meeting?.location && <p>{meeting.location}</p>}
        </div>

        <div className="committee-workspace-session">
          <span className="committee-workspace-session-label">AUTHENTICATED MEMBER</span>
          <div>
            <span>접속 위원</span>
            <strong>{formatCommitteeMemberDisplay(authMember)}</strong>
          </div>
          <button onClick={handleLogout} className="committee-workspace-logout">
            <LogOut size={16} /> 인증 해제 / 로그아웃
          </button>
        </div>
        </header>

        <div className="committee-workspace-status">
          <span><Lock size={16} aria-hidden="true" /> 인증된 위원 전용 보안 열람 세션</span>
          <span>자료 검토 후 안건별 의결과 서명을 제출해 주세요.</span>
        </div>

        {/* 💡 [전체 1열 카드 레이아웃 구조 개편] */}
        <div className="committee-workspace-content">

        {/* 1. 상정 안건 및 관련 자료 (1열 전체 블록) */}
        <section className="glass-card committee-workspace-card committee-materials-card">
          <div className="committee-workspace-section-heading">
            <div className="committee-workspace-section-icon">
              <FileText size={22} aria-hidden="true" />
            </div>
            <div>
              <span className="committee-workspace-section-label">MEETING MATERIALS</span>
              <h3>상정 안건 및 관련 자료</h3>
              <p>안건을 선택하고 첨부된 보안 문서를 검토해 주세요.</p>
            </div>
          </div>

          {selectedMeetingAgendas.length > 0 ? (
            /* 그 안에서 2열 그리드: 왼쪽(드롭다운 + 안건설명), 오른쪽(첨부파일 + PDF 뷰어) */
            <div className="committee-materials-grid">

              {/* 왼쪽 영역: 드롭다운 + 안건 정보 */}
              <div className="committee-materials-agenda">
                <div className="committee-materials-field">
                  <label htmlFor="a11y-committee-external-vote-1" style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-secondary)" }}>
                    📋 열람할 상정 의안 선택 ({selectedMeetingAgendas.length}건 중)
                  </label>
                  <select id="a11y-committee-external-vote-1"
                    className="committee-materials-select"
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
                  <div className="committee-materials-detail" style={{ padding: "0.85rem", borderRadius: "8px", background: "rgba(59, 130, 246, 0.06)", borderLeft: "4px solid var(--accent-color)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
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
              <div className="committee-materials-viewer-column">
                {currentFileName ? (
                  <>
                    <div className="committee-materials-file-bar" style={{ fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                      <span style={{ color: "var(--accent-color)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        📎 첨부 파일: {
                          currentFileName?.includes("|")
                            ? currentFileName.split("|")[activeAgendaIndex || 0]?.trim()
                            : currentFileName?.includes(",")
                              ? currentFileName.split(",")[activeAgendaIndex || 0]?.trim()
                              : currentFileName
                        }
                      </span>
                    </div>
                    <div ref={viewerRef} className="committee-materials-viewer" style={{ width: "100%", height: "480px", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
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
                  <div className="committee-materials-empty" style={{ height: "100%", minHeight: "250px", border: "1px dashed var(--border-color)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    등록된 첨부 심의 자료가 없습니다.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>상정된 의안이 없습니다.</p>
          )}
        </section>

        {/* 2. 의결 표결 카드 (1열 독립 블록 - 의안별 별도 표결) */}
        <section className="glass-card committee-workspace-card committee-voting-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
            <Vote size={22} style={{ color: "var(--accent-color)" }} />
            <span>의결 표결 (안건별 표결)</span>
          </h3>

          {hasSubmitted ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "3rem 1rem", textAlign: "center", color: "#10b981" }}>
              <Check size={56} />
              <h4 style={{ fontSize: "1.25rem", fontWeight: "800" }}>의결 표결이 완료되었습니다.</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                제출해주신 의결 결과 및 자필 암호화 전자서명이 안전하게 수합 처리되었습니다.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setHasSubmitted(false);
                }}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.55rem 1.25rem",
                  fontSize: "0.88rem",
                  fontWeight: "bold",
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid var(--accent-color)",
                  color: "var(--accent-color)",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                ✏️ 의결 내역 및 서명 수정하기
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {selectedMeetingAgendas.map((agenda, index) => {
                const currentInp = agendaInputs[agenda.id] || { vote: "", score: 0, opinion: "" };
                const isCurrentActive = String(agenda.id) === String(activeAgendaId);

                return (
                  <div
                    key={agenda.id}
                    className={`committee-vote-agenda-card${isCurrentActive ? " is-active" : ""}`}
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
                          ★ 5점 척도 평점 선택 (현재 평가: {currentInp.score ? `${currentInp.score}점` : "미선택"})
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.4rem" }}>
                          {[1, 2, 3, 4, 5].map(scoreVal => (
                            <button
                              key={scoreVal}
                              type="button"
                              className={`committee-score-button${currentInp.score === scoreVal ? " is-selected" : ""}`}
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
                                border: currentInp.score === scoreVal ? "2px solid #3b82f6" : "1px solid var(--border-color)",
                                background: currentInp.score === scoreVal ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" : "rgba(255,255,255,0.05)",
                                color: currentInp.score === scoreVal ? "#ffffff" : "var(--text-secondary)",
                                fontWeight: "bold",
                                cursor: "pointer",
                                boxShadow: currentInp.score === scoreVal ? "0 4px 10px rgba(59, 130, 246, 0.3)" : "none"
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
                          className={`committee-decision-button approve${currentInp.vote === "APPROVE" ? " is-selected" : ""}`}
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
                          className={`committee-decision-button reject${currentInp.vote === "REJECT" ? " is-selected" : ""}`}
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
                          className={`committee-decision-button abstain${currentInp.vote === "ABSTAIN" ? " is-selected" : ""}`}
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
                        className="committee-vote-opinion"
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
        </section>

        {/* 3. 자필 서명 카드 (1열 독립 블록) */}
        {!hasSubmitted && (
          <section className="glass-card committee-workspace-card committee-signature-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="committee-signature-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <label htmlFor="a11y-committee-external-vote-2" style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Lock size={20} style={{ color: "var(--accent-color)" }} />
                <span>자필 서명 (AES 암호화 보안 저장)</span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "normal" }}>(모바일/패드 멀티터치 지원)</span>
              </label>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input id="a11y-committee-external-vote-2"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSignatureFileUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="committee-signature-upload"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "var(--accent-color)", background: "rgba(59, 130, 246, 0.1)", border: "1px solid var(--accent-color)", borderRadius: "6px", padding: "0.35rem 0.75rem", cursor: "pointer", fontWeight: "700" }}
                >
                  <Upload size={14} />
                  <span>서명 파일 업로드</span>
                </button>

                <button
                  type="button"
                  className="committee-signature-clear"
                  onClick={clearCanvas}
                  style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "6px", padding: "0.35rem 0.75rem", cursor: "pointer", fontWeight: "700" }}
                >
                  <RefreshCw size={14} />
                  <span>지우기</span>
                </button>
              </div>
            </div>

            <div className="committee-signature-pad" style={{ border: "2px dashed var(--border-color)", borderRadius: "10px", background: "#ffffff", touchAction: "none", marginTop: "0.5rem" }}>
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

            {/* 4. 맨 아래에 임시 저장 및 최종 의결 표결/서명 제출 버튼 배치 */}
            <div className="committee-signature-actions" style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
              <button
                type="button"
                className="btn btn-secondary committee-draft-button"
                onClick={() => {
                  try {
                    const targetMId = meetingId || meeting?.id;
                    const memName = authMember?.name || "guest";
                    localStorage.setItem(`local_meeting_draft_${targetMId}_${memName}`, JSON.stringify(agendaInputs));
                    alert("💾 안건별 의결 표결 내역이 임시 저장되었습니다.\n(언제든지 작성 중이던 내용으로 다시 불러와 수정 후 최종 제출하실 수 있습니다.)");
                  } catch {
                    alert("임시 저장에 실패하였습니다.");
                  }
                }}
                style={{
                  width: "180px",
                  padding: "1.05rem",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                💾 임시 저장
              </button>

              <button
                type="button"
                className="btn-primary committee-submit-button"
                onClick={handleSubmitVote}
                style={{
                  flex: 1,
                  padding: "1.05rem",
                  fontSize: "1.1rem",
                  fontWeight: "900",
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
          </section>
        )}

        </div>
      </div>
    </main>
  );
}
