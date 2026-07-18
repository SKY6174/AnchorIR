import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import CryptoJS from "crypto-js";
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

export default function CommitteeManager({ currentRole, currentUser, activeSubTab, onChangeSubTab, darkMode, selectedYear }) {
  // 1. 상태(State) 정의
  const [committees, setCommittees] = useState([]);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
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
  
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: "", meeting_date: "", meeting_type: "ONLINE_WRITTEN", agenda: "" });

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [memberRole, setMemberRole] = useState("MEMBER");

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

  // 3. Supabase 데이터 조회(Fetch) 함수
  const fetchCommittees = async () => {
    try {
      const { data, error } = await supabase
        .from("committees")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      setCommittees(data || []);
      if (data && data.length > 0 && !selectedCommittee) {
        setSelectedCommittee(data[0]);
      }
    } catch (err) {
      console.error("위원회 조회 에러:", err.message);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("rise_users")
        .select("id, name, dept_name, role_name")
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
      if (data && data.length > 0) {
        setSelectedMeeting(data[0]);
      } else {
        setSelectedMeeting(null);
      }
    } catch (err) {
      console.error("회의 조회 에러:", err.message);
    }
  };

  const fetchMembers = async (committeeId) => {
    try {
      const { data, error } = await supabase
        .from("committee_members")
        .select(`
          id,
          committee_id,
          user_id,
          role,
          term_start,
          term_end,
          rise_users ( name, dept_name, role_name )
        `)
        .eq("committee_id", committeeId);
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("위원 조회 에러:", err.message);
    }
  };

  const fetchResponses = async (meetingId) => {
    try {
      const { data, error } = await supabase
        .from("meeting_responses")
        .select(`
          id,
          meeting_id,
          member_id,
          attended,
          vote,
          opinion,
          encrypted_signature,
          submitted_at,
          committee_members (
            user_id,
            role,
            rise_users ( name, dept_name )
          )
        `)
        .eq("meeting_id", meetingId);
      if (error) throw error;
      setResponses(data || []);

      // 내가 이미 제출했는지 검증
      if (currentUser && members.length > 0) {
        const myMemberObj = members.find(m => m.user_id === currentUser.id);
        if (myMemberObj) {
          const myResp = data?.find(r => r.member_id === myMemberObj.id);
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
      console.error("의결 응답 조회 에러:", err.message);
    }
  };

  const fetchMyMemberships = async () => {
    try {
      const { data, error } = await supabase
        .from("committee_members")
        .select("committee_id, role")
        .eq("user_id", currentUser.id);
      if (error) throw error;
      setMyMemberships(data || []);
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
    if (!selectedUserId) {
      alert("사용자를 선택해 주세요.");
      return;
    }
    // 중복 검사
    if (members.some(m => m.user_id === selectedUserId)) {
      alert("이미 위원회에 등록된 위원입니다.");
      return;
    }

    try {
      const { error } = await supabase
        .from("committee_members")
        .insert([{
          committee_id: selectedCommittee.id,
          user_id: selectedUserId,
          role: memberRole
        }]);

      if (error) throw error;
      alert("위원이 배정되었습니다.");
      setIsMemberModalOpen(false);
      setSelectedUserId("");
      await fetchMembers(selectedCommittee.id);
      
      // 위원 수가 늘어났으므로 위원회 테이블의 재적 수(total_quorum) 자동 동기화 업데이트
      const newQuorum = members.length + 1;
      await supabase
        .from("committees")
        .update({ total_quorum: newQuorum })
        .eq("id", selectedCommittee.id);
      
      await fetchCommittees();
    } catch (err) {
      alert("위원 배정 실패: " + err.message);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("이 위원을 위원회에서 제외하시겠습니까?")) return;
    try {
      const { error } = await supabase
        .from("committee_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
      alert("위원이 제외되었습니다.");
      await fetchMembers(selectedCommittee.id);

      // 재적 수 동기화
      const newQuorum = Math.max(0, members.length - 1);
      await supabase
        .from("committees")
        .update({ total_quorum: newQuorum })
        .eq("id", selectedCommittee.id);
      
      await fetchCommittees();
    } catch (err) {
      alert("위원 제외 실패: " + err.message);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!meetingForm.title || !meetingForm.meeting_date || !meetingForm.agenda) {
      alert("모든 필수 항목을 기입해 주세요.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("committee_meetings")
        .insert([{
          committee_id: selectedCommittee.id,
          title: meetingForm.title,
          meeting_date: meetingForm.meeting_date,
          meeting_type: meetingForm.meeting_type,
          agenda: meetingForm.agenda,
          status: "ACTIVE" // 개설 즉시 활성(의결중) 상태로 지정
        }])
        .select();

      if (error) throw error;
      alert("위원회 회의 일정이 등록되었으며, 의결 수집이 시작되었습니다.");
      setIsMeetingModalOpen(false);
      setMeetingForm({ title: "", meeting_date: "", meeting_type: "ONLINE_WRITTEN", agenda: "" });
      await fetchMeetings(selectedCommittee.id);
      if (data && data.length > 0) {
        setSelectedMeeting(data[0]);
      }
    } catch (err) {
      alert("회의 등록 실패: " + err.message);
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
      alert("회의 삭제 실패: " + err.message);
    }
  };

  // 5. 전자서명 그리기 캔버스 핸들러
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // 6. 위원 참석 및 의결(의결서) 제출 핸들러 (Rule 8 암호화 적용)
  const handleSubmitVote = async () => {
    if (!selectedMeeting) return;
    if (!userVote) {
      alert("안건에 대한 찬/반 여부를 선택해 주세요.");
      return;
    }
    if (!userOpinion.trim()) {
      alert("의견서 본문을 작성해 주세요.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL("image/png");
    
    // 단순 빈 캔버스 검증 (서명 여부 체크)
    const blankCanvas = document.createElement("canvas");
    blankCanvas.width = canvas.width;
    blankCanvas.height = canvas.height;
    if (signatureDataUrl === blankCanvas.toDataURL("image/png")) {
      alert("전자서명 패드에 서명을 완성해 주세요.");
      return;
    }

    // 💡 [Rule 8] 서명 이미지 Base64 데이터를 대칭키 AES로 암호화하여 보안 전송
    const encryptedSig = CryptoJS.AES.encrypt(signatureDataUrl, SECRET_KEY).toString();

    // 내가 이 위원회에서 배정된 멤버 레코드 ID 획득
    const myMemberObj = members.find(m => m.user_id === currentUser.id);
    if (!myMemberObj) {
      alert("귀하는 이 위원회의 위원 명단에 존재하지 않습니다.");
      return;
    }

    try {
      const { error } = await supabase
        .from("meeting_responses")
        .upsert([{
          meeting_id: selectedMeeting.id,
          member_id: myMemberObj.id,
          attended: true,
          vote: userVote,
          opinion: userOpinion,
          encrypted_signature: encryptedSig,
          submitted_at: new Date().toISOString()
        }], { onConflict: "meeting_id, member_id" });

      if (error) throw error;
      alert("의사결정서 및 서명이 안전하게 암호화되어 제출되었습니다.");
      setHasSubmitted(true);
      await fetchResponses(selectedMeeting.id);
    } catch (err) {
      alert("의결서 제출 실패: " + err.message);
    }
  };

  // 7. 정족수 실시간 계산 유틸리티 연동
  const calculateQuorum = () => {
    if (!selectedCommittee || !selectedMeeting) return null;
    const total = selectedCommittee.total_quorum || members.length || 1;
    const attended = responses.filter(r => r.attended).length;
    
    // 의사정족수: 재적 과반
    const majorityLimit = Math.floor(total / 2) + 1;
    const isEstablished = attended >= majorityLimit;

    // 의결정족수: 찬성표 산출
    const approveCount = responses.filter(r => r.vote === "APPROVE").length;
    const rejectCount = responses.filter(r => r.vote === "REJECT").length;
    const abstainCount = responses.filter(r => r.vote === "ABSTAIN").length;

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
      // 위원들의 의견 수집
      const opinionsContext = responses
        .map((r, idx) => `[위원 ${idx + 1} - ${r.vote === "APPROVE" ? "찬성" : r.vote === "REJECT" ? "반대" : "기권"}]: ${r.opinion}`)
        .join("\n");

      const prompt = `역할: 울산과학대학교 RISE 사업단 전문 AI 분석관
작업: 아래 수집된 위원들의 회의 안건 의견들을 객관적으로 분석하여 결과 보고서 형식으로 요약해줘.
모든 텍스트는 친절한 존댓말 한글로 작성하며 주관적인 판단 대신 위원들의 의견 분포를 정량적/정성적으로 균형있게 요약해야 함.

[안건명]: ${selectedMeeting.title}
[안건 세부 요지]: ${selectedMeeting.agenda}

[위원회 의결 기준]: ${selectedCommittee.name} / ${qInfo?.ruleText}
[최종 성원 요건]: 재적 ${qInfo?.total}명 중 ${qInfo?.attended}명 참석하여 ${qInfo?.isEstablished ? "성원됨" : "미성원됨"}
[최종 표결 결과]: 찬성 ${qInfo?.approveCount}표, 반대 ${qInfo?.rejectCount}표, 기권 ${qInfo?.abstainCount}표 ➡️ 최종 결과: ${qInfo?.isApproved ? "가결(Approved)" : "부결(Rejected)"}

[수집된 위원별 세부 의견]:
${opinionsContext}

요구 형식:
### 1. 종합 찬반 동향 및 핵심 논지
(찬성률과 주요 지지 근거 및 우려사항 분석 요약)

### 2. 안건별 세부 쟁점 및 보완 권고사항
(위원들이 명시한 이견 및 보완 사항 요약 기술)

### 3. 향후 사업단 추진 방향 및 AI 종합 제언
(가결/부결 결과에 따른 구체적 실행 로직 제언)`;

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
          official_minutes: `[회의록 자동 생성] 본 위원회는 재적 ${qInfo?.total}명 중 ${qInfo?.attended}명 참석으로 성원되었으며, 투표 결과 최종 ${qInfo?.isApproved ? "가결" : "부결"}되었음을 증명합니다.`,
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

  // 9. 결과보고 대장 동적 로드용
  const [reports, setReports] = useState([]);
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

        {/* Gemini 키 제어기 */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowKeyInput(!showKeyInput)}
            style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <Cpu size={14} /> AI 분석 키 설정
          </button>
          {showKeyInput && (
            <div style={{ display: "flex", gap: "0.25rem", background: "rgba(0,0,0,0.4)", padding: "0.3rem", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
              <input
                type="password"
                placeholder="Gemini API Key"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", background: "#111", color: "#fff" }}
              />
              <button className="btn btn-primary" onClick={handleSaveGeminiKey} style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}>저장</button>
            </div>
          )}
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
                {isManager && (
                  <button className="btn btn-secondary" onClick={() => setIsCommitteeModalOpen(true)} style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}>
                    <Plus size={12} /> 위원회 추가
                  </button>
                )}
              </div>
              <select
                value={selectedCommittee?.id || ""}
                onChange={(e) => {
                  const com = committees.find(c => c.id === e.target.value);
                  setSelectedCommittee(com || null);
                }}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
              >
                {committees.length === 0 ? (
                  <option value="">등록된 위원회 없음</option>
                ) : (
                  committees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                )}
              </select>

              {/* 위원회 삭제 (관리자용) */}
              {isManager && selectedCommittee && (
                <button
                  onClick={() => handleDeleteCommittee(selectedCommittee.id)}
                  style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.2rem" }}
                >
                  <Trash2 size={12} /> 위원회 완전 제거
                </button>
              )}
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
                  members.map(m => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)", padding: "0.3rem 0.5rem", borderRadius: "4px" }}>
                      <span style={{ fontSize: "0.8rem", color: "#fff" }}>
                        {m.rise_users?.name} <small style={{ color: "var(--accent-color)" }}>({m.role === "CHAIRMAN" ? "위원장" : m.role === "SECRETARY" ? "간사" : "위원"})</small>
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
                        <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#fff" }}>{m.title}</span>
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
                      <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff", marginBottom: "0.25rem" }}>
                        {selectedMeeting.title}
                      </h2>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        의결 기한: {selectedMeeting.meeting_date ? new Date(selectedMeeting.meeting_date).toLocaleString() : ""} | {selectedMeeting.meeting_type === "ONLINE_WRITTEN" ? "서면 회의" : "대면 회의"}
                      </p>
                    </div>

                    {isManager && (
                      <button
                        onClick={() => handleDeleteMeeting(selectedMeeting.id)}
                        className="btn btn-secondary"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", color: "#ef4444" }}
                      >
                        <Trash2 size={14} /> 회의 취소
                      </button>
                    )}
                  </div>

                  {/* 안건 원문 */}
                  <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(0,0,0,0.3)", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--accent-color)", display: "block", marginBottom: "0.25rem" }}>회의 안건 요지</strong>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "pre-line", lineHeight: "1.5" }}>{selectedMeeting.agenda}</p>
                  </div>

                  {/* 실시간 성원/의결 전광판 */}
                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--border-color)", textAlign: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>재적 위원 수</span>
                      <strong style={{ fontSize: "1.5rem", color: "#fff" }}>{qInfo?.total}명</strong>
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
                </div>

                {/* 1. 위원 의사결정서 제출 패널 */}
                {isUserCommitteeMember && selectedMeeting.status === "ACTIVE" && (
                  <div className="card" style={{ padding: "1.25rem", border: "1px solid var(--accent-color)", background: "rgba(var(--accent-color-rgb), 0.03)" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#fff", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Vote size={18} style={{ color: "var(--accent-color)" }} />
                      위원 의사결정서 온라인 제출
                    </h3>

                    {hasSubmitted ? (
                      <div style={{ textAlign: "center", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                        <Check size={32} style={{ color: "var(--success-color)", marginBottom: "0.25rem" }} />
                        <p style={{ fontSize: "0.9rem", color: "#fff", fontWeight: "bold" }}>의결서 제출이 완료되었습니다.</p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                          제출 내용: 찬반여부 - {userVote === "APPROVE" ? "찬성" : userVote === "REJECT" ? "반대" : "기권"}
                        </p>
                        <button className="btn btn-secondary" onClick={() => setHasSubmitted(false)} style={{ marginTop: "0.5rem", fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                          의결서 수정하기
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {/* 찬반기권 선택 */}
                        <div>
                          <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>
                            1. 찬/반 의결 여부
                          </label>
                          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.25rem" }}>
                            <label style={{ color: "#fff", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                              <input type="radio" name="vote" value="APPROVE" checked={userVote === "APPROVE"} onChange={(e) => setUserVote(e.target.value)} />
                              찬성
                            </label>
                            <label style={{ color: "#fff", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                              <input type="radio" name="vote" value="REJECT" checked={userVote === "REJECT"} onChange={(e) => setUserVote(e.target.value)} />
                              반대
                            </label>
                            <label style={{ color: "#fff", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                              <input type="radio" name="vote" value="ABSTAIN" checked={userVote === "ABSTAIN"} onChange={(e) => setUserVote(e.target.value)} />
                              기권
                            </label>
                          </div>
                        </div>

                        {/* 상세 의견 작성 */}
                        <div>
                          <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>
                            2. 심의 검토 의견서
                          </label>
                          <textarea
                            rows={3}
                            placeholder="안건 검토 결과 및 보완의견을 1~2문장으로 상세히 기술해 주세요."
                            value={userOpinion}
                            onChange={(e) => setUserOpinion(e.target.value)}
                            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)", fontSize: "0.85rem", resize: "none" }}
                          />
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
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "0.25rem" }}>
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
                      <p style={{ fontSize: "0.85rem", color: "#fff", marginTop: "0.5rem" }}>Gemini AI가 위원들의 서면 의견을 통합 분석하고 대시보드 결과 보고서를 구성하고 있습니다...</p>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
                    {responses.length === 0 ? (
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center", padding: "1rem" }}>
                        현재 제출된 위원 심의 의견서가 없습니다.
                      </span>
                    ) : (
                      responses.map((r, idx) => (
                        <div key={r.id} style={{ padding: "0.6rem 0.8rem", borderRadius: "6px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                          <span style={{
                            fontSize: "0.7rem",
                            padding: "0.15rem 0.4rem",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            background: r.vote === "APPROVE" ? "rgba(34, 197, 94, 0.15)" : r.vote === "REJECT" ? "rgba(239, 68, 68, 0.15)" : "rgba(156, 163, 175, 0.15)",
                            color: r.vote === "APPROVE" ? "#22c55e" : r.vote === "REJECT" ? "#ef4444" : "#9ca3af"
                          }}>
                            {r.vote === "APPROVE" ? "찬성" : r.vote === "REJECT" ? "반대" : "기권"}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <strong style={{ fontSize: "0.8rem", color: "#fff" }}>
                                {r.committee_members?.rise_users?.name} <small style={{ color: "var(--text-secondary)" }}>({r.committee_members?.rise_users?.dept_name})</small>
                              </strong>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                                {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : ""}
                              </span>
                            </div>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>{r.opinion}</p>
                          </div>
                          
                          {/* 서명 완료 마크 */}
                          {r.encrypted_signature && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.1rem", color: "var(--success-color)", fontSize: "0.7rem" }}>
                              <UserCheck size={12} /> 서명필
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
              <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#fff" }}>
                위원회 의결 결과보고 대장
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                성원 및 표결 요건을 충족하여 가결/부결 처리된 공식 보고서 목록입니다.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {reports.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4.5rem", color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
                <FileText size={48} style={{ display: "block", margin: "0 auto 1rem auto" }} />
                <span>아직 탑재 완료(AI 종합 분석)된 위원회 결과 보고서가 없습니다.</span>
              </div>
            ) : (
              reports.map(rep => (
                <div
                  key={rep.id}
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
                        {rep.committee_meetings?.committees?.name}
                      </span>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#fff", marginTop: "0.15rem" }}>
                        {rep.committee_meetings?.title}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        의결 형태: {rep.committee_meetings?.meeting_type === "ONLINE_WRITTEN" ? "서면의결" : "대면의결"} | 보고서 탑재일: {rep.published_at ? new Date(rep.published_at).toLocaleString() : ""}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <span style={{
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "6px",
                        background: rep.is_established ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: rep.is_established ? "#22c55e" : "#ef4444"
                      }}>
                        {rep.is_established ? "의결 성원" : "미성원 취소"}
                      </span>
                      <span style={{
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "6px",
                        background: rep.decision_status === "APPROVED" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                        color: rep.decision_status === "APPROVED" ? "#10b981" : "#ef4444"
                      }}>
                        {rep.decision_status === "APPROVED" ? "안건 가결" : rep.decision_status === "REJECTED" ? "안건 부결" : "의결 취소"}
                      </span>
                    </div>
                  </div>

                  {/* 안건 요지 */}
                  <div style={{ padding: "0.75rem", background: "rgba(0,0,0,0.3)", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "1rem" }}>
                    <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>제출 안건 요지:</strong>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem", whiteSpace: "pre-line" }}>{rep.committee_meetings?.agenda}</p>
                  </div>

                  {/* AI 종합 분석 결과 */}
                  <div style={{ padding: "1.25rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <strong style={{ fontSize: "0.9rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.5rem" }}>
                      <Cpu size={16} style={{ color: "var(--accent-color)" }} />
                      RISE 사업단 AI 심의 분석서
                    </strong>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {renderMarkdownText(rep.ai_summary)}
                    </div>
                  </div>

                  {/* 공식 회의록 인증 */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", padding: "0.5rem 0.75rem", background: "rgba(59, 130, 246, 0.05)", borderRadius: "6px", border: "1px solid rgba(59, 130, 246, 0.2)", fontSize: "0.8rem", color: "#60a5fa" }}>
                    <Award size={14} />
                    <span>{rep.official_minutes}</span>
                  </div>
                </div>
              ))
            )}
          </div>
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
          <div className="modal-contentcard" style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", width: "400px", maxWidth: "90%" }}>
            <h3 style={{ color: "#fff", fontWeight: "800", fontSize: "1.1rem", marginBottom: "1rem" }}>위원회 위원 배정</h3>
            <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>대상 사용자 선택</label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                >
                  <option value="">-- 배정할 사용자 선택 --</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.dept_name || "소속없음"} / {u.role_name || "역할없음"})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>위원회 내 직책</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                >
                  <option value="MEMBER">위원</option>
                  <option value="CHAIRMAN">위원장</option>
                  <option value="SECRETARY">간사</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsMemberModalOpen(false)} style={{ flex: 1 }}>취소</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>배정하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 모달 3: 신규 회의 의결 안건 등록 모달 */}
      {/* ======================================================== */}
      {isMeetingModalOpen && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
          <div className="modal-contentcard" style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", width: "500px", maxWidth: "95%" }}>
            <h3 style={{ color: "#fff", fontWeight: "800", fontSize: "1.1rem", marginBottom: "1rem" }}>신규 회의 의결 개설</h3>
            <form onSubmit={handleCreateMeeting} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>회의명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 제1차 앵커총괄위원회 회의"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
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
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>회의 방식</label>
                  <select
                    value={meetingForm.meeting_type}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meeting_type: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)" }}
                  >
                    <option value="ONLINE_WRITTEN">서면 의결 (비대면)</option>
                    <option value="OFFLINE_FACE">대면 회의 (현장 서명)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>의결 안건 요지</label>
                <textarea
                  rows={4}
                  required
                  placeholder="의사결정을 요청할 핵심 안건 설명과 근거 자료 요약을 기술해 주세요."
                  value={meetingForm.agenda}
                  onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.3)", color: "#fff", border: "1px solid var(--border-color)", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsMeetingModalOpen(false)} style={{ flex: 1 }}>취소</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>회의 등록 및 의결 개시</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
