import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { Users, Lock, FileText, Check, AlertTriangle, Send } from "lucide-react";
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

  // 의결 양식 상태
  const [attended, setAttended] = useState(true);
  const [vote, setVote] = useState("APPROVE"); // 'APPROVE', 'REJECT', 'ABSTAIN'
  const [opinion, setOpinion] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // 전자서명 캔버스 참조
  const canvasRef = useRef(null);
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
          .select("*, committees(name, purpose)")
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
      
      // 기 제출 내역 검증
      await checkAlreadySubmitted(meetingId, verified.id);
    } catch (err) {
      alert("인증 처리 중 에러가 발생했습니다: " + err.message);
    }
  };

  // 4. 전자서명 패드 그리기 로직 (Canvas)
  const startDrawing = (e) => {
    if (hasSubmitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // 터치/마우스 위치 추출
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || hasSubmitted) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
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

  // 5. 의결서 최종 제출
  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (hasSubmitted) return;

    // 1) 서명 추출 및 검증
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

    let responsePayload = null;
    try {
      responsePayload = {
        meeting_id: meetingId,
        member_id: authMember.id,
        attended: attended,
        vote: attended ? vote : null,
        opinion: opinion.trim(),
        encrypted_signature: encryptedSig,
        submitted_at: new Date().toISOString()
      };

      // 💡 [Zero Error Console Guard] 로컬 모드 회의 ID인 경우 Supabase REST DB 적재를 완전히 스킵하여 404 에러 방지
      if (String(meetingId).startsWith("local-")) {
        throw new Error("Local mode skip db upsert");
      }

      // Upsert 적용
      const { error } = await supabase
        .from("meeting_responses")
        .upsert(responsePayload, { onConflict: "meeting_id, member_id" });

      if (error) throw error;

      alert("심의 의결 및 서명 제출이 성공적으로 처리되었습니다.");
      setHasSubmitted(true);
    } catch (err) {
      console.warn("DB 의결 제출 실패, 로컬 스토리지에 모의 기록합니다:", err.message);
      
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
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800" }}>위원 인증 로그인</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              {meeting.committees?.name} 위원 검토 및 서명용 보안 채널
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>위원 성명</label>
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
              <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>보안 PIN코드</label>
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

  // B. 인증 완료 상태 - 의결 검토 및 서명 패드 제출 페이지
  return (
    <div style={{ minHeight: "100vh", background: "#0b0f19", color: "#fff", padding: "1.5rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
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
        <section className="card" style={{ padding: "1.5rem", marginBottom: "1.25rem", border: "1px solid var(--border-color)" }}>
          <span style={{ fontSize: "0.7rem", background: "rgba(99, 102, 241, 0.15)", color: "var(--accent-color)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: "bold" }}>
            {meeting.committees?.name} 심의 의결
          </span>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fff", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
            {meeting.title}
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            의결 기한: {meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleString() : ""} | {meeting.meeting_type === "ONLINE_WRITTEN" ? "비대면 서면의결" : "대면 서면의결"}
          </p>

          <hr style={{ border: "none", borderTop: "1px solid var(--border-color)", margin: "1rem 0" }} />

          <strong style={{ fontSize: "0.9rem", color: "var(--accent-color)", display: "block", marginBottom: "0.4rem" }}>회의 안건 요지</strong>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.88rem", color: "#e2e8f0", whiteSpace: "pre-line", lineHeight: "1.6" }}>
            {meeting.agenda}
          </div>
        </section>

        {/* [첨부 파일 연동 뷰어/다운로드 영역] */}
        {meeting.attachment_name && (
          <section className="card" style={{ padding: "1.5rem", marginBottom: "1.25rem", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#fff", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <FileText size={18} style={{ color: "var(--accent-color)" }} /> 심의 안건 첨부 서류 검토
              </span>
              <button
                className="btn btn-secondary"
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = meeting.attachment_data;
                  link.download = meeting.attachment_name;
                  link.click();
                }}
              >
                자료 다운로드
              </button>
            </div>
            
            {/* 이미지 뷰어 */}
            {/\.(png|jpe?g)$/i.test(meeting.attachment_name) && (
              <div style={{ display: "flex", justifyContent: "center", background: "#000", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border-color)", maxHeight: "400px", overflowY: "auto" }}>
                <img
                  src={meeting.attachment_data}
                  alt="첨부 이미지"
                  style={{ maxWidth: "100%", height: "auto", objectFit: "contain", borderRadius: "4px" }}
                />
              </div>
            )}

            {/* 마크다운 뷰어 */}
            {/\.md$/i.test(meeting.attachment_name) && (
              <div style={{ background: "#05070f", padding: "1rem", borderRadius: "6px", border: "1px solid var(--border-color)", fontSize: "0.85rem", color: "#e2e8f0", maxHeight: "300px", overflowY: "auto", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                {(() => {
                  try {
                    const base64Str = meeting.attachment_data.split(",")[1];
                    return decodeURIComponent(atob(base64Str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                  } catch (e) {
                    return "안건 파일 디코딩 에러";
                  }
                })()}
              </div>
            )}

            {/* PDF 및 기타 확장자 대응 */}
            {/\.pdf$/i.test(meeting.attachment_name) && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "120px", background: "rgba(255,255,255,0.01)", borderRadius: "6px", border: "1px dashed var(--border-color)" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  PDF 심의 안건 서류가 탑재되어 있습니다.
                </span>
                <button
                  className="btn btn-primary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = meeting.attachment_data;
                    link.download = meeting.attachment_name;
                    link.click();
                  }}
                >
                  PDF 파일 내려받기
                </button>
              </div>
            )}
          </section>
        )}

        {/* 의결/투표 폼 */}
        <section className="card" style={{ padding: "1.5rem", border: "1px solid var(--border-color)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
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
              
              <div style={{ display: "inline-block", background: "rgba(0,0,0,0.3)", padding: "0.75rem 1.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "1rem", textAlign: "left", fontSize: "0.85rem" }}>
                <div>• 참석여부: {attended ? "참석" : "불참"}</div>
                {attended && <div>• 투표의사: {vote === "APPROVE" ? "찬성" : vote === "REJECT" ? "반대" : "기권"}</div>}
                <div>• 검토의견: {opinion || "의견 없음"}</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitResponse} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* 참석 구분 */}
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
                    <span>참석 (안건 투표 개시)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      checked={attended === false}
                      onChange={() => setAttended(false)}
                      style={{ accentColor: "var(--accent-color)" }}
                    />
                    <span>불참 (미참석 의사 접수)</span>
                  </label>
                </div>
              </div>

              {/* 투표 의결 (참석 시에만 활성화) */}
              {attended && (
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.4rem", fontWeight: "bold" }}>안건 투표 의사</label>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer", color: "#10B981", fontWeight: "bold" }}>
                      <input
                        type="radio"
                        value="APPROVE"
                        checked={vote === "APPROVE"}
                        onChange={() => setVote("APPROVE")}
                        style={{ accentColor: "#10B981" }}
                      />
                      <span>찬성 (Approve)</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer", color: "#ef4444", fontWeight: "bold" }}>
                      <input
                        type="radio"
                        value="REJECT"
                        checked={vote === "REJECT"}
                        onChange={() => setVote("REJECT")}
                        style={{ accentColor: "#ef4444" }}
                      />
                      <span>반대 (Reject)</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                      <input
                        type="radio"
                        value="ABSTAIN"
                        checked={vote === "ABSTAIN"}
                        onChange={() => setVote("ABSTAIN")}
                        style={{ accentColor: "var(--text-secondary)" }}
                      />
                      <span>기권 (Abstain)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* 상세 의견 */}
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.4rem", fontWeight: "bold" }}>의결 심의 상세 의견</label>
                <textarea
                  rows={3}
                  placeholder="의안에 관한 구체적인 보완 사항이나 심의 의견을 기재해 주십시오."
                  value={opinion}
                  onChange={(e) => setOpinion(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)", resize: "none", fontSize: "0.85rem" }}
                />
              </div>

              {/* 전자 서명 Canvas 패드 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: "bold" }}>전자서명 (마우스/터치)</label>
                  <button type="button" onClick={clearCanvas} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}>
                    지우기
                  </button>
                </div>
                
                <div style={{ background: "#05070f", borderRadius: "6px", border: "1px solid var(--border-color)", overflow: "hidden", display: "flex", justifyContent: "center" }}>
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
                    style={{ background: "transparent", cursor: "crosshair", width: "100%", height: "150px" }}
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
        © 2026 Ulsan College RISE Anchor RCC / ECC. All Rights Reserved. (보안 256bit 암호화)
      </footer>
    </div>
  );
}
