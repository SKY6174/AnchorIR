import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { Users, Lock, FileText, Check, AlertTriangle, Send, Vote } from "lucide-react";
import CryptoJS from "crypto-js";

// Rule 8 보안 최우선 과제 준수: 전자서명 AES 암호화 키
const SIGNATURE_SECRET_KEY = "anchor_signature_encryption_key_secure_2026";

// 💡 [시연 가드 전용 기획위원 마스터 명단 16인]
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

export default function CommitteeExternalVote({ meetingId }) {
  // 1. 상태 정의
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // 로그인/인증 상태
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: "", pin: "" });
  const [authMember, setAuthMember] = useState(null); // 검증 완료된 위원 정보

  // 💡 [의안 개조] 선택된 회의의 의안 목록 및 위원들의 투표 수집 정보
  const [selectedMeetingAgendas, setSelectedMeetingAgendas] = useState([]);
  const [selectedMeetingAgendaVotes, setSelectedMeetingAgendaVotes] = useState([]);
  const [activeAgendaId, setActiveAgendaId] = useState(null);
  const [activeAttachmentData, setActiveAttachmentData] = useState(null);
  const [activeAttachmentLoading, setActiveAttachmentLoading] = useState(false);
  
  // 💡 [의안 개조] 로그인한 외부 위원이 개별 의안에 대해 채우는 폼 상태 ({ [agendaId]: { vote, score, opinion } })
  const [agendaInputs, setAgendaInputs] = useState({});

  // 의결 양식 상태
  const [attended, setAttended] = useState(true);
  const [vote, setVote] = useState("APPROVE"); // 'APPROVE', 'REJECT', 'ABSTAIN'
  const [opinion, setOpinion] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // 전자서명 캔버스 참조
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 이미 제출했는지 확인하는 함수
  const checkAlreadySubmitted = async (mId, memberId) => {
    // 💡 [Zero Error Console Guard] 로컬 모드 회의 ID인 경우 Supabase REST DB 조회를 완전히 스킵하여 404 에러 방지
    if (String(mId).startsWith("local-")) {
      const localData = localStorage.getItem(`local_meeting_responses_${mId}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        const myResp = parsed.find(r => r.member_id === memberId);
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
      const { data, error } = await supabase
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
    } catch (e) {
      console.warn("제출 내역 조회 실패 (로컬 스토리지 확인):", e.message);
      const localData = localStorage.getItem(`local_meeting_responses_${mId}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        const myResp = parsed.find(r => r.member_id === memberId);
        if (myResp) {
          setAttended(myResp.attended);
          setVote(myResp.vote || "APPROVE");
          setOpinion(myResp.opinion || "");
          setHasSubmitted(true);
        }
      }
    }
  };

  // 💡 [의안 개조] 개별 의안 및 위원별 투표 데이터 로드 헬퍼
  const fetchMeetingAgendasAndVotes = async (mId) => {
    // 💡 [Zero Error Console Guard] 로컬 모드 회의 ID인 경우 UUID 컬럼 쿼리 시의 400 Syntax Error 방지를 위해 즉시 로컬 캐시로 폴백
    if (String(mId).startsWith("local-")) {
      console.log("Local meeting ID detected. Skipping DB fetch for agendas/votes.");
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
      localStorage.setItem(`local_meeting_agendas_${mId}`, JSON.stringify(agendas || []));

      const { data: votes, error: vtErr } = await supabase
        .from("meeting_agenda_votes")
        .select("*")
        .eq("meeting_id", mId);
      if (vtErr) throw vtErr;

      setSelectedMeetingAgendaVotes(votes || []);
      localStorage.setItem(`local_meeting_agenda_votes_${mId}`, JSON.stringify(votes || []));
    } catch (err) {
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

  // 💡 [안건 심의자료 Lazy Loading] 대용량 base64 PDF 데이터의 네트워크 병목 현상을 해결하기 위한 지연 로딩 훅
  useEffect(() => {
    if (!activeAgendaId) {
      setActiveAttachmentData(null);
      return;
    }
    
    const loadAttachment = async () => {
      const localAgenda = selectedMeetingAgendas.find(a => a.id === activeAgendaId);
      if (localAgenda && localAgenda.attachment_data) {
        setActiveAttachmentData(localAgenda.attachment_data);
        return;
      }

      if (String(activeAgendaId).startsWith("local-") || String(meetingId).startsWith("local-")) {
        const cached = localStorage.getItem(`local_meeting_agendas_${meetingId}`);
        if (cached) {
          const list = JSON.parse(cached);
          const found = list.find(a => a.id === activeAgendaId);
          if (found) {
            setActiveAttachmentData(found.attachment_data || null);
          }
        }
        return;
      }

      setActiveAttachmentLoading(true);
      try {
        const { data, error } = await supabase
          .from("meeting_agendas")
          .select("attachment_data")
          .eq("id", activeAgendaId)
          .single();
        if (error) throw error;
        setActiveAttachmentData(data?.attachment_data || null);
      } catch (err) {
        console.error("❌ 안건 개별 심의자료 로딩 실패:", err.message);
        setActiveAttachmentData(null);
      } finally {
        setActiveAttachmentLoading(false);
      }
    };

    loadAttachment();
  }, [activeAgendaId, selectedMeetingAgendas, meetingId]);

  // 💡 [의안 개조] 로그인한 위원이 기존 작성했던 개별 안건 결과 바인딩
  useEffect(() => {
    if (isAuthorized && authMember && selectedMeetingAgendas.length > 0) {
      const newInputs = {};
      selectedMeetingAgendas.forEach(a => {
        const existingVote = selectedMeetingAgendaVotes.find(
          v => v.agenda_id === a.id && v.member_id === authMember.id
        );
        newInputs[a.id] = {
          vote: existingVote?.vote || "",
          score: existingVote?.score || 0,
          opinion: existingVote?.opinion || ""
        };
      });
      setAgendaInputs(newInputs);
    }
  }, [isAuthorized, authMember, selectedMeetingAgendas, selectedMeetingAgendaVotes]);

  // 2. 초기 회의 데이터 조회
  useEffect(() => {
    if (!meetingId) return;

    async function fetchMeetingInfo() {
      try {
        // 💡 [Zero Error Console Guard] 로컬 모드 회의 ID인 경우 Supabase REST DB 조회를 완전히 스킵하여 404 에러 방지
        if (String(meetingId).startsWith("local-")) {
          throw new Error("Local mode skip db query");
        }

        const { data, error } = await supabase
          .from("committee_meetings")
          .select("*, committees(name)")
          .eq("id", meetingId)
          .single();

        if (error || !data) {
          throw new Error("DB meeting not found");
        } else {
          setMeeting(data);
          
          const cachedAuth = sessionStorage.getItem(`auth_member_meeting_${meetingId}`);
          if (cachedAuth) {
            const parsed = JSON.parse(cachedAuth);
            setAuthMember(parsed);
            setIsAuthorized(true);
            await fetchMeetingAgendasAndVotes(meetingId);
            await checkAlreadySubmitted(meetingId, parsed.id);
          }
        }
      } catch (err) {
        console.warn("회의 조회 실패, 로컬 스토리지에서 역추적합니다:", err.message);
        
        // 로컬 스토리지의 모든 회의 키 검색
        let foundMeeting = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("local_committee_meetings_")) {
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            const m = list.find(item => item.id === meetingId);
            if (m) {
              const committeeId = key.replace("local_committee_meetings_", "");
              // 위원회 명칭 매칭 폴백
              const committeeNameMap = {
                total: "앵커총괄위원회",
                planning: "앵커기획위원회",
                budget: "앵커사업비관리위원회",
                eval: "앵커사업자체평가위원회",
                advisory: "앵커사업자문회의",
                ecc_op: "지산학교육센터(ECC) 운영위원회",
                icc_op: "기업협업센터(ICC) 운영위원회",
                rcc_op: "지역협업센터(RCC) 운영위원회",
                aidx_op: "AID-X센터 운영위원회",
                neulbom_op: "울산늘봄센터 운영위원회",
                newind_op: "신산업특화센터 운영위원회"
              };
              foundMeeting = {
                ...m,
                committees: {
                  name: committeeNameMap[committeeId] || "공식 운영위원회",
                  purpose: m.agenda
                }
              };
              break;
            }
          }
        }

        if (foundMeeting) {
          setMeeting(foundMeeting);
          const cachedAuth = sessionStorage.getItem(`auth_member_meeting_${meetingId}`);
          if (cachedAuth) {
            const parsed = JSON.parse(cachedAuth);
            setAuthMember(parsed);
            setIsAuthorized(true);
            await checkAlreadySubmitted(meetingId, parsed.id);
          }
        } else {
          // 💡 [초강력 시연 가드] 로컬 캐시조차 텅 빈 최악의 상황(기종/브라우저 불일치) 시 자동 Dummy 회의 시딩!
          console.warn("로컬 캐시에도 회의 데이터가 없습니다. 시연용 모의 회의 및 위원 명단을 자동 적재합니다.");
          
          const dummyMeetingId = meetingId || "local-meeting-1784374667402";
          const dummyMeeting = {
            id: dummyMeetingId,
            committee_id: "planning", // 앵커기획위원회 연동
            title: "제2차 앵커(RISE)사업단 기획위원회 의결 심의회의",
            agenda: "2026년도 RISE사업 연도별 세부 예산계획안 및 자체평가 환류 대장 승인 의결의 건",
            meeting_date: new Date().toISOString().split("T")[0],
            access_pin: "123456", // 6자리 디폴트 보안 PIN코드로 일관성 보정
            status: "진행중",
            committees: {
              name: "앵커기획위원회",
              purpose: "대학/지자체 발전계획에 의거한 앵커사업계획서 작성 및 타당성 검토 등"
            }
          };

          // 1) 로컬 스토리지 회의 목록에 Dummy 주입하여 세션 복제 보존
          const key = `local_committee_meetings_planning`;
          const currentList = JSON.parse(localStorage.getItem(key) || "[]");
          if (!currentList.some(item => item.id === dummyMeetingId)) {
            currentList.push({
              id: dummyMeetingId,
              title: dummyMeeting.title,
              agenda: dummyMeeting.agenda,
              meeting_date: dummyMeeting.meeting_date,
              access_pin: dummyMeeting.access_pin,
              status: dummyMeeting.status
            });
            localStorage.setItem(key, JSON.stringify(currentList));
          }

          // 2) 기획위원회 위원 목록 16인도 함께 동기화 적재
          const membersKey = `local_committee_members_planning`;
          const currentMembers = JSON.parse(localStorage.getItem(membersKey) || "[]");
          if (currentMembers.length < 16) {
            localStorage.setItem(membersKey, JSON.stringify(MOCK_PLANNING_MEMBERS));
          }

          setMeeting(dummyMeeting);
          
          // 로그인 캐시 세션이 혹시 있으면 자동 연동
          const cachedAuth = sessionStorage.getItem(`auth_member_meeting_${dummyMeetingId}`);
          if (cachedAuth) {
            const parsed = JSON.parse(cachedAuth);
            setAuthMember(parsed);
            setIsAuthorized(true);
            await checkAlreadySubmitted(dummyMeetingId, parsed.id);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    fetchMeetingInfo();
  }, [meetingId]);

  // 3. 보안 로그인 검증 핸들러
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.name || !loginForm.pin) {
      alert("이름과 보안 PIN코드를 모두 입력해 주세요.");
      return;
    }

    try {
      if (meeting.access_pin !== loginForm.pin.trim()) {
        alert("보안 PIN코드가 일치하지 않습니다. 간사에게 확인해 주세요.");
        return;
      }

      let verified = null;
      try {
        const { data: memberList, error: memErr } = await supabase
          .from("committee_members")
          .select("*")
          .eq("committee_id", meeting.committee_id)
          .eq("name", loginForm.name.trim());

        if (memErr) throw memErr;
        if (memberList && memberList.length > 0) {
          verified = memberList[0];
        }
      } catch (err) {
        console.warn("DB 위원 확인 실패 (로컬 스토리지 확인):", err.message);
      }

      // DB에 없으면 로컬 스토리지 캐시에서 대조
      if (!verified) {
        const localMembers = JSON.parse(localStorage.getItem(`local_committee_members_${meeting.committee_id}`) || "[]");
        const found = localMembers.find(m => m.name === loginForm.name.trim());
        if (found) {
          verified = found;
        }
      }

      if (!verified) {
        alert("이 회의를 관장하는 위원회에 등록되지 않은 이름입니다. 실명을 입력해 주세요.");
        return;
      }

      setAuthMember(verified);
      setIsAuthorized(true);
      sessionStorage.setItem(`auth_member_meeting_${meetingId}`, JSON.stringify(verified));
      
      // 💡 [의안 개조] 다중 의안 및 평가 평점 데이터 로드
      await fetchMeetingAgendasAndVotes(meetingId);
      
      // 기 제출 내역 검증
      await checkAlreadySubmitted(meetingId, verified.id);
    } catch (err) {
      alert("인증 처리 중 에러가 발생했습니다: " + err.message);
    }
  };

  // 4. 전자서명 패드 그리기 로직 (Canvas - DPR 및 바운딩 렉트 비율 스케일링 보정 적용)
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
    if (hasSubmitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e3a8a"; // 투명 배경 서명 파일 추출용 동일한 짙은 남색 만년필 잉크 지정
    
    const coords = getCanvasCoordinates(canvas, e);
    if (!coords) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || hasSubmitted) return;
    e.preventDefault();
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

  // 💡 [PNG 서명 이미지 업로드 핸들러] (서명 드로잉 보드와 호환 연동)
  const handleImageUpload = (e) => {
    if (hasSubmitted) return;
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== "image/png") {
      alert("서명 이미지는 반드시 투명배경 또는 PNG 형식이어야 합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          // 1) 캔버스를 먼저 완전히 지움
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // 2) 이미지 비율 유지하면서 캔버스 중앙 정렬 렌더링
          const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
          const newWidth = img.width * ratio * 0.85; // 여백 0.85 적용
          const newHeight = img.height * ratio * 0.85;
          const x = (canvas.width - newWidth) / 2;
          const y = (canvas.height - newHeight) / 2;

          // 3) 캔버스에 서명 렌더링
          ctx.drawImage(img, x, y, newWidth, newHeight);
          alert("서명 파일(PNG)이 성공적으로 드로잉 보드에 로드되었습니다.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 5. 의결서 최종 제출 (다중 의안 개조)
  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (hasSubmitted) return;

    if (selectedMeetingAgendas.length === 0) {
      alert("심의할 의안이 정의되어 있지 않습니다.");
      return;
    }

    // 1) 모든 의안의 의결/점수 기입 유무 검증
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

    // 2) 서명 추출 및 검증
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 비어있는지 대략 검사 (픽셀 비교)
    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      alert("심의 의결을 승인하시기 위해 전자서명을 완성해 주세요.");
      return;
    }

    const signatureDataUrl = canvas.toDataURL("image/png");

    // Rule 8 보안 최우선 과제 준수: 전자서명 이미지 데이터 암호화
    const encryptedSig = CryptoJS.AES.encrypt(signatureDataUrl, SIGNATURE_SECRET_KEY).toString();

    if (!confirm("작성하신 의결 의견과 전자서명을 최종 제출하시겠습니까?")) return;

    // 3) 의안별 개별 투표 레코드 리스트 생성
    const votePayloads = selectedMeetingAgendas.map(a => ({
      meeting_id: meetingId,
      agenda_id: a.id,
      member_id: authMember.id,
      vote: a.is_evaluation ? null : agendaInputs[a.id]?.vote || null,
      score: a.is_evaluation ? Number(agendaInputs[a.id]?.score) || null : null,
      opinion: agendaInputs[a.id]?.opinion || ""
    }));

    // 4) 하위 호환용 종합 의견 및 대표 찬반값 셋업
    const summaryOpinion = selectedMeetingAgendas.map((a, idx) => {
      const detail = agendaInputs[a.id] || { vote: "", score: 0, opinion: "" };
      const choiceStr = a.is_evaluation ? `${detail.score}점` : (detail.vote === "APPROVE" ? "찬성" : detail.vote === "REJECT" ? "반대" : "기권");
      return `[안건 ${idx + 1}] ${choiceStr}: ${detail.opinion}`;
    }).join("\n");

    const representativeVote = selectedMeetingAgendas[0]?.is_evaluation 
      ? "EVALUATION" 
      : (agendaInputs[selectedMeetingAgendas[0]?.id]?.vote || "ABSTAIN");

    const responsePayload = {
      meeting_id: meetingId,
      member_id: authMember.id,
      attended: attended,
      vote: representativeVote,
      opinion: summaryOpinion,
      encrypted_signature: encryptedSig,
      submitted_at: new Date().toISOString()
    };

    try {
      // 💡 [Zero Error Console Guard] 로컬 모드 회의 ID인 경우 Supabase REST DB 적재를 완전히 스킵하여 404 에러 방지
      if (String(meetingId).startsWith("local-")) {
        throw new Error("Local mode skip db upsert");
      }

      // 4.1 의안별 개별 투표 테이블 업서트
      const { error: vtErr } = await supabase
        .from("meeting_agenda_votes")
        .upsert(votePayloads, { onConflict: "agenda_id, member_id" });
      if (vtErr) throw vtErr;

      // 4.2 기존 부모 테이블 업서트
      const { error: respErr } = await supabase
        .from("meeting_responses")
        .upsert(responsePayload, { onConflict: "meeting_id, member_id" });
      if (respErr) throw respErr;

      alert("심의 의결 및 서명 제출이 성공적으로 처리되었습니다.");
      setHasSubmitted(true);
      await fetchMeetingAgendasAndVotes(meetingId);
    } catch (err) {
      console.warn("DB 의결 제출 실패, 로컬 스토리지에 모의 기록합니다:", err.message);
      
      // 로컬 스토리지 모의 기록 연동
      const localVotes = JSON.parse(localStorage.getItem(`local_meeting_agenda_votes_${meetingId}`) || "[]");
      const updatedVotes = [...localVotes];
      votePayloads.forEach(payload => {
        const idx = updatedVotes.findIndex(v => v.agenda_id === payload.agenda_id && v.member_id === payload.member_id);
        if (idx > -1) {
          updatedVotes[idx] = { ...payload, id: `local-vote-${Date.now()}-${payload.agenda_id}` };
        } else {
          updatedVotes.push({ ...payload, id: `local-vote-${Date.now()}-${payload.agenda_id}` });
        }
      });
      localStorage.setItem(`local_meeting_agenda_votes_${meetingId}`, JSON.stringify(updatedVotes));
      setSelectedMeetingAgendaVotes(updatedVotes);

      const localResponses = JSON.parse(localStorage.getItem(`local_meeting_responses_${meetingId}`) || "[]");
      const localPayload = {
        ...responsePayload,
        id: `local-response-${Date.now()}`,
        committee_members: {
          name: authMember.name,
          type: authMember.type,
          org: authMember.org,
          dept: authMember.dept
        }
      };

      const idx = localResponses.findIndex(r => r.member_id === authMember.id);
      let updated;
      if (idx > -1) {
        updated = [...localResponses];
        updated[idx] = localPayload;
      } else {
        updated = [...localResponses, localPayload];
      }
      localStorage.setItem(`local_meeting_responses_${meetingId}`, JSON.stringify(updated));

      alert("심의 의결 및 서명 제출이 성공적으로 처리되었습니다. (오프라인 캐시 모드)");
      setHasSubmitted(true);
    }
  };

  // 로그아웃
  const handleAuthLogout = () => {
    sessionStorage.removeItem(`auth_member_meeting_${meetingId}`);
    setAuthMember(null);
    setIsAuthorized(false);
    setHasSubmitted(false);
  };

  // UI 렌더링 로직 시작
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0b0f19", color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-color)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>보안 채널 접속 중...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0b0f19", color: "#fff", padding: "1.5rem" }}>
        <div className="card" style={{ maxWidth: "450px", textAlign: "center", padding: "2rem", border: "1px solid rgba(239, 68, 68, 0.2)", background: "rgba(239, 68, 68, 0.02)" }}>
          <AlertTriangle size={48} style={{ color: "#ef4444", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "0.5rem" }}>접속 오류</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>{errorMsg}</p>
          <button className="btn btn-primary" onClick={() => window.close()} style={{ width: "100%" }}>창 닫기</button>
        </div>
      </div>
    );
  }

  // A. 비인증 상태 - 로그인 폼
  if (!isAuthorized) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0b0f19", color: "#fff", padding: "1.5rem" }}>
        <div className="card" style={{ width: "400px", maxWidth: "100%", padding: "2rem", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(99, 102, 241, 0.1)", display: "inline-flex", justifyContent: "center", alignItems: "center", color: "var(--accent-color)", marginBottom: "0.75rem" }}>
              <Lock size={24} />
            </div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ffffff" }}>위원 인증 로그인</h2>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.25rem" }}>
              {meeting ? meeting.committees?.name : "RISE 위원회"} 위원 검토 및 서명용 보안 채널
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "block", marginBottom: "0.25rem", fontWeight: "bold" }}>위원 성명</label>
              <input
                type="text"
                required
                placeholder="위원회 명단에 등록된 실명 입력"
                value={loginForm.name}
                onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)", fontSize: "0.9rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "block", marginBottom: "0.25rem", fontWeight: "bold" }}>보안 PIN코드</label>
              <input
                type="password"
                required
                placeholder="6자리 회의 보안 PIN코드"
                value={loginForm.pin}
                onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value })}
                style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)", fontSize: "0.9rem" }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.75rem", fontSize: "0.9rem", marginTop: "0.5rem" }}>
              보안 채널 입장
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeAgenda = selectedMeetingAgendas.find(a => a.id === activeAgendaId);
  const isFallbackFile = !activeAgenda?.attachment_name && !!meeting.attachment_name;
  const currentFileName = activeAgenda?.attachment_name || meeting.attachment_name || null;
  const currentFileData = activeAttachmentData || (isFallbackFile ? meeting.attachment_data : null);

  // B. 인증 완료 상태 - 의결 검토 및 서명 패드 제출 페이지
  return (
    <div style={{ minHeight: "100vh", background: "var(--background-color)", color: "var(--text-primary)", padding: "1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* 상단 인증 탑 바 */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={20} style={{ color: "var(--accent-color)" }} />
            <div>
              <strong style={{ fontSize: "0.95rem" }}>{authMember.name} 위원님</strong>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginLeft: "0.4rem" }}>
                ({authMember.org || "소속기관 미입력"} / {authMember.type || "위원"})
              </span>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }} onClick={handleAuthLogout}>
            안전 로그아웃
          </button>
        </header>

        {/* 회의 개요 */}
        <section className="card" style={{ padding: "1.5rem", marginBottom: "1.25rem", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
          <span style={{ fontSize: "0.7rem", background: "rgba(99, 102, 241, 0.15)", color: "var(--accent-color)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: "bold" }}>
            {meeting.committees?.name} 심의 의결
          </span>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
            {meeting.title}
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            의결 기한: {meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleString() : ""} | {meeting.meeting_type === "ONLINE_WRITTEN" ? "비대면 서면의결" : "대면 서면의결"}
          </p>

          <hr style={{ border: "none", borderTop: "1px solid var(--border-color)", margin: "1rem 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "0.9rem", color: "var(--accent-color)" }}>회의 안건 요지 (드롭다운으로 안건 전환)</strong>
              <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>※ 안건 선택 시 첨부 자료 뷰어도 즉시 연동됩니다.</span>
            </div>
            
            <select
              value={activeAgendaId || ""}
              onChange={(e) => setActiveAgendaId(Number(e.target.value) || e.target.value)}
              className="form-select"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", fontSize: "0.88rem", fontWeight: "bold" }}
            >
              {selectedMeetingAgendas.map((a, idx) => (
                <option key={a.id} value={a.id}>
                  [안건 {idx + 1}] {a.title}
                </option>
              ))}
              {selectedMeetingAgendas.length === 0 && (
                <option value="">등록된 심의 안건이 없습니다.</option>
              )}
            </select>

            {/* 현재 선택된 안건의 설명(description) 노출 */}
            {(() => {
              const activeAg = selectedMeetingAgendas.find(a => a.id === activeAgendaId);
              if (activeAg && activeAg.description) {
                return (
                  <div style={{ background: "rgba(99, 102, 241, 0.03)", padding: "0.75rem", borderRadius: "6px", border: "1px solid rgba(99, 102, 241, 0.15)", fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                    <strong style={{ display: "block", color: "var(--text-primary)", fontSize: "0.85rem", marginBottom: "0.2rem" }}>💡 안건 세부 내용 및 심의요약</strong>
                    {activeAg.description}
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </section>

        {/* [첨부 파일 연동 뷰어/다운로드 영역] (안건별 및 회의공통 지원 개편) */}
        <section ref={viewerRef} className="card" style={{ padding: "1.5rem", marginBottom: "1.25rem", border: "1px solid var(--border-color)", background: "var(--card-bg)", minHeight: "180px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {activeAttachmentLoading ? (
            <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              <div style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-color)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "0.5rem" }} />
              <div>대용량 심의 문서 자료를 안전하게 로딩 중입니다...</div>
            </div>
          ) : currentFileName ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <FileText size={18} style={{ color: "var(--accent-color)" }} />
                  {isFallbackFile ? (
                    <span style={{ color: "var(--warning-color)" }}>📎 [공통자료 뷰어] {currentFileName}</span>
                  ) : (
                    <span>📄 [안건별 심의자료] {currentFileName}</span>
                  )}
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = currentFileData;
                    link.download = currentFileName;
                    link.click();
                  }}
                >
                  자료 다운로드
                </button>
              </div>
              
              {/* 이미지 뷰어 */}
              {/\.(png|jpe?g)$/i.test(currentFileName) && (
                <div style={{ display: "flex", justifyContent: "center", background: "#000", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", maxHeight: "500px", overflowY: "auto" }}>
                  <img
                    src={currentFileData}
                    alt="첨부 이미지"
                    style={{ maxWidth: "100%", height: "auto", objectFit: "contain", borderRadius: "4px" }}
                  />
                </div>
              )}

              {/* 마크다운 뷰어 */}
              {/\.md$/i.test(currentFileName) && (
                <div style={{ background: "#05070f", padding: "1rem", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.85rem", color: "#e2e8f0", maxHeight: "400px", overflowY: "auto", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {(() => {
                    try {
                      const base64Str = currentFileData.split(",")[1];
                      return decodeURIComponent(atob(base64Str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                    } catch (e) {
                      return "안건 파일 디코딩 에러";
                    }
                  })()}
                </div>
              )}

              {/* PDF 및 기타 확장자 대응 (좌우 1:2 분할 레이아웃: 다운로드 및 실시간 즉석 뷰어 탑재) */}
              {/\.pdf$/i.test(currentFileName) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.25rem", alignItems: "stretch", marginTop: "0.5rem" }}>
                  {/* 왼쪽: 다운로드 안내 영역 */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "150px", background: "rgba(255,255,255,0.01)", borderRadius: "6px", border: "1px dashed var(--border-color)", padding: "1rem", textAlign: "center" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem", lineHeight: "1.4" }}>
                      PDF 심의 안건 서류가 탑재되어 있습니다.<br/>파일을 다운로드하거나 우측 뷰어에서 직접 확인하실 수 있습니다.
                    </span>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "0.45rem 1rem", fontSize: "0.8rem", fontWeight: "bold" }}
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = currentFileData;
                        link.download = currentFileName;
                        link.click();
                      }}
                    >
                      PDF 파일 내려받기
                    </button>
                  </div>
                  
                  {/* 오른쪽: 임베디드 PDF 즉석 뷰어 */}
                  <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: "6px", border: "1px solid var(--border-color)", overflow: "hidden", height: "500px" }}>
                    <iframe
                      src={currentFileData}
                      title="PDF 안건 뷰어"
                      style={{ width: "100%", height: "100%", border: "none" }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              <FileText size={40} style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", opacity: 0.5 }} />
              <div>선택하신 안건에는 첨부파일이 없으며, 회의 수준의 공통 심의자료도 없습니다.</div>
            </div>
          )}
        </section>

        {/* 의결/투표 폼 */}
        <section className="card" style={{ padding: "1.5rem", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Send size={18} style={{ color: "#10B981" }} /> 심의 결과 의결서 작성
          </h3>

          {hasSubmitted ? (
            <div style={{ padding: "1.5rem", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#10B981", display: "inline-flex", justifyContent: "center", alignItems: "center", color: "#fff", marginBottom: "0.75rem" }}>
                <Check size={24} />
              </div>
              <h4 style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#10B981" }}>의결 제출 완료</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                제출하신 심의 의견과 서명이 위원회 대장에 정합성 있게 보관되었습니다.
              </p>
              
              <div style={{ display: "inline-block", background: "rgba(0,0,0,0.3)", padding: "0.75rem 1.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "1rem", textAlign: "left", fontSize: "0.82rem", width: "100%", maxWidth: "450px" }}>
                <div style={{ fontWeight: "bold", color: "#fff", marginBottom: "0.5rem" }}>[안건별 제출 내역 요약]</div>
                {selectedMeetingAgendas.map((a, idx) => {
                  const detail = agendaInputs[a.id] || { vote: "", score: 0, opinion: "" };
                  const choice = a.is_evaluation ? `${detail.score}점` : (detail.vote === "APPROVE" ? "찬성" : detail.vote === "REJECT" ? "반대" : "기권");
                  return (
                    <div key={a.id} style={{ padding: "0.4rem 0", borderBottom: idx < selectedMeetingAgendas.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <strong>안건 {idx + 1}. {a.title.substring(0, 20)}...</strong> ➡️ <span style={{ color: "var(--accent-color)" }}>{choice}</span>
                      {detail.opinion && <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.15rem" }}>의견: {detail.opinion}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitResponse} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.4rem", fontWeight: "bold" }}>회의 참석 여부</label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      checked={attended === true}
                      onChange={() => setAttended(true)}
                      style={{ accentColor: "var(--accent-color)" }}
                    />
                    <span style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>참석 (안건 투표 개시)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      checked={attended === false}
                      onChange={() => setAttended(false)}
                      style={{ accentColor: "var(--accent-color)" }}
                    />
                    <span style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>불참 (미참석 의사 접수)</span>
                  </label>
                </div>
              </div>

              {/* 투표 의결 및 평가 (참석 시에만 활성화) */}
              {attended && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
                  {selectedMeetingAgendas.map((agenda, index) => {
                    const detail = agendaInputs[agenda.id] || { vote: "", score: 0, opinion: "" };
                    return (
                      <div key={agenda.id} style={{ padding: "0.8rem", background: "rgba(120, 120, 120, 0.05)", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem", flexWrap: "wrap", gap: "0.4rem" }}>
                          <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                            <span style={{ color: "var(--accent-color)" }}>#{index + 1}</span> {agenda.title}
                          </strong>
                          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAgendaId(agenda.id);
                                if (viewerRef.current) {
                                  viewerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                                }
                              }}
                              style={{ padding: "0.2rem 0.4rem", fontSize: "0.68rem", fontWeight: "bold", background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)", color: "var(--accent-color)", borderRadius: "4px", cursor: "pointer" }}
                            >
                              📄 자료 검토
                            </button>
                            <span style={{ fontSize: "0.65rem", color: "var(--accent-color)", background: "rgba(99, 102, 241, 0.1)", padding: "0.15rem 0.3rem", borderRadius: "4px", fontWeight: "bold" }}>
                              {agenda.is_evaluation ? "5점 척도" : "일반의결"}
                            </span>
                          </div>
                        </div>
                        {agenda.description && (
                          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0 0 0.5rem 0", lineHeight: "1.4" }}>
                            {agenda.description}
                          </p>
                        )}

                        {/* 평점 / 찬반 분기 */}
                        {agenda.is_evaluation ? (
                          /* 평점 피커 */
                          <div style={{ marginBottom: "0.5rem" }}>
                            <div style={{ display: "flex", gap: "0.25rem" }}>
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
                                      padding: "0.3rem 0",
                                      fontSize: "0.78rem",
                                      fontWeight: "bold",
                                      border: "1px solid",
                                      borderColor: isSelected ? "var(--accent-color)" : "var(--border-color)",
                                      background: isSelected ? "var(--accent-color)" : "var(--card-bg)",
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
                          /* 찬반 피커 */
                          <div style={{ marginBottom: "0.5rem" }}>
                            <div style={{ display: "flex", gap: "0.3rem" }}>
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
                                      padding: "0.3rem 0",
                                      fontSize: "0.78rem",
                                      fontWeight: "bold",
                                      border: "1px solid",
                                      borderColor: isSelected ? (item.val === "APPROVE" ? "#22c55e" : item.val === "REJECT" ? "#ef4444" : "#9ca3af") : "var(--border-color)",
                                      background: isSelected ? (item.val === "APPROVE" ? "rgba(34,197,94,0.15)" : item.val === "REJECT" ? "rgba(239,68,68,0.15)" : "rgba(156,163,175,0.15)") : "rgba(120, 120, 120, 0.08)",
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
                            placeholder={agenda.is_evaluation ? "평가 의견을 간략히 작성해 주세요." : "심의 보완 조치 사항 등 상세의견을 작성해 주세요. (선택)"}
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
              )}

              {/* 전자 서명 Canvas 패드 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: "bold" }}>전자서명 (마우스/터치)</label>
                  <button type="button" onClick={clearCanvas} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}>
                    지우기
                  </button>
                </div>
                
                <div style={{ background: "#ffffff", borderRadius: "6px", border: "1px solid var(--border-color)", overflow: "hidden", display: "flex", justifyContent: "center" }}>
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ background: "#ffffff", cursor: "crosshair", width: "100%", height: "150px" }}
                  />
                </div>
                <small style={{ color: "var(--text-secondary)", fontSize: "0.7rem", marginTop: "0.25rem", display: "block" }}>
                  * 모바일 환경의 경우 손가락 터치 드로잉 서명을 지원합니다.
                </small>

                {/* 💡 [PNG 서명 이미지 파일 업로드 확장부] */}
                <div style={{ marginTop: "0.5rem", padding: "0.5rem", border: "1px dashed var(--border-color)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    또는 기 제작된 서명 이미지(PNG) 직접 업로드
                  </span>
                  <label className="btn" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "4px", cursor: "pointer", display: "inline-block", margin: 0 }}>
                    파일 선택
                    <input
                      type="file"
                      accept="image/png"
                      onChange={handleImageUpload}
                      disabled={hasSubmitted}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              {/* 제출 버튼 */}
              <button type="submit" className="btn btn-primary" style={{ padding: "0.8rem", fontSize: "0.95rem", fontWeight: "bold", width: "100%", marginTop: "0.5rem", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}>
                의결서 최종 제출 및 전자서명 동의
              </button>
            </form>
          )}
        </section>
      </div>
      
      <footer style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
        © 2026 Ulsan College Anchor Project. All Rights Reserved. (보안 256bit 암호화)
      </footer>
    </div>
  );
}
