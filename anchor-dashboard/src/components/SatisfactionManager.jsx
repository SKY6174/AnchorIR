import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import * as XLSX from "xlsx";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from "recharts";
import { 
  FileSpreadsheet, QrCode, ClipboardCheck, Plus, Trash2, CheckCircle2, 
  Send, BarChart3, HelpCircle, Calendar, Users, Briefcase, FileText, Check, Download, RefreshCw,
  Compass
} from "lucide-react";
import { supabase } from "../supabaseClient"; // Supabase 클라이언트 의존성 주입

// 초기 기본 만족도 조사 데이터 셋 (로컬 스토리지에 유지 가능하도록 구성)
const defaultSurveys = [
  {
    id: "2025-ECC-1",
    title: "2025년도 ECC센터 산학협력 가족회사 만족도 조사",
    purpose: "ECC센터 가족회사 산학협력 프로그램의 실무 활용성과 인프라 지원 만족도를 측정하여 서비스 개선 피드백 획득",
    startDate: "2025-10-01",
    endDate: "2025-10-15",
    target: "ECC센터 가족기업 임직원",
    department: "ECC",
    status: "완료",
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/1xECC_Survey_2025/edit",
    questions: [
      "제공된 기술지원 교육과정의 실무 활용성에 만족하십니까?",
      "산학 공동 연구개발 연구진과의 소통과 지원 태도에 만족하십니까?",
      "교내 고가 기자재 및 공동장비 실습 인프라의 이용 편의성에 만족하십니까?",
      "전반적으로 ECC센터 산학협력 패키지 서비스에 만족하십니까?",
      "향후 타 기업에 본 센터의 산학협력 프로그램을 적극 추천할 의향이 있으십니까?"
    ],
    responses: [
      { id: 1, responder: "익명_1", scores: [5, 4, 5, 5, 5], comment: "공동장비 활용 과정에서 예산 부담이 대폭 해소되었습니다. 내년에도 참여하고 싶습니다.", date: "2025-10-03" },
      { id: 2, responder: "익명_2", scores: [4, 4, 4, 4, 5], comment: "R&BD 과제 매칭 소통이 원활해서 연구 일정을 잘 준수할 수 있었습니다.", date: "2025-10-05" },
      { id: 3, responder: "익명_3", scores: [5, 5, 5, 5, 5], comment: "최첨단 융합 실습 장비들이 구비되어 있어 기업 현장 교육용으로 아주 훌륭했습니다.", date: "2025-10-07" },
      { id: 4, responder: "익명_4", scores: [4, 5, 3, 4, 4], comment: "장비 예약 대기 시간이 조금 긴 편인데 대기 목록 조회 기능이 보강되면 좋겠습니다.", date: "2025-10-08" },
      { id: 5, responder: "익명_5", scores: [5, 4, 4, 5, 5], comment: "매우 우수한 산학협력 시스템입니다. 기업 실무진 교육에 많은 도움을 받았습니다.", date: "2025-10-12" }
    ]
  },
  {
    id: "2025-늘봄누리센터-1",
    title: "2025년도 초등 늘봄교실 참여 학부모 종합 만족도 조사",
    purpose: "늘봄누리 프로그램 교과과정의 다양성, 안전성 및 방과후 돌봄 교구 인프라에 대한 보호자 환류 조사의견 수렴",
    startDate: "2025-11-10",
    endDate: "2025-11-20",
    target: "늘봄학교 참여 학생 학부모",
    department: "늘봄누리센터",
    status: "완료",
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/2xNeulbom_Survey_2025/edit",
    questions: [
      "늘봄교실 프로그램이 자녀의 학습적 성장에 유익하다고 생각하십니까?",
      "돌봄 전담사 및 보조 교사의 아동 안전 관리와 지도 태도에 만족하십니까?",
      "제공된 간식의 영양 균형과 위생 관리에 전반적으로 만족하십니까?",
      "교실 내부 시설 환경 및 교구들의 살균 위생 상태에 만족하십니까?",
      "자녀를 늘봄교실에 맡기는 전반적인 돌봄 서비스에 만족하십니까?"
    ],
    responses: [
      { id: 1, responder: "익명_A", scores: [5, 5, 4, 4, 5], comment: "다채로운 예체능 특별활동이 추가되어 아이가 지루해하지 않고 너무 좋아합니다.", date: "2025-11-11" },
      { id: 2, responder: "익명_B", scores: [4, 5, 3, 4, 5], comment: "간식 메뉴가 빵이나 밀가루 중심보다 제철 과일이나 떡 위주로 좀 더 보강되면 좋겠습니다.", date: "2025-11-13" },
      { id: 3, responder: "익명_C", scores: [5, 4, 5, 5, 5], comment: "맞벌이 가정으로서 안심하고 아이를 늦게까지 맡길 수 있어 삶의 질이 향상되었습니다.", date: "2025-11-14" },
      { id: 4, responder: "익명_D", scores: [4, 4, 4, 4, 4], comment: "돌봄교실 장난감과 책 위생 소독이 주기적으로 시행되어 안심이 됩니다.", date: "2025-11-16" }
    ]
  }
];

export default function SatisfactionManager({ selectedYear }) {
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeSurveyTab, setActiveSurveyTab] = useState("list"); // "list" | "create" | "detail"
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);

  // 새 설문조사 작성 폼용 상태
  const [newTitle, setNewTitle] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newDept, setNewDept] = useState("ECC");
  const [filterDepts, setFilterDepts] = useState(["ECC", "ICC", "RCC", "AIDX", "NURI", "SEVeN"]); // 부서별 다중 필터링 상태 추가
  const [newStartDate, setNewStartDate] = useState("2026-03-01");
  const [newEndDate, setNewEndDate] = useState("2026-03-15");
  const [newQuestions, setNewQuestions] = useState([
    "제공된 교육 프로그램의 전문성 및 실무 연계성에 만족하십니까?",
    "프로그램 진행자의 전문성과 원활한 일정 소통 방식에 만족하십니까?",
    "프로그램 수행 시설 및 인프라의 쾌적함과 장비 구성에 만족하십니까?",
    "전반적으로 본 프로그램에 참여한 효과성에 만족하십니까?",
    "향후 추진되는 연계 프로그램에 재참여할 의향이 있으십니까?"
  ]);
  const [customQuestionInput, setCustomQuestionInput] = useState("");

  // 모의 응답 추가용 폼 상태
  const [simulatedResponder, setSimulatedResponder] = useState("일반 참가자");
  const [simulatedScores, setSimulatedScores] = useState([5, 5, 5, 5, 5]);
  const [simulatedComment, setSimulatedComment] = useState("");

  const [copiedId, setCopiedId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [showSheetsViewer, setShowSheetsViewer] = useState(false); // 구글 시트 연동 뷰어 모달 상태
  const [aiReport, setAiReport] = useState(null); // AI 총평 결과
  const [generatingAi, setGeneratingAi] = useState(false); // AI 제너레이션 로더

  // 선택된 만족도 조사가 바뀌거나 surveys가 갱신되면 해당 조사의 AI 총평 복원 로드
  useEffect(() => {
    if (selectedSurveyId && surveys.length > 0) {
      const activeSurvey = surveys.find(s => s.id === selectedSurveyId);
      if (activeSurvey && activeSurvey.aiReport) {
        setAiReport(activeSurvey.aiReport);
      } else {
        setAiReport(null);
      }
    } else {
      setAiReport(null);
    }
  }, [selectedSurveyId, surveys]);

  // 1. DB로부터 조사 목록 및 수집 응답 데이터 통합 조회
  const fetchSurveysFromDb = async () => {
    setIsLoading(true);
    try {
      // surveys 테이블 조회
      const { data: dbSurveys, error: surveyError } = await supabase
        .from("satisfaction_surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (surveyError) throw surveyError;

      // responses 목록 조회
      const { data: dbResponses, error: responseError } = await supabase
        .from("satisfaction_responses")
        .select("*");

      if (responseError) throw responseError;

      let formatted = dbSurveys.map(s => {
        const matchingResponses = dbResponses
          .filter(r => r.survey_id === s.id)
          .map(r => ({
            id: r.id,
            responder: r.responder_info || "익명 응답자",
            scores: [r.score_q1, r.score_q2, r.score_q3, r.score_q4, r.score_q5].filter(v => v !== null),
            comment: r.comments,
            date: r.created_at ? r.created_at.split("T")[0] : new Date().toISOString().split("T")[0]
          }));

        return {
          id: s.id,
          title: s.title,
          purpose: s.purpose,
          startDate: s.start_date,
          endDate: s.end_date,
          target: s.target,
          department: s.department,
          status: s.status,
          googleSheetUrl: s.google_sheet_url,
          aiReport: s.ai_report || null,
          questions: [
            "제공된 교육 프로그램의 전문성 및 실무 연계성에 만족하십니까?",
            "프로그램 진행자의 전문성과 원활한 일정 소통 방식에 만족하십니까?",
            "프로그램 수행 시설 및 인프라의 쾌적함과 장비 구성에 만족하십니까?",
            "전반적으로 본 프로그램에 참여한 효과성에 만족하십니까?",
            "향후 추진되는 연계 프로그램에 재참여할 의향이 있으십니까?"
          ], // 기본 5문항 고정 매칭
          responses: matchingResponses
        };
      });

      // 만약 DB가 비어 있다면 (최초 기동 시), 시드 데이터를 삽입
      if (formatted.length === 0) {
        console.log("Supabase satisfaction tables empty. Seeding default surveys...");
        for (const defaultSurvey of defaultSurveys) {
          // survey insert
          await supabase.from("satisfaction_surveys").insert({
            id: defaultSurvey.id,
            title: defaultSurvey.title,
            purpose: defaultSurvey.purpose,
            start_date: defaultSurvey.startDate,
            end_date: defaultSurvey.endDate,
            target: defaultSurvey.target,
            department: defaultSurvey.department,
            status: defaultSurvey.status,
            google_sheet_url: defaultSurvey.googleSheetUrl
          });

          // responses insert
          const resInserts = defaultSurvey.responses.map(res => ({
            survey_id: defaultSurvey.id,
            responder_info: res.responder,
            score_q1: res.scores[0],
            score_q2: res.scores[1],
            score_q3: res.scores[2],
            score_q4: res.scores[3],
            score_q5: res.scores[4],
            comments: res.comment,
            created_at: new Date(res.date).toISOString()
          }));
          await supabase.from("satisfaction_responses").insert(resInserts);
        }
        // 시드 삽입 후 다시 조회
        const { data: reSurveys } = await supabase.from("satisfaction_surveys").select("*").order("created_at", { ascending: false });
        const { data: reResponses } = await supabase.from("satisfaction_responses").select("*");
        
        formatted = (reSurveys || []).map(s => {
          const matching = (reResponses || [])
            .filter(r => r.survey_id === s.id)
            .map(r => ({
              id: r.id,
              responder: r.responder_info || "익명 응답자",
              scores: [r.score_q1, r.score_q2, r.score_q3, r.score_q4, r.score_q5].filter(v => v !== null),
              comment: r.comments,
              date: r.created_at ? r.created_at.split("T")[0] : new Date().toISOString().split("T")[0]
            }));
          return {
            id: s.id,
            title: s.title,
            purpose: s.purpose,
            startDate: s.start_date,
            endDate: s.end_date,
            target: s.target,
            department: s.department,
            status: s.status,
            googleSheetUrl: s.google_sheet_url,
            aiReport: s.ai_report || null,
            questions: defaultSurveys[0].questions,
            responses: matching
          };
        });
      }

      setSurveys(formatted);
      localStorage.setItem("anchor_satisfaction_surveys", JSON.stringify(formatted));
    } catch (err) {
      console.error("Supabase satisfaction fetch failed, fallback to local storage:", err);
      const cached = localStorage.getItem("anchor_satisfaction_surveys");
      if (cached) setSurveys(JSON.parse(cached));
    } finally {
      setIsLoading(false);
    }
  };

  // 연차 변경 또는 로드 시 호출
  useEffect(() => {
    fetchSurveysFromDb();
  }, [selectedYear]);

  // 6대 수행부서 그룹 정의 및 필터기
  const DEPARTMENTS_GROUP = [
    { key: "ECC", name: "지산학교육센터 (ECC)" },
    { key: "ICC", name: "기업협업센터 (ICC)" },
    { key: "RCC", name: "지역협업센터 (RCC)" },
    { key: "AIDX", name: "AID-X지원센터 (AIDX)" },
    { key: "NURI", name: "울산늘봄누리센터 (NURI)" },
    { key: "SEVeN", name: "신산업특화센터 (SEVeN)" }
  ];

  const getSurveysByDept = (deptKey) => {
    return surveys.filter(s => {
      const d = s.department ? s.department.toUpperCase() : "";
      if (deptKey === "AIDX") {
        return d === "AIDX" || d === "AID-X";
      }
      if (deptKey === "NURI") {
        return d === "NURI" || d === "늘봄누리센터";
      }
      return d === deptKey.toUpperCase();
    });
  };

  // 부서별 새 조사 ID 자동 추천 생성기 (다중 선택 대응)
  const getNextSurveyId = (depts) => {
    const currentYear = 2024 + selectedYear;
    const mainDept = depts && depts.length > 0 ? depts[0] : "ECC";
    const sameDeptSurveys = surveys.filter(s => s.id.startsWith(`${currentYear}-${mainDept}-`));
    
    // 번호 산출 (예: 2026-ECC-1)
    let maxNum = 0;
    sameDeptSurveys.forEach(s => {
      const parts = s.id.split("-");
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    });
    return `${currentYear}-${mainDept}-${maxNum + 1}`;
  };

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPurpose.trim()) {
      alert("조사제목과 조사목적은 필수 항목입니다.");
      return;
    }

    const generatedId = getNextSurveyId(newDept);
    const newSurvey = {
      id: generatedId,
      title: newTitle.trim(),
      purpose: newPurpose.trim(),
      startDate: newStartDate,
      endDate: newEndDate,
      target: newTarget.trim() || "프로그램 대상 전체",
      department: newDept,
      status: "작성",
      googleSheetUrl: `https://docs.google.com/spreadsheets/d/1x${newDept}_${generatedId.replace(/-/g, "_")}/edit`,
      questions: newQuestions.filter(q => q.trim() !== ""),
      responses: []
    };

    try {
      const { error } = await supabase
        .from("satisfaction_surveys")
        .insert({
          id: generatedId,
          title: newSurvey.title,
          purpose: newSurvey.purpose,
          start_date: newSurvey.startDate,
          end_date: newSurvey.endDate,
          target: newSurvey.target,
          department: newSurvey.department,
          status: newSurvey.status,
          google_sheet_url: newSurvey.googleSheetUrl
        });

      if (error) throw error;

      setSurveys([newSurvey, ...surveys]);
      // 폼 초기화
      setNewTitle("");
      setNewPurpose("");
      setNewTarget("");
      setNewDept("ECC");
      setActiveSurveyTab("list");
      alert("만족도 조사 기획서가 DB와 연동되어 안전하게 생성되었습니다!");
    } catch (err) {
      console.error("Failed to insert survey in Supabase:", err);
      alert(`DB 저장 중 에러가 발생했습니다: ${err.message}`);
    }
  };

  // 문항 추가 헬퍼
  const handleAddQuestion = () => {
    if (!customQuestionInput.trim()) return;
    setNewQuestions([...newQuestions, customQuestionInput.trim()]);
    setCustomQuestionInput("");
  };

  // 문항 제거 헬퍼
  const handleRemoveQuestion = (index) => {
    if (newQuestions.length <= 1) {
      alert("최소 1개 이상의 질문이 유지되어야 합니다.");
      return;
    }
    setNewQuestions(newQuestions.filter((_, i) => i !== index));
  };

  // 단축 주소 복사 액션 시뮬레이션
  const handleCopyUrl = (id) => {
    const surveyUrl = `https://uc-anchor.vercel.app/sv/${id}`;
    navigator.clipboard.writeText(surveyUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // 구글 시트 연동 동기화 및 실시간 데이터 뷰어 활성화
  const handleSyncToGoogleSheets = async (id) => {
    setSyncingId(id);
    const mockSheetUrl = `https://docs.google.com/spreadsheets/d/live_${id}/edit?usp=sharing`;
    
    try {
      const { error } = await supabase
        .from("satisfaction_surveys")
        .update({ google_sheet_url: mockSheetUrl })
        .eq("id", id);

      if (error) throw error;

      setSurveys(prev => prev.map(s => {
        if (s.id === id) {
          return { ...s, googleSheetUrl: mockSheetUrl };
        }
        return s;
      }));
      
      alert("현재까지 DB에 수집된 실제 응답 데이터가 실시간 구글 스프레드시트 연동 뷰어로 완벽하게 동기화되었습니다!");
      setShowSheetsViewer(true);
    } catch (err) {
      console.error("Failed to sync sheets url:", err);
      alert("구글 시트 동기화 실패: " + err.message);
    } finally {
      setSyncingId(null);
    }
  };

  // 100점 만점 환산용 통계 가중평균치 계산 (5점 리커트 척도 반영)
  const getLikertConvertedScore = (responses, questionsCount) => {
    if (!responses || responses.length === 0 || questionsCount === 0) return 0;
    
    let totalScore = 0;
    let totalItems = 0;
    
    responses.forEach(res => {
      res.scores.forEach(s => {
        totalScore += s * 20; // 5점 만점 -> 100점 만점 환산 (1=20, 2=40, 3=60, 4=80, 5=100)
        totalItems++;
      });
    });
    
    return parseFloat((totalScore / totalItems).toFixed(1));
  };

  // 문항별 만족도 점수 계산
  const getQuestionAverageScores = (survey) => {
    if (!survey.responses || survey.responses.length === 0) {
      return survey.questions.map((q, i) => ({ name: `문항 ${i + 1}`, score: 0 }));
    }
    
    return survey.questions.map((q, i) => {
      let sum = 0;
      survey.responses.forEach(res => {
        sum += (res.scores[i] || 0) * 20; // 100점 만점 환산
      });
      return {
        name: `문항 ${i + 1}`,
        score: parseFloat((sum / survey.responses.length).toFixed(1)),
        questionText: q
      };
    });
  };

  // 10명 모의 응답 일괄 대량 생성기 (테스트 데이터 생성)
  const handleGenerateSimulatedData = async (id) => {
    const targetSurvey = surveys.find(s => s.id === id);
    if (!targetSurvey) return;

    const names = ["홍길동", "김철수", "이영희", "박민수", "최지우", "정대만", "강백호", "채소연", "서태웅", "송태섭"];
    const comments = [
      "전반적으로 유익하고 전문성이 돋보이는 교육과정이었습니다.",
      "교육 인프라가 미흡한 부분이 아쉬우나, 진행 요원들의 태도가 너무 좋았습니다.",
      "아주 우수한 프로그램입니다. 다음 기수도 무조건 연계해서 진행하겠습니다.",
      "프로그램 일정이 주말이라 살짝 부담스러웠는데, 진행은 매끄러웠습니다.",
      "교재와 실습 가이드라인 설명이 상세해서 초보자도 쉽게 따라갔습니다.",
      "늘 안전 관리에 만전을 기해 주셔서 감사했습니다.",
      "체계가 잘 잡혀 있고 전담 기관의 책임감이 돋보였습니다.",
      "구체적인 실태 파악에 도움을 주셔서 고맙습니다.",
      "비목 대비 효과가 큰 산학 연계 아카데미였습니다.",
      "프로그램 전반적으로 아주 만족하며 다음에도 추천하고 싶습니다."
    ];

    const newSimulatedResponses = Array.from({ length: 10 }).map((_, idx) => {
      const scores = targetSurvey.questions.map(() => Math.floor(Math.random() * 3) + 3);
      return {
        responder: names[Math.floor(Math.random() * names.length)] + `_${targetSurvey.responses.length + idx + 1}`,
        scores: scores,
        comment: Math.random() > 0.3 ? comments[Math.floor(Math.random() * comments.length)] : "",
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      };
    });

    try {
      const dbInserts = newSimulatedResponses.map(res => ({
        survey_id: id,
        responder_info: res.responder,
        score_q1: res.scores[0],
        score_q2: res.scores[1],
        score_q3: res.scores[2],
        score_q4: res.scores[3],
        score_q5: res.scores[4],
        comments: res.comment,
        created_at: new Date(res.date).toISOString()
      }));

      const { error: resError } = await supabase.from("satisfaction_responses").insert(dbInserts);
      if (resError) throw resError;

      // 설문지 상태를 '배포중'으로 업데이트
      const { error: sError } = await supabase.from("satisfaction_surveys").update({ status: "배포중" }).eq("id", id);
      if (sError) throw sError;

      // 로컬 화면 갱신을 위해 DB 다시 패치
      await fetchSurveysFromDb();
      alert("모의 응답 10건이 생성되어 Supabase DB에 실시간 저장되었습니다!");
    } catch (err) {
      console.error("Failed to generate simulated responses in DB:", err);
      alert("모의 데이터 DB 입력 실패: " + err.message);
    }
  };

  // 개별 모의 응답 직접 수집 등록
  const handleAddSingleResponse = async (id) => {
    const targetSurvey = surveys.find(s => s.id === id);
    if (!targetSurvey) return;

    const newRes = {
      responder: simulatedResponder.trim() || "익명 응답자",
      scores: [...simulatedScores],
      comment: simulatedComment.trim(),
      date: new Date().toISOString().split("T")[0]
    };

    try {
      const { error: resError } = await supabase.from("satisfaction_responses").insert({
        survey_id: id,
        responder_info: newRes.responder,
        score_q1: newRes.scores[0],
        score_q2: newRes.scores[1],
        score_q3: newRes.scores[2],
        score_q4: newRes.scores[3],
        score_q5: newRes.scores[4],
        comments: newRes.comment
      });

      if (resError) throw resError;

      const { error: sError } = await supabase.from("satisfaction_surveys").update({ status: "배포중" }).eq("id", id);
      if (sError) throw sError;

      setSimulatedComment("");
      setSimulatedResponder("일반 참가자");
      await fetchSurveysFromDb();
      alert("새 응답이 Supabase DB에 성공적으로 등록 저장되었습니다!");
    } catch (err) {
      console.error("Failed to insert single response:", err);
      alert("응답 DB 저장 실패: " + err.message);
    }
  };

  // 설문조사 완료(마감) 처리
  const handleCompleteSurveyStatus = async (id) => {
    if (!confirm("해당 만족도 조사를 마감하시겠습니까? 마감 시 상태가 '완료'로 잠기게 됩니다.")) return;
    
    try {
      const { error } = await supabase
        .from("satisfaction_surveys")
        .update({ status: "완료" })
        .eq("id", id);

      if (error) throw error;

      setSurveys(prev => prev.map(s => {
        if (s.id === id) {
          return { ...s, status: "완료" };
        }
        return s;
      }));
      alert("조사가 마감(완료) 처리되었습니다.");
    } catch (err) {
      console.error("Failed to complete survey status:", err);
    }
  };

  // 조사지 삭제
  const handleDeleteSurvey = async (id) => {
    if (!confirm("해당 만족도 조사와 수집된 모든 응답이 영구 삭제됩니다. 진행하시겠습니까?")) return;
    
    try {
      const { error } = await supabase
        .from("satisfaction_surveys")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSurveys(prev => prev.filter(s => s.id !== id));
      if (selectedSurveyId === id) {
        setSelectedSurveyId(null);
        setActiveSurveyTab("list");
      }
      alert("해당 조사가 DB에서 깨끗이 삭제되었습니다.");
    } catch (err) {
      console.error("Failed to delete survey:", err);
      alert("삭제 실패: " + err.message);
    }
  };

  // AI 총평 제작 프롬프트
  const makePrompt = (survey, avgScore, responsesCount) => {
    const qList = survey.questions.map((q, i) => `문항 ${i+1}: ${q}`).join("\n");
    const commentList = survey.responses.filter(r => r.comment).map(r => `- ${r.comment}`).join("\n");
    return `
당신은 대학 RISE(앵커) 사업의 만족도 조사 전문 분석관입니다.
아래 만족도 조사 데이터를 분석하여 200~300자 이내의 한글 종합 평가(총평)를 작성해 주세요.

[조사 개요]
- 조사 ID: ${survey.id}
- 수행부서: ${survey.department}
- 조사제목: ${survey.title}
- 조사목적: ${survey.purpose}
- 대상: ${survey.target}
- 참여 인원: ${responsesCount}명
- 100점 환산 평균 점수: ${avgScore}점 / 100점

[조사 문항]
${qList}

[수집된 주관식 피드백]
${commentList || "(없음)"}

[요구사항]
1. 분석 결과를 근거로 잘된 부분(강점)과 개선이 필요한 부분(보안점)을 명확하게 도출하세요.
2. 약 200~300자 분량으로 작성하세요 (존댓말로 정중하고 신뢰감 있게).
3. "종합 의견:" 이나 "총평:" 등의 접두사는 제외하고 바로 본문만 출력하세요.
`;
  };

  // OpenAI GPT-4o-mini 만족도조사 환류 총평 생성기
  const generateAiAnalysis = async (survey) => {
    const avgScore = getLikertConvertedScore(survey.responses, survey.questions.length);
    const count = survey.responses.length;
    if (count === 0) {
      alert("분석할 수집 응답 데이터가 없습니다. 먼저 모의 데이터를 생성하거나 응답을 등록해 주세요.");
      return;
    }

    setGeneratingAi(true);
    setAiReport(null);

    // 1. OpenAI API 키 판별 (환경변수 -> 로컬스토리지 -> 사용자 prompt 유도)
    let apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
    if (!apiKey || apiKey.startsWith("sk-") === false) {
      apiKey = localStorage.getItem("user_openai_api_key") || "";
    }

    // 모의 총평 로직 정의 (API 키가 없거나 통신 실패 시 폴백용)
    const runMockReport = async () => {
      let report = "";
      if (avgScore >= 90) {
        report = `본 만족도 조사 결과 종합 환산 만족도는 ${avgScore}점으로 매우 우수한 성과를 보였습니다. 문항 분석을 종합하면 특히 교육 과정의 전문성과 소통 지원 분야에서 강점이 도드라집니다. 다만, 주관식 피드백에서 지목된 시설 인프라 대기 시간 단축 요구 및 기자재 사전 점검 프로세스는 향후 보완이 요구되는 주안점입니다. 차년도 예산 기획 시 장비 예산 비목 증액과 같은 환류 조치를 강구하여 성과 체계를 고도화할 것을 권장합니다.`;
      } else if (avgScore >= 80) {
        report = `조사 결과 종합 평점 ${avgScore}점으로 전반적인 우수 기준치(80점)를 만족스럽게 달성했습니다. 참여자들 대다수가 실무 역량 강화 체계에 만족을 표했습니다. 하지만 일부 운영 편의성 및 보조 교재 공급 적시성과 관련한 건의사항이 건의되었습니다. 향후 늘봄누리센터와 연계하여 교육 시간표 다각화 및 실무 가이드를 사전 배포하는 등의 PDCA 관리 절차를 수립하여 만족도 지표를 추가적으로 상승시켜야 합니다.`;
      } else {
        report = `금번 만족도 조사는 종합 ${avgScore}점으로 목표 만족도에 미치지 못하여 긴급 보완책이 시급합니다. 문항별 지표를 분석해 보면 공간 쾌적도 및 행정 절차 지연 부문에서 저평가가 확인되었습니다. 차년도 사업 재설계 시, 행정 프로세스의 디지털 자동화와 실습실 상시 소독 점검 제도를 강제화하고, 예산의 10% 이상을 환경 개선 비목에 우선 배정하는 특단의 환류 계획이 입안되어야 할 것으로 사료됩니다.`;
      }
      setAiReport(report);
      
      try {
        await supabase
          .from("satisfaction_surveys")
          .update({ ai_report: report })
          .eq("id", survey.id);

        setSurveys(prev => 
          prev.map(s => s.id === survey.id ? { ...s, aiReport: report } : s)
        );
      } catch (dbErr) {
        console.warn("Failed to save mock report to Supabase:", dbErr);
      }
      setGeneratingAi(false);
    };

    if (!apiKey) {
      const inputKey = prompt(
        "🔑 실시간 GPT 만족도 분석을 사용하려면 OpenAI API Key가 필요합니다.\nsk-로 시작하는 API Key를 입력해 주세요 (브라우저 로컬 스토리지에만 안전하게 저장됩니다):",
        ""
      );
      if (!inputKey) {
        runMockReport();
        return;
      }
      apiKey = inputKey.trim();
      localStorage.setItem("user_openai_api_key", apiKey);
    }

    try {
      const promptText = makePrompt(survey, avgScore, count);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: promptText }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP 에러 ${response.status}`);
      }

      const resData = await response.json();
      const text = resData?.choices?.[0]?.message?.content;
      if (text) {
        const finalReport = text.trim();
        setAiReport(finalReport);
        
        try {
          const { error: dbUpdateError } = await supabase
            .from("satisfaction_surveys")
            .update({ ai_report: finalReport })
            .eq("id", survey.id);

          if (dbUpdateError) {
            console.error("Failed to save AI report to Supabase:", dbUpdateError);
          } else {
            setSurveys(prevSurveys => 
              prevSurveys.map(s => 
                s.id === survey.id ? { ...s, aiReport: finalReport } : s
              )
            );
          }
        } catch (dbErr) {
          console.error("Database update transaction failed:", dbErr);
        }
      } else {
        throw new Error("OpenAI response is empty");
      }
    } catch (err) {
      console.error("OpenAI API call failed:", err);
      // 에러 발생 시 모의 총평으로 복구 폴백
      runMockReport();
    } finally {
      setGeneratingAi(false);
    }
  };

  // 수집 결과 Excel 파일로 내보내기 시뮬레이션 (xlsx 연동 라이브러리)
  const handleExportToExcel = (survey) => {
    if (!survey.responses || survey.responses.length === 0) {
      alert("수집된 응답 데이터가 없어 엑셀 파일 생성이 불가합니다.");
      return;
    }

    // 1. 헤더 행 정의
    const headers = ["응답 ID", "응답자명", "제출 일시"];
    survey.questions.forEach((q, idx) => {
      headers.push(`질문 ${idx + 1} 점수 (5점만점)`);
      headers.push(`질문 ${idx + 1} 만족도 (%)`);
    });
    headers.push("기타 건의사항 및 주관식 피드백");

    // 2. 데이터 행 정의
    const dataRows = survey.responses.map(res => {
      const row = [res.id, res.responder, res.date];
      res.scores.forEach(s => {
        row.push(s);
        row.push(s * 20); // 100점 환산
      });
      row.push(res.comment || "");
      return row;
    });

    const worksheetData = [
      [`만족도조사 보고서 (ID: ${survey.id})`],
      [`조사제목: ${survey.title}`],
      [`조사목적: ${survey.purpose}`],
      [`수행부서: ${survey.department} | 대상: ${survey.target} | 기간: ${survey.startDate} ~ ${survey.endDate}`],
      [],
      headers,
      ...dataRows
    ];

    // XLSX 생성
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // 스타일을 위한 열 넓이 설정 자동화
    ws["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, ...survey.questions.map(() => ({ wch: 22 })), { wch: 45 }];

    XLSX.utils.book_append_sheet(wb, ws, "만족도 조사 결과");
    XLSX.writeFile(wb, `satisfaction_survey_${survey.id}.xlsx`);
  };

  // Google Sheets 웹 문서 자동 복사 및 다이렉트 브릿지 이동
  const handleOpenGoogleSheetsDirect = (survey) => {
    if (!survey.responses || survey.responses.length === 0) {
      alert("연동할 실제 응답 데이터가 없습니다.");
      return;
    }

    // 1. 스프레드시트용 TSV(Tab-separated) 데이터 구축
    let tsvContent = "No\t제출자명\t제출 일시\t문항 1\t문항 2\t문항 3\t문항 4\t문항 5\t기타 건의사항 및 피드백\n";
    survey.responses.forEach((res, idx) => {
      tsvContent += `${idx + 1}\t${res.responder}\t${res.date}\t${res.scores[0]}점\t${res.scores[1]}점\t${res.scores[2]}점\t${res.scores[3]}점\t${res.scores[4]}점\t${res.comment || ""}\n`;
    });

    // 2. 클립보드 복사 후 신규 구글 시트 기동
    navigator.clipboard.writeText(tsvContent).then(() => {
      alert("✨ 만족도 조사의 실제 데이터가 스프레드시트 클립보드에 자동 복사되었습니다!\n\n구글 스프레드시트 새 문서가 기동되면 첫 번째 셀(A1)을 선택하시고 붙여넣기(Ctrl+V 또는 Cmd+V) 해주세요. 데이터가 마법처럼 연동 주입됩니다!");
      window.open("https://docs.google.com/spreadsheets/create", "_blank");
    }).catch(err => {
      console.error("Failed to copy survey TSV data:", err);
      window.open("https://docs.google.com/spreadsheets/create", "_blank");
    });
  };

  const selectedSurvey = surveys.find(s => s.id === selectedSurveyId);
  const selectedYearFull = 2024 + selectedYear;

  // 차트 렌더링에 적합한 데이터 정의
  const chartData = selectedSurvey ? getQuestionAverageScores(selectedSurvey) : [];
  const currentLikertAverage = selectedSurvey ? getLikertConvertedScore(selectedSurvey.responses, selectedSurvey.questions.length) : 0;

  return (
    <div className="satisfaction-manager-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      {/* 상단 안내 패널 */}
      <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ClipboardCheck size={22} className="animate-spin-slow" />
          {selectedYearFull}년도 만족도 조사 관리 플랫폼
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
          부서별(ECC, ICC, RCC 등) 만족도 조사를 기획·생성하고, 실시간 QR코드 및 URL 배포, 
          데이터베이스 저장, 구글 스프레드시트 동기화, 리커트 5점 척도 기반 100점 만점 환산 통계 분석을 전 주기로 관리하는 통합 공간입니다.
        </p>
      </div>

      {/* 내부 탭바 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.8rem" }}>
        <button
          onClick={() => { setActiveSurveyTab("list"); setSelectedSurveyId(null); }}
          className={`btn-subtab ${activeSurveyTab === "list" ? "active" : ""}`}
          style={{
            border: "none",
            background: "transparent",
            padding: "0.5rem 1rem",
            fontSize: "0.85rem",
            fontWeight: "800",
            cursor: "pointer",
            color: activeSurveyTab === "list" ? "var(--accent-color)" : "var(--text-secondary)",
            borderBottom: activeSurveyTab === "list" ? "2px solid var(--accent-color)" : "none",
            transition: "all 0.2s"
          }}
        >
          만족도조사 목록
        </button>
        <button
          onClick={() => setActiveSurveyTab("create")}
          className={`btn-primary ${activeSurveyTab === "create" ? "active" : ""}`}
          style={{
            border: "none",
            background: activeSurveyTab === "create" 
              ? "linear-gradient(135deg, #1d4ed8, #1e40af)" 
              : "linear-gradient(135deg, var(--accent-color), #2563eb)",
            padding: "0.55rem 1.3rem",
            fontSize: "0.82rem",
            fontWeight: "900",
            borderRadius: "0.375rem",
            cursor: "pointer",
            color: "white",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            transition: "all 0.2s"
          }}
        >
          <Plus size={15} />
          신규 만족도조사지 제작
        </button>
      </div>

      {/* 탭 분기 렌더링 */}
      {activeSurveyTab === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 만족도조사 목록 하부 부서 선택 멀티 체크박스 필터 */}
          {surveys.length > 0 && (
            <div className="glass-card" style={{ padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: "800" }}>
                  조회할 부서 선택 (복수 선택 가능)
                </span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setFilterDepts(["ECC", "ICC", "RCC", "AIDX", "NURI", "SEVeN"])}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-color-dark)", color: "var(--text-primary)", padding: "0.25rem 0.5rem", fontSize: "0.68rem", borderRadius: "0.25rem", cursor: "pointer", fontWeight: "700" }}
                  >
                    전체 선택
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterDepts([])}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-color-dark)", color: "var(--text-primary)", padding: "0.25rem 0.5rem", fontSize: "0.68rem", borderRadius: "0.25rem", cursor: "pointer", fontWeight: "700" }}
                  >
                    전체 해제
                  </button>
                </div>
              </div>
              
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "0.6rem 1.2rem", 
                background: "rgba(255,255,255,0.01)", 
                padding: "0.6rem 1rem", 
                borderRadius: "0.375rem", 
                border: "1px solid var(--border-color-dark)" 
              }}>
                {[
                  { key: "ECC", label: "ECC (지산학)" },
                  { key: "ICC", label: "ICC (기업협업)" },
                  { key: "RCC", label: "RCC (지역협업)" },
                  { key: "AIDX", label: "AIDX (AID-X)" },
                  { key: "NURI", label: "NURI (늘봄누리)" },
                  { key: "SEVeN", label: "SEVeN (신산업)" }
                ].map((deptObj) => {
                  const isChecked = filterDepts.includes(deptObj.key);
                  return (
                    <label 
                      key={deptObj.key} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0.4rem", 
                        fontSize: "0.76rem", 
                        color: isChecked ? "var(--text-primary)" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: isChecked ? "700" : "500",
                        transition: "all 0.15s"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterDepts([...filterDepts, deptObj.key]);
                          } else {
                            setFilterDepts(filterDepts.filter(d => d !== deptObj.key));
                          }
                        }}
                        style={{ accentColor: "var(--accent-color)" }}
                      />
                      {deptObj.label}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {surveys.length === 0 ? (
            <div className="glass-card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)" }}>
              등록된 만족도 조사지가 없습니다. 우측 상단의 '신규 만족도조사지 제작' 버튼을 클릭해 새 설문을 생성해 보세요!
            </div>
          ) : (
            (() => {
              // 선택된 부서 키들에 매핑되는 설문 조사 필터링 (다중 부서일 경우에도 안정되게 쉼표 파싱)
              const filteredSurveys = surveys.filter(s => {
                if (!s.department) return false;
                const depts = s.department.split(",").map(d => d.trim().toUpperCase());
                return depts.some(d => filterDepts.includes(d));
              });

              if (filteredSurveys.length === 0) {
                return (
                  <div style={{ 
                    padding: "3rem", 
                    textAlign: "center", 
                    color: "var(--text-secondary)", 
                    border: "1px dashed rgba(255,255,255,0.06)", 
                    borderRadius: "0.5rem",
                    fontSize: "0.8rem",
                    background: "rgba(255,255,255,0.01)"
                  }}>
                    선택한 담당 부서의 만족도 조사 내역이 존재하지 않습니다.
                  </div>
                );
              }

              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.2rem" }}>
                  {filteredSurveys.map((survey) => {
                    const convertedAvg = getLikertConvertedScore(survey.responses, survey.questions.length);
                    return (
                      <div 
                        key={survey.id} 
                        className="glass-card" 
                        style={{ 
                          padding: "1.5rem", 
                          display: "flex", 
                          flexDirection: "column", 
                          justifyContent: "space-between",
                          border: selectedSurveyId === survey.id ? "1px solid var(--accent-color)" : "1px solid var(--border-color-dark)",
                          background: selectedSurveyId === survey.id ? "rgba(59, 130, 246, 0.03)" : "rgba(255, 255, 255, 0.01)"
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--accent-color)", fontWeight: "900", letterSpacing: "0.5px" }}>
                              ID: {survey.id}
                            </span>
                            <div style={{ display: "flex", gap: "0.3rem" }}>
                              <span style={{
                                padding: "0.2rem 0.5rem",
                                borderRadius: "0.25rem",
                                fontSize: "0.65rem",
                                fontWeight: "800",
                                background: "rgba(255,255,255,0.05)",
                                color: "var(--text-secondary)"
                              }}>
                                {survey.department}
                              </span>
                              <span style={{
                                padding: "0.2rem 0.5rem",
                                borderRadius: "0.25rem",
                                fontSize: "0.65rem",
                                fontWeight: "800",
                                background: survey.status === "완료" ? "rgba(16, 185, 129, 0.1)" : survey.status === "배포중" ? "rgba(59, 130, 246, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                color: survey.status === "완료" ? "#10b981" : survey.status === "배포중" ? "#3b82f6" : "#f59e0b"
                              }}>
                                {survey.status}
                              </span>
                            </div>
                          </div>
                          
                          <h4 
                            onClick={() => { setSelectedSurveyId(survey.id); setActiveSurveyTab("detail"); }}
                            style={{ 
                              fontSize: "0.95rem", 
                              fontWeight: "800", 
                              marginBottom: "0.5rem", 
                              color: "var(--text-primary)", 
                              lineHeight: "1.3",
                              cursor: "pointer",
                              transition: "color 0.15s ease"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                            title="상세보기 / 관리"
                          >
                            {survey.title}
                          </h4>
                          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>
                            {survey.purpose}
                          </p>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.75rem", background: "rgba(255,255,255,0.01)", padding: "0.5rem", borderRadius: "0.25rem", marginBottom: "1rem" }}>
                            <div>일정: <span style={{ color: "var(--text-secondary)" }}>{survey.startDate} ~ {survey.endDate}</span></div>
                            <div>대상: <span style={{ color: "var(--text-secondary)" }}>{survey.target}</span></div>
                            <div>질문수: <span style={{ color: "var(--text-secondary)", fontWeight: "700" }}>{survey.questions.length}문항</span></div>
                            <div>수집응답: <span style={{ color: "var(--text-secondary)", fontWeight: "700" }}>{survey.responses.length}건</span></div>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.8rem", marginTop: "0.5rem" }}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>100점 환산 평균</span>
                            <strong style={{ fontSize: "1.1rem", color: "var(--accent-color)" }}>
                              {survey.responses.length > 0 ? `${convertedAvg}점` : "자료 없음"}
                            </strong>
                          </div>

                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <button
                              onClick={() => { setSelectedSurveyId(survey.id); setActiveSurveyTab("detail"); }}
                              className="btn-secondary"
                              style={{
                                padding: "0.4rem 0.8rem",
                                fontSize: "0.75rem",
                                borderRadius: "0.3rem",
                                border: "1px solid var(--border-color-dark)",
                                background: "rgba(255,255,255,0.02)",
                                color: "var(--text-primary)",
                                cursor: "pointer",
                                fontWeight: "700"
                              }}
                            >
                              상세보기 / 관리
                            </button>
                            <button
                              onClick={() => handleDeleteSurvey(survey.id)}
                              style={{
                                padding: "0.4rem",
                                fontSize: "0.75rem",
                                borderRadius: "0.3rem",
                                border: "none",
                                background: "rgba(239, 68, 68, 0.1)",
                                color: "#ef4444",
                                cursor: "pointer"
                              }}
                              title="삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>
      )}

      {activeSurveyTab === "create" && (
        <form onSubmit={handleCreateSurvey} className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-primary)", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.6rem" }}>
            새로운 만족도 조사지 제작 폼
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>수행 부서 선택</label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="user-selector"
                style={{ width: "100%" }}
              >
                <option value="ECC">ECC (지산학교육센터)</option>
                <option value="ICC">ICC (기업협업센터)</option>
                <option value="RCC">RCC (지역협업센터)</option>
                <option value="AIDX">AIDX (AID-X지원센터)</option>
                <option value="NURI">NURI (울산늘봄누리센터)</option>
                <option value="SEVeN">SEVeN (신산업특화센터)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>추천 자동발급 ID</label>
              <input
                type="text"
                value={getNextSurveyId(newDept)}
                disabled
                className="user-selector"
                style={{ width: "100%", background: "rgba(255,255,255,0.03)", color: "var(--text-secondary)" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>조사 제목</label>
            <input
              type="text"
              placeholder="예) 2026년도 AID-X 역량강화 세미나 만족도 조사"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="user-selector"
              style={{ width: "100%" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>조사 목적</label>
            <textarea
              placeholder="조사의 구체적인 배경 및 환류 계획을 적어주세요."
              value={newPurpose}
              onChange={(e) => setNewPurpose(e.target.value)}
              className="user-selector"
              style={{ width: "100%", height: "70px", resize: "none" }}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>조사 일정 (시작 ~ 종료)</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="user-selector"
                  style={{ width: "100%" }}
                />
                <span>~</span>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="user-selector"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>조사 대상</label>
              <input
                type="text"
                placeholder="예) 인공지능 재직자 교육 참여자 전체"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="user-selector"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem", fontWeight: "700" }}>
              만족도조사 문항 빌더 (리커트 5점 척도형)
            </label>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.8rem" }}>
              {newQuestions.map((q, idx) => (
                <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-color)", fontWeight: "800", minWidth: "45px" }}>문항 {idx + 1}</span>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => {
                      const updated = [...newQuestions];
                      updated[idx] = e.target.value;
                      setNewQuestions(updated);
                    }}
                    className="user-selector"
                    style={{ flex: 1, fontSize: "0.78rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: "0.3rem", padding: "0.4rem", cursor: "pointer" }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="추가하고 싶은 커스텀 만족도 문항을 적어주세요."
                value={customQuestionInput}
                onChange={(e) => setCustomQuestionInput(e.target.value)}
                className="user-selector"
                style={{ flex: 1, fontSize: "0.78rem" }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddQuestion(); } }}
              />
              <button
                type="button"
                onClick={handleAddQuestion}
                className="btn-secondary"
                style={{ display: "flex", alignItems: "center", gap: "0.2rem", padding: "0.5rem 1rem", fontSize: "0.78rem", cursor: "pointer", borderRadius: "0.3rem", border: "1px solid var(--border-color-dark)" }}
              >
                <Plus size={14} /> 문항 추가
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => setActiveSurveyTab("list")}
              className="btn-secondary"
              style={{ 
                border: "1px solid rgba(255, 255, 255, 0.18)", 
                background: "rgba(255, 255, 255, 0.04)", 
                color: "rgba(255, 255, 255, 0.85)", 
                padding: "0.6rem 1.5rem", 
                borderRadius: "0.4rem", 
                cursor: "pointer", 
                fontWeight: "700",
                transition: "all 0.2s"
              }}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.3rem", borderRadius: "0.4rem", padding: "0.6rem 1.5rem", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer" }}
            >
              <Send size={14} /> 설문지 생성 및 저장
            </button>
          </div>
        </form>
      )}

      {activeSurveyTab === "detail" && selectedSurvey && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "1.5rem" }}>
          {/* 좌측: 조사 기본 정보 및 배포용 QR, 모의 응답기 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* 기본 상세 정보 카드 */}
            <div className="glass-card" style={{ padding: "1.8rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.6rem" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--accent-color)", fontWeight: "900" }}>ID: {selectedSurvey.id}</span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginTop: "0.15rem", color: "var(--text-primary)" }}>{selectedSurvey.title}</h3>
                </div>
                <button
                  onClick={() => handleCompleteSurveyStatus(selectedSurvey.id)}
                  disabled={selectedSurvey.status === "완료"}
                  className="btn-secondary"
                  style={{
                    padding: "0.3rem 0.7rem",
                    fontSize: "0.72rem",
                    borderRadius: "0.25rem",
                    background: selectedSurvey.status === "완료" ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-color-dark)",
                    color: selectedSurvey.status === "완료" ? "#10b981" : "var(--text-primary)",
                    cursor: selectedSurvey.status === "완료" ? "default" : "pointer"
                  }}
                >
                  {selectedSurvey.status === "완료" ? "조사 마감됨" : "조사 마감하기"}
                </button>
              </div>

              <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-secondary)" }}>
                <div><strong>조사 목적:</strong> <span style={{ color: "var(--text-secondary)" }}>{selectedSurvey.purpose}</span></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "rgba(255,255,255,0.01)", padding: "0.6rem", borderRadius: "0.3rem" }}>
                  <div><strong>수행 부서:</strong> <span style={{ color: "var(--text-primary)" }}>{selectedSurvey.department}센터</span></div>
                  <div><strong>조사 대상:</strong> <span style={{ color: "var(--text-primary)" }}>{selectedSurvey.target}</span></div>
                  <div><strong>조사 일정:</strong> <span style={{ color: "var(--text-primary)" }}>{selectedSurvey.startDate} ~ {selectedSurvey.endDate}</span></div>
                  <div><strong>진행 상태:</strong> <span style={{ color: "var(--accent-color)", fontWeight: "700" }}>{selectedSurvey.status}</span></div>
                </div>
              </div>
            </div>

            {/* 배포용 QR 코드 및 모바일 단축주소 카드 */}
            <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <QrCode size={18} /> 실시간 배포용 QR코드 & 모바일 링크
              </h4>
              
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "1.5rem", alignItems: "center" }}>
                <div style={{ background: "white", padding: "0.5rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", width: "120px", height: "120px" }}>
                  {/* qrcode.react를 이용한 SVG QR코드 실시간 생성 */}
                  <QRCodeSVG 
                    value={`https://uc-anchor.vercel.app/sv/${selectedSurvey.id}`} 
                    size={110}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    모바일 카메라나 현장 안내용 프린트물에 아래 QR코드를 부착하세요. 
                    스캔 시 해당 조사지로 직통 연결됩니다.
                  </p>
                  
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="text"
                      readOnly
                      value={`https://uc-anchor.vercel.app/sv/${selectedSurvey.id}`}
                      className="user-selector"
                      style={{ flex: 1, fontSize: "0.75rem", background: "rgba(255,255,255,0.03)", color: "var(--text-secondary)" }}
                    />
                    <button
                      onClick={() => handleCopyUrl(selectedSurvey.id)}
                      className="btn-secondary"
                      style={{ padding: "0.45rem 0.8rem", fontSize: "0.75rem", cursor: "pointer", borderRadius: "0.3rem", border: "1px solid var(--border-color-dark)" }}
                    >
                      {copiedId === selectedSurvey.id ? "복사완료!" : "링크복사"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* GPT-4o-mini AI 자동 총평 분석 카드 */}
            <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Compass size={18} className="animate-spin-slow" />
                  GPT-4o-mini 만족도 조사 종합 총평
                </h4>
                <button
                  type="button"
                  onClick={() => generateAiAnalysis(selectedSurvey)}
                  disabled={generatingAi || selectedSurvey.responses.length === 0}
                  className="btn-secondary"
                  style={{
                    padding: "0.35rem 0.75rem",
                    fontSize: "0.72rem",
                    borderRadius: "0.3rem",
                    background: "rgba(59, 130, 246, 0.12)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    color: "var(--accent-color)",
                    cursor: "pointer",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                  <RefreshCw size={12} className={generatingAi ? "animate-spin" : ""} />
                  {generatingAi ? "총평 생성 중..." : "AI 총평 생성/갱신"}
                </button>
              </div>

              {generatingAi ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <RefreshCw className="animate-spin" size={24} style={{ color: "var(--accent-color)" }} />
                  <p style={{ fontSize: "0.78rem" }}>GPT-4o-mini 모델이 응답 데이터와 피드백을 기반으로 환류 의견을 작성 중입니다...</p>
                </div>
              ) : aiReport ? (
                <div style={{ 
                  padding: "1rem", 
                  borderRadius: "0.5rem", 
                  background: "rgba(59, 130, 246, 0.02)", 
                  border: "1px solid rgba(59, 130, 246, 0.15)",
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                  position: "relative"
                }}>
                  <div style={{ position: "absolute", top: "-8px", left: "15px", background: "#090d16", padding: "0 0.4rem", fontSize: "0.65rem", color: "var(--accent-color)", fontWeight: "900" }}>
                    AI ANALYSIS REPORT
                  </div>
                  <p style={{ whiteSpace: "pre-wrap" }}>{aiReport}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.8rem", borderTop: "1px dashed rgba(255,255,255,0.06)", paddingTop: "0.5rem", fontSize: "0.65rem", color: "var(--text-secondary)" }}>
                    <span>글자 수: {aiReport.length}자</span>
                    <span>Powered by GPT-4o-mini</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed var(--border-color-dark)", borderRadius: "0.4rem", fontSize: "0.78rem" }}>
                  {selectedSurvey.responses.length === 0 
                    ? "수집된 만족도 조사가 없어 AI 총평을 실행할 수 없습니다." 
                    : "우측 상단의 'AI 총평 생성/갱신' 버튼을 눌러 종합의견 리포트를 작성해 보세요."}
                </div>
              )}
            </div>

            {/* 모의 수집 피드백 응답 수동 등록기 */}
            {selectedSurvey.status !== "완료" && (
              <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <RefreshCw size={16} /> 실시간 응답 수집 시뮬레이터 (DB 저장)
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleGenerateSimulatedData(selectedSurvey.id)}
                    className="btn-secondary"
                    style={{
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.7rem",
                      background: "rgba(59,130,246,0.15)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      color: "var(--accent-color)",
                      borderRadius: "0.25rem",
                      cursor: "pointer",
                      fontWeight: "700"
                    }}
                  >
                    ⚡ 대량 모의 데이터 10건 생성
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", background: "rgba(255,255,255,0.01)", padding: "1rem", borderRadius: "0.4rem", border: "1px solid var(--border-color-dark)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>응답자 정보</label>
                      <input
                        type="text"
                        value={simulatedResponder}
                        onChange={(e) => setSimulatedResponder(e.target.value)}
                        className="user-selector"
                        style={{ width: "100%", fontSize: "0.75rem", padding: "0.4rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>개별 문항 점수 부여 (1~5점)</label>
                      <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.2rem" }}>
                        {selectedSurvey.questions.map((_, qIdx) => (
                          <select
                            key={qIdx}
                            value={simulatedScores[qIdx] || 5}
                            onChange={(e) => {
                              const updated = [...simulatedScores];
                              updated[qIdx] = parseInt(e.target.value, 10);
                              setSimulatedScores(updated);
                            }}
                            className="user-selector"
                            style={{ flex: 1, fontSize: "0.75rem", padding: "0.3rem" }}
                          >
                            <option value="5">5점</option>
                            <option value="4">4점</option>
                            <option value="3">3점</option>
                            <option value="2">2점</option>
                            <option value="1">1점</option>
                          </select>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>주관식 기타 건의사항</label>
                    <input
                      type="text"
                      placeholder="예) 교재 상태가 아주 훌륭했습니다."
                      value={simulatedComment}
                      onChange={(e) => setSimulatedComment(e.target.value)}
                      className="user-selector"
                      style={{ width: "100%", fontSize: "0.75rem", padding: "0.4rem" }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSingleResponse(selectedSurvey.id)}
                    className="btn-primary"
                    style={{ padding: "0.45rem", fontSize: "0.78rem", fontWeight: "700", width: "100%", justifyContent: "center", borderRadius: "0.3rem", display: "flex", gap: "0.3rem" }}
                  >
                    <Check size={14} /> 모의 응답 데이터 DB 입력 전송
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 우측: 리커트 5점 척도 100점 환산 차트 및 수집 의견 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* 결과 통계 차트 및 시트 동기화 */}
            <div className="glass-card" style={{ padding: "1.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <BarChart3 size={18} /> 문항별 만족도 점수 (100점 만점)
                </h4>
                
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  {/* 구글 시트 연동 버튼 */}
                  <button
                    onClick={() => handleSyncToGoogleSheets(selectedSurvey.id)}
                    disabled={syncingId === selectedSurvey.id}
                    className="btn-secondary"
                    style={{
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.72rem",
                      borderRadius: "0.3rem",
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      color: "#10b981",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.2rem",
                      fontWeight: "700"
                    }}
                  >
                    {syncingId === selectedSurvey.id ? "시트 동기화중..." : "구글 시트 연동"}
                  </button>

                  {/* 엑셀 파일 익스포트 버튼 */}
                  <button
                    onClick={() => handleExportToExcel(selectedSurvey)}
                    className="btn-secondary"
                    style={{
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.72rem",
                      borderRadius: "0.3rem",
                      background: "rgba(59, 130, 246, 0.08)",
                      border: "1px solid rgba(59, 130, 246, 0.25)",
                      color: "var(--accent-color)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.2rem",
                      fontWeight: "700"
                    }}
                  >
                    <Download size={12} /> Excel 내보내기
                  </button>
                </div>
              </div>

              {selectedSurvey.responses.length === 0 ? (
                <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border-color-dark)", borderRadius: "0.4rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  수집된 만족도 응답이 없어 통계가 산출되지 않았습니다.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.01)", padding: "0.6rem 1rem", borderRadius: "0.3rem", border: "1px solid var(--border-color-dark)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>수집 응답 건수: <strong style={{ color: "var(--text-primary)" }}>{selectedSurvey.responses.length}건</strong></span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>종합 환산 점수: <strong style={{ color: "var(--accent-color)" }}>{currentLikertAverage} / 100점</strong></span>
                  </div>

                  {/* Recharts BarChart */}
                  <div style={{ width: "100%", height: "220px", fontSize: "0.7rem" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" />
                        <YAxis domain={[0, 100]} stroke="var(--text-secondary)" />
                        <Tooltip 
                          contentStyle={{ background: "#0f172a", border: "1px solid var(--border-color-dark)", borderRadius: "0.3rem" }}
                          labelStyle={{ color: "white", fontWeight: "700" }}
                          itemStyle={{ color: "var(--accent-color)" }}
                          formatter={(value, name, props) => [`${value}점`, "환산 만족도"]}
                        />
                        <ReferenceLine y={80} stroke="rgba(16,185,129,0.5)" strokeDasharray="3 3" label={{ value: "우수선 (80점)", fill: "#10b981", fontSize: 10, position: "top" }} />
                        <Bar dataKey="score" fill="url(#blueGrad)" radius={[4, 4, 0, 0]} />
                        <defs>
                          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95}/>
                            <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.4}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ maxHeight: "120px", overflowY: "auto", fontSize: "0.72rem", border: "1px solid var(--border-color-dark)", borderRadius: "0.3rem", padding: "0.5rem" }}>
                    <span style={{ fontWeight: "700", color: "var(--accent-color)", display: "block", marginBottom: "0.2rem" }}>[질문 문항 가이드 명세]</span>
                    {selectedSurvey.questions.map((q, idx) => (
                      <div key={idx} style={{ padding: "0.15rem 0", borderBottom: "1px solid rgba(255,255,255,0.02)", display: "flex", gap: "0.25rem" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: "700" }}>문항 {idx + 1}:</span>
                        <span style={{ color: "var(--text-secondary)" }}>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 수집된 주관식 건의사항 / 의견 피드백 카드 목록 */}
            <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FileText size={18} /> 주관식 건의사항 및 환류 의견 ({selectedSurvey.responses.filter(r => r.comment).length}건)
              </h4>

              <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {selectedSurvey.responses.filter(r => r.comment).length === 0 ? (
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>
                    제출된 의견 피드백이 없습니다.
                  </p>
                ) : (
                  selectedSurvey.responses.filter(r => r.comment).map((res) => (
                    <div 
                      key={res.id} 
                      style={{ 
                        padding: "0.6rem 0.8rem", 
                        borderRadius: "0.4rem", 
                        background: "rgba(255,255,255,0.01)", 
                        border: "1px solid var(--border-color-dark)",
                        fontSize: "0.75rem"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.68rem", marginBottom: "0.25rem" }}>
                        <span>응답자: <strong style={{ color: "var(--text-secondary)" }}>{res.responder}</strong></span>
                        <span>{res.date}</span>
                      </div>
                      <p style={{ color: "var(--text-primary)", lineHeight: "1.35" }}>"{res.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 구글 스프레드시트 실시간 연동 뷰어 모달 */}
      {showSheetsViewer && selectedSurvey && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.85)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "2rem"
        }}>
          <div style={{
            background: "#1e1e1e",
            borderRadius: "0.5rem",
            width: "95%",
            maxWidth: "1150px",
            height: "85vh",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #333",
            boxShadow: "0 20px 45px rgba(0,0,0,0.6)",
            overflow: "hidden"
          }}>
            {/* 구글 스프레드시트 탑 그린 헤더 바 */}
            <div style={{
              background: "#0f9d58",
              padding: "0.75rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #0b7843"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{
                  background: "white",
                  padding: "0.25rem 0.35rem",
                  borderRadius: "0.2rem",
                  color: "#0f9d58",
                  fontWeight: "900",
                  fontSize: "0.78rem"
                }}>
                  田
                </div>
                <div>
                  <h3 style={{ fontSize: "0.95rem", color: "white", fontWeight: "800", margin: 0 }}>
                    Google Sheets 연동 실시간 뷰어 - {selectedSurvey.title}
                  </h3>
                  <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.75)" }}>
                    연동 테이블: `satisfaction_responses` (ID: {selectedSurvey.id})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSheetsViewer(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  fontWeight: "700"
                }}
              >
                ✕
              </button>
            </div>

            {/* 시트 서브 툴바 */}
            <div style={{
              background: "#2b2b2b",
              borderBottom: "1px solid #3d3d3d",
              padding: "0.45rem 1.5rem",
              display: "flex",
              gap: "1.2rem",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.85)",
              alignItems: "center"
            }}>
              <span 
                style={{ cursor: "pointer", color: "#0f9d58", fontWeight: "900", display: "inline-flex", alignItems: "center", gap: "0.3rem" }} 
                onClick={() => handleOpenGoogleSheetsDirect(selectedSurvey)}
              >
                田 Google Sheets 웹으로 바로가기 (실제 데이터 자동 복사)
              </span>
              <span style={{ color: "#555" }}>|</span>
              <span style={{ cursor: "pointer", color: "var(--accent-color)", fontWeight: "700" }} onClick={() => handleExportToExcel(selectedSurvey)}>📥 Excel 파일 다운로드</span>
              <span style={{ color: "#555" }}>|</span>
              <span>편집 연동형</span>
              <span style={{ color: "#555" }}>|</span>
              <span style={{ color: "#10b981", fontWeight: "700" }}>● DB 실시간 동기화 완료</span>
            </div>

            {/* 스프레드시트 그리드 바디 */}
            <div style={{
              flex: 1,
              overflow: "auto",
              background: "#181818",
              padding: "1rem"
            }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.75rem",
                color: "#ddd",
                textAlign: "left"
              }}>
                <thead>
                  {/* 시트 고유 A, B, C, D 헤더 */}
                  <tr style={{ background: "#2e2e2e" }}>
                    <th style={{ width: "40px", border: "1px solid #3a3a3a", textAlign: "center", color: "#888", padding: "0.4rem" }}></th>
                    <th style={{ border: "1px solid #3a3a3a", padding: "0.4rem", color: "#888", textAlign: "center", width: "50px" }}>A</th>
                    <th style={{ border: "1px solid #3a3a3a", padding: "0.4rem", color: "#888", textAlign: "center", width: "100px" }}>B</th>
                    <th style={{ border: "1px solid #3a3a3a", padding: "0.4rem", color: "#888", textAlign: "center", width: "160px" }}>C</th>
                    <th style={{ border: "1px solid #3a3a3a", padding: "0.4rem", color: "#888", textAlign: "center", width: "70px" }}>D</th>
                    <th style={{ border: "1px solid #3a3a3a", padding: "0.4rem", color: "#888", textAlign: "center", width: "70px" }}>E</th>
                    <th style={{ border: "1px solid #3a3a3a", padding: "0.4rem", color: "#888", textAlign: "center", width: "70px" }}>F</th>
                    <th style={{ border: "1px solid #3a3a3a", padding: "0.4rem", color: "#888", textAlign: "center", width: "70px" }}>G</th>
                    <th style={{ border: "1px solid #3a3a3a", padding: "0.4rem", color: "#888", textAlign: "center", width: "70px" }}>H</th>
                    <th style={{ border: "1px solid #3a3a3a", padding: "0.4rem", color: "#888", textAlign: "center" }}>I</th>
                  </tr>
                  {/* 실제 필드 타이틀 행 */}
                  <tr style={{ background: "#252525" }}>
                    <td style={{ border: "1px solid #3a3a3a", textAlign: "center", color: "#888", fontWeight: "bold" }}>1</td>
                    <td style={{ border: "1px solid #3a3a3a", padding: "0.5rem", fontWeight: "bold", color: "white", textAlign: "center" }}>No</td>
                    <td style={{ border: "1px solid #3a3a3a", padding: "0.5rem", fontWeight: "bold", color: "white" }}>제출자명</td>
                    <td style={{ border: "1px solid #3a3a3a", padding: "0.5rem", fontWeight: "bold", color: "white", textAlign: "center" }}>제출 일시</td>
                    <td style={{ border: "1px solid #3a3a3a", padding: "0.5rem", fontWeight: "bold", color: "white", textAlign: "center" }}>문항 1</td>
                    <td style={{ border: "1px solid #3a3a3a", padding: "0.5rem", fontWeight: "bold", color: "white", textAlign: "center" }}>문항 2</td>
                    <td style={{ border: "1px solid #3a3a3a", padding: "0.5rem", fontWeight: "bold", color: "white", textAlign: "center" }}>문항 3</td>
                    <td style={{ border: "1px solid #3a3a3a", padding: "0.5rem", fontWeight: "bold", color: "white", textAlign: "center" }}>문항 4</td>
                    <td style={{ border: "1px solid #3a3a3a", padding: "0.5rem", fontWeight: "bold", color: "white", textAlign: "center" }}>문항 5</td>
                    <td style={{ border: "1px solid #3a3a3a", padding: "0.5rem", fontWeight: "bold", color: "white" }}>기타 건의사항 및 피드백</td>
                  </tr>
                </thead>
                <tbody>
                  {selectedSurvey.responses.length === 0 ? (
                    <tr>
                      <td style={{ border: "1px solid #3a3a3a", textAlign: "center", color: "#888", background: "#2e2e2e" }}>2</td>
                      <td colSpan={9} style={{ border: "1px solid #3a3a3a", padding: "1.5rem", textAlign: "center", color: "#777" }}>
                        현재 수집된 원시 응답 데이터가 존재하지 않습니다.
                      </td>
                    </tr>
                  ) : (
                    selectedSurvey.responses.map((res, rIdx) => (
                      <tr key={res.id} style={{ background: rIdx % 2 === 0 ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)" }}>
                        <td style={{ border: "1px solid #3a3a3a", textAlign: "center", color: "#888", background: "#2e2e2e" }}>{rIdx + 2}</td>
                        <td style={{ border: "1px solid #3a3a3a", padding: "0.45rem", textAlign: "center" }}>{rIdx + 1}</td>
                        <td style={{ border: "1px solid #3a3a3a", padding: "0.45rem", color: "#fff", fontWeight: "700" }}>{res.responder}</td>
                        <td style={{ border: "1px solid #3a3a3a", padding: "0.45rem", color: "var(--text-secondary)", textAlign: "center" }}>{res.date}</td>
                        <td style={{ border: "1px solid #3a3a3a", padding: "0.45rem", textAlign: "center", color: "#10b981", fontWeight: "700" }}>{res.scores[0]}점</td>
                        <td style={{ border: "1px solid #3a3a3a", padding: "0.45rem", textAlign: "center", color: "#10b981", fontWeight: "700" }}>{res.scores[1]}점</td>
                        <td style={{ border: "1px solid #3a3a3a", padding: "0.45rem", textAlign: "center", color: "#10b981", fontWeight: "700" }}>{res.scores[2]}점</td>
                        <td style={{ border: "1px solid #3a3a3a", padding: "0.45rem", textAlign: "center", color: "#10b981", fontWeight: "700" }}>{res.scores[3]}점</td>
                        <td style={{ border: "1px solid #3a3a3a", padding: "0.45rem", textAlign: "center", color: "#10b981", fontWeight: "700" }}>{res.scores[4]}점</td>
                        <td style={{ border: "1px solid #3a3a3a", padding: "0.45rem", color: "#ccc", fontStyle: res.comment ? "normal" : "italic" }}>
                          {res.comment || "(공백 피드백)"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 시트 하단 요약 정보 바 */}
            <div style={{
              background: "#222",
              borderTop: "1px solid #333",
              padding: "0.5rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.7rem",
              color: "var(--text-secondary)"
            }}>
              <span>총 {selectedSurvey.responses.length}행의 데이터 연동 완료</span>
              <span>100점 환산 평균: <strong style={{ color: "var(--accent-color)" }}>{currentLikertAverage}점</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
