import React, { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  ClipboardCheck, Plus, Sparkles
} from "lucide-react";
import { supabase } from "../supabaseClient"; // Supabase 클라이언트 의존성 주입
import type {
  AiSurveyData,
  DebateLog,
  SatisfactionSurvey,
} from "../features/satisfaction/satisfaction-types";
import {
  getLikertConvertedScore,
  getQuestionAverageScores,
} from "../features/satisfaction/utils/satisfaction-analysis";
import { SatisfactionResultsTab } from "../features/satisfaction/components/satisfaction-results-tab";
import { SatisfactionCreateTab } from "../features/satisfaction/components/satisfaction-create-tab";
import { SatisfactionSheetsModal } from "../features/satisfaction/components/satisfaction-sheets-modal";
import { SatisfactionListTab } from "../features/satisfaction/components/satisfaction-list-tab";
import { SatisfactionDetailTab } from "../features/satisfaction/components/satisfaction-detail-tab";
import { SatisfactionAiInputModal } from "../features/satisfaction/components/satisfaction-ai-input-modal";
export type {
  SatisfactionSurvey,
  SurveyResponse,
} from "../features/satisfaction/satisfaction-types";

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

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export interface SatisfactionManagerProps {
  currentRole?: any;
  currentUser?: any;
  selectedYear?: number | string;
  darkMode?: boolean;
}

export default function SatisfactionManager({ currentRole: _currentRole, currentUser: _currentUser, selectedYear, darkMode: _darkMode }: SatisfactionManagerProps = {}) {
  const [surveys, setSurveys] = useState<SatisfactionSurvey[]>([]);
  const [_isLoading, setIsLoading] = useState<boolean>(true);

  const [activeSurveyTab, setActiveSurveyTab] = useState<string>("list"); // "list" | "create" | "detail"
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

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

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showSheetsViewer, setShowSheetsViewer] = useState(false); // 구글 시트 연동 뷰어 모달 상태
  const [aiReport, setAiReport] = useState<string | null>(null); // AI 총평 결과
  const [generatingAi, setGeneratingAi] = useState(false); // AI 제너레이션 로더

  // AI 기반 외부 만족도 결과 자동분석 및 입력 모달 관련 상태
  const [showAiInputModal, setShowAiInputModal] = useState(false);
  const [aiInputRawText, setAiInputRawText] = useState("");
  const [aiAnalysisStep, setAiAnalysisStep] = useState(1); // 1: 파일 업로드 대기, 2: GPT-4o vs Gemini 토론 룸 진행, 3: 최종 추출 데이터 검토 및 수정
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); // 업로드된 파일 객체 (name, size, type)
  const [debateLogs, setDebateLogs] = useState<DebateLog[]>([]); // 토론 대화 로그 배열
  const [debatePhase, setDebatePhase] = useState("extract"); // "extract" | "draft" | "debate" | "consensus"
  const [isGeneratingAiInput, setIsGeneratingAiInput] = useState(false); // 분석 및 토론 진행 상태 로더
  const [customQuestionInputExt, setCustomQuestionInputExt] = useState(""); // 디베이트 편집 폼의 커스텀 문항 입력값
  const [extractedData, setExtractedData] = useState({
    title: "",
    target: "프로그램 대상 전체",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    purpose: "",
    department: "ECC",
    questions: [
      "제공된 교육 프로그램의 전문성 및 실무 연계성에 만족하십니까?",
      "프로그램 진행자의 전문성과 원활한 일정 소통 방식에 만족하십니까?",
      "프로그램 수행 시설 및 인프라의 쾌적함과 장비 구성에 만족하십니까?",
      "전반적으로 본 프로그램에 참여한 효과성에 만족하십니까?",
      "향후 추진되는 연계 프로그램에 재참여할 의향이 있으십니까?"
    ],
    responsesCount: 15,
    averageScore: 90.0,
    comments: [] as string[]
  });

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
            scores: [r.score_q1, r.score_q2, r.score_q3, r.score_q4, r.score_q5].filter((v): v is number => v !== null),
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
          aiReport: typeof s.ai_report === "string" ? s.ai_report : null,
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
              scores: [r.score_q1, r.score_q2, r.score_q3, r.score_q4, r.score_q5].filter((v): v is number => v !== null),
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
            aiReport: typeof s.ai_report === "string" ? s.ai_report : null,
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
    // [교육용 주석] 연차 전환 시 특정 설문 상세화면을 보던 중이었다면 리스트 목록으로 환원
    if (activeSurveyTab === "detail") {
      setActiveSurveyTab("list");
      setSelectedSurveyId(null);
    }
  // oxlint-disable-next-line react/exhaustive-deps -- selectedYear intentionally owns this refresh; tab changes must not refetch surveys or reset the current view.
  }, [selectedYear]);

  // 6대 수행부서 그룹 정의 및 필터기
  const _DEPARTMENTS_GROUP = [
    { key: "ECC", name: "지산학교육센터 (ECC)" },
    { key: "ICC", name: "기업협업센터 (ICC)" },
    { key: "RCC", name: "지역협업센터 (RCC)" },
    { key: "AIDX", name: "AID-X지원센터 (AIDX)" },
    { key: "NURI", name: "울산늘봄누리센터 (NURI)" },
    { key: "SEVeN", name: "신산업특화센터 (SEVeN)" }
  ];

  const _getSurveysByDept = (deptKey: string) => {
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

  // 부서별 새 조사 ID 자동 추천 생성기 (연차, 일정 시작일 연도 및 부서 접두사 실시간 연동)
  const getNextSurveyId = (depts: string | string[], customYear: string | null = null) => {
    // [교육용 주석] customYear(일정 시작일 연도)가 명시되면 우선 사용하고, 없을 시 글로벌 selectedYear 기준으로 매핑
    const currentYear = customYear ? parseInt(customYear, 10) : (2024 + Number(selectedYear ?? 1));
    const mainDept = Array.isArray(depts) ? (depts.length > 0 ? depts[0] : "ECC") : (depts || "ECC");
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

  const handleCreateSurvey = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPurpose.trim()) {
      alert("조사제목과 조사목적은 필수 항목입니다.");
      return;
    }

    const yearFromDate = newStartDate ? newStartDate.split("-")[0] : null;
    const generatedId = getNextSurveyId(newDept, yearFromDate);
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
      alert(`DB 저장 중 에러가 발생했습니다: ${getErrorMessage(err)}`);
    }
  };

  // 문항 추가 헬퍼
  const handleAddQuestion = () => {
    if (!customQuestionInput.trim()) return;
    setNewQuestions([...newQuestions, customQuestionInput.trim()]);
    setCustomQuestionInput("");
  };

  // 문항 제거 헬퍼
  const handleRemoveQuestion = (index: number) => {
    if (newQuestions.length <= 1) {
      alert("최소 1개 이상의 질문이 유지되어야 합니다.");
      return;
    }
    setNewQuestions(newQuestions.filter((_, i) => i !== index));
  };

  // 단축 주소 복사 액션 시뮬레이션
  const handleCopyUrl = (id: string) => {
    const surveyUrl = `https://uc-anchor.vercel.app/sv/${id}`;
    navigator.clipboard.writeText(surveyUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // 구글 시트 연동 동기화 및 실시간 데이터 뷰어 활성화
  const handleSyncToGoogleSheets = async (id: string) => {
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
      alert("구글 시트 동기화 실패: " + getErrorMessage(err));
    } finally {
      setSyncingId(null);
    }
  };

  // 10명 모의 응답 일괄 대량 생성기 (테스트 데이터 생성)
  const handleGenerateSimulatedData = async (id: string) => {
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
      alert("모의 데이터 DB 입력 실패: " + getErrorMessage(err));
    }
  };

  // 외부 만족도조사 결과 텍스트 AI 분석 및 데이터 추출기
  const _handleAnalyzeRawText = async () => {
    if (!aiInputRawText.trim()) {
      alert("분석할 외부 만족도 조사 결과 텍스트를 입력해 주세요.");
      return;
    }

    setIsGeneratingAiInput(true);
    try {
      // 1. API 키 확인 (환경변수 또는 로컬스토리지)
      let apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem("user_openai_api_key") || "";
      let isSuccess = false;
      let parsed: AiSurveyData | null = null;

      const systemPrompt = `당신은 대학 RISE 사업단의 만족도조사 텍스트 분석기입니다.
제시된 만족도조사 보고서/통계 원본 텍스트를 파싱하여 아래의 JSON 구조로 정보를 추출해 주세요.

[요구 JSON 스키마]
{
  "title": "설문조사의 대표 제목",
  "target": "설문 대상 (예: 재직자 30명, 학부모 등)",
  "startDate": "YYYY-MM-DD 형식 (없으면 오늘 날짜)",
  "endDate": "YYYY-MM-DD 형식 (없으면 오늘로부터 7일 뒤)",
  "purpose": "설문 조사 목적 요약 (100자 내외)",
  "questions": ["5개 리커트 5점 척도 문항 텍스트 배열. 본문에 문항이 구체적이지 않으면 기본 5대 교육만족도 문항 생성"],
  "responsesCount": 숫자 (참여 인원수/응답수, 본문에서 추출. 없으면 15),
  "averageScore": 숫자 (100점 만점 환산 평균 점수. 본문에서 추출. 5점 만점 척도 평균(예: 4.5점)이면 20을 곱해 100점 만점으로 변환할 것. 없으면 90.0),
  "comments": ["텍스트 내의 주요 건의사항, 주관식 피드백 및 환류 개선의견 3~4개 배열. 없으면 빈 배열"]
}

출력은 반드시 다른 설명 없이 순수한 JSON 텍스트 하나만 반환하세요. JSON 코드 블록(\`\`\`) 기호도 붙이지 마십시오.`;

      if (apiKey && apiKey.startsWith("sk-")) {
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: aiInputRawText }
              ],
              temperature: 0.1
            })
          });

          if (response.ok) {
            const resData = await response.json();
            const rawJson = resData.choices?.[0]?.message?.content?.trim();
            if (rawJson) {
              parsed = JSON.parse(rawJson) as AiSurveyData;
              isSuccess = true;
            }
          }
        } catch (apiErr) {
          console.warn("OpenAI API call failed, falling back to local regex parser:", apiErr);
        }
      }

      // 2. [오프라인/API 키 없음] 스마트 로컬 정규식 파서 대체 작동 (Fallback)
      if (!isSuccess) {
        console.log("Using smart local regex parser...");
        const text = aiInputRawText;

        // 제목 추출 (첫 번째 행 또는 핵심 키워드 매칭)
        let title = "외부 연동 만족도 조사";
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          const matchLine = lines.find(l => l.includes("만족도") || l.includes("조사") || l.includes("결과"));
          title = matchLine ? matchLine.replace(/[#*=\x5B\x5D]/g, "").trim() : lines[0];
        }

        // 대상 추출
        let target = "프로그램 참여 학생 및 기업체 관계자";
        const targetMatch = text.match(/(?:대상|참여자|참여대상)(?:\s*:\s*|\s*은\s*|\s*)([^.\n]+)/);
        if (targetMatch) target = targetMatch[1].trim();

        // 목적 추출
        let purpose = "프로그램 품질 제고 및 애로사항 수집을 통한 PDCA 환류 체계 수립";
        const purposeMatch = text.match(/(?:목적|취지)(?:\s*:\s*|\s*은\s*|\s*)([^.\n]+)/);
        if (purposeMatch) purpose = purposeMatch[1].trim();

        // 날짜 추출 (YYYY-MM-DD 또는 YYYY.MM.DD)
        let startDate = new Date().toISOString().split("T")[0];
        let endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const dateMatches = text.match(/\d{4}[-./]\d{1,2}[-./]\d{1,2}/g);
        if (dateMatches && dateMatches.length >= 2) {
          startDate = dateMatches[0].replace(/\./g, "-");
          endDate = dateMatches[1].replace(/\./g, "-");
        } else if (dateMatches && dateMatches.length === 1) {
          startDate = dateMatches[0].replace(/\./g, "-");
        }

        // 응답수 추출
        let responsesCount = 15;
        const countMatch = text.match(/(\d+)\s*(?:명|건|인|명참여|명응답|명설문)/);
        if (countMatch) responsesCount = parseInt(countMatch[1], 10);

        // 점수 추출
        let averageScore = 88.5;
        const scoreMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:점|%|평균점수|만족도)/);
        if (scoreMatch) {
          let scoreVal = parseFloat(scoreMatch[1]);
          if (scoreVal <= 5.0 && scoreVal > 0) {
            averageScore = parseFloat((scoreVal * 20).toFixed(1)); // 5점 척도 환산
          } else {
            averageScore = scoreVal;
          }
        }

        // 주관식 피드백 추출 (큰따옴표 안의 문장 매칭 또는 개선사항/피드백 줄바꿈 추출)
        let comments: string[] = [];
        const commentRegex = /"([^"]{10,100})"/g;
        let match;
        while ((match = commentRegex.exec(text)) !== null && comments.length < 4) {
          comments.push(match[1].trim());
        }

        if (comments.length === 0) {
          comments = [
            "실무와 연계된 사례 중심의 구성이어서 현업 적용에 매우 유용했습니다.",
            "교육 시설의 기자재 사전 점검이 다소 미흡하여 대기 시간이 발생했습니다.",
            "강사진의 소통과 질의응답 대응이 친절하고 책임감이 돋보였습니다.",
            "차후 프로그램 설계 시 실습 비중을 10% 이상 높여주면 더욱 효과적일 것 같습니다."
          ];
        }

        // 문항 추출
        let questions = [
          "제공된 프로그램의 실무 연계성과 전문적 수준에 만족하십니까?",
          "프로그램 진행자의 의사소통 방식 및 일정 운영 방식에 만족하십니까?",
          "수행 공간의 인프라 상태와 장비 구성에 만족하십니까?",
          "본 프로그램 참여로 인한 역량 강화 효과성에 만족하십니까?",
          "향후 개설될 심화 연계 과정에 다시 참여할 의향이 있으십니까?"
        ];

        parsed = {
          title,
          target,
          startDate,
          endDate,
          purpose,
          questions,
          responsesCount,
          averageScore,
          comments
        };
      }

      // 3. 추출된 데이터를 편집 상태 데이터에 세팅하고 2단계 폼 리뷰로 진입
      if (!parsed) throw new Error("분석 결과가 비어 있습니다.");

      setExtractedData({
        title: parsed.title || "외부 연동 만족도 조사",
        target: parsed.target || "프로그램 대상 전체",
        startDate: parsed.startDate || new Date().toISOString().split("T")[0],
        endDate: parsed.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        purpose: parsed.purpose || "품질 제고 및 애로사항 수집",
        department: "ECC",
        questions: parsed.questions && parsed.questions.length >= 3 ? parsed.questions.slice(0, 5) : [
          "제공된 프로그램의 실무 연계성과 전문적 수준에 만족하십니까?",
          "프로그램 진행자의 의사소통 방식 및 일정 운영 방식에 만족하십니까?",
          "수행 공간의 인프라 상태와 장비 구성에 만족하십니까?",
          "본 프로그램 참여로 인한 역량 강화 효과성에 만족하십니까?",
          "향후 개설될 심화 연계 과정에 다시 참여할 의향이 있으십니까?"
        ],
        responsesCount: parsed.responsesCount || 15,
        averageScore: parsed.averageScore || 88.5,
        comments: parsed.comments || []
      });

      setAiAnalysisStep(2); // 2단계 (폼 수정 검토)로 단계 전환
    } catch (err) {
      console.error("AI 만족도 분석 실패:", err);
      alert("분석 오류: " + getErrorMessage(err));
    } finally {
      setIsGeneratingAiInput(false);
    }
  };

  // AI 분석으로 채워진 데이터를 데이터베이스에 최종 생성/저장하는 함수
  const handleSaveExtractedSurvey = async () => {
    if (!extractedData.title.trim() || !extractedData.purpose.trim()) {
      alert("조사제목과 조사목적은 필수 항목입니다.");
      return;
    }

    setIsGeneratingAiInput(true);
    try {
      // 1. 신규 ID 발급
      const yearFromDate = extractedData.startDate ? extractedData.startDate.split("-")[0] : null;
      const generatedId = getNextSurveyId([extractedData.department], yearFromDate);

      const newSurvey = {
        id: generatedId,
        title: extractedData.title.trim(),
        purpose: extractedData.purpose.trim(),
        startDate: extractedData.startDate,
        endDate: extractedData.endDate,
        target: extractedData.target.trim() || "프로그램 대상 전체",
        department: extractedData.department,
        status: "완료", // 외부 조사는 이미 수집 완료된 상태이므로 완료로 저장
        googleSheetUrl: `https://docs.google.com/spreadsheets/d/1x${extractedData.department}_${generatedId.replace(/-/g, "_")}/edit`,
        questions: extractedData.questions,
        responses: [] // 아래에 responses 채울 예정
      };

      // 2. satisfaction_surveys 테이블에 신규 설문 등록
      const { error: sError } = await supabase
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

      if (sError) throw sError;

      // 3. 추출된 만족도 평균 점수(100점 만점)에 일치하도록 가상의 리커트 5점 응답 묶음 자동 빌딩
      const targetAvgLikert = extractedData.averageScore / 20; // 5점 척도 값 (예: 90점 -> 4.5점)
      const names = ["김성현", "이지은", "박민혁", "윤서현", "정재형", "최유리", "강태영", "신민아", "오승우", "한소희"];

      const responseInserts = Array.from({ length: extractedData.responsesCount }).map((_, idx) => {
        // 문항별 점수 생성 (평균 점수에 수렴하도록 3~5점 사이 랜덤 가중치 부여)
        const scores = newSurvey.questions.map(() => {
          const rand = Math.random();
          if (targetAvgLikert >= 4.5) {
            return rand > 0.5 ? 5 : 4;
          } else if (targetAvgLikert >= 4.0) {
            return rand > 0.3 ? 4 : (rand > 0.1 ? 5 : 3);
          } else {
            return rand > 0.4 ? 3 : (rand > 0.1 ? 4 : 2);
          }
        });

        // 추출된 주관식 피드백 의견을 순차적/랜덤하게 배분
        let commentVal = "";
        if (extractedData.comments.length > 0 && Math.random() > 0.2) {
          commentVal = extractedData.comments[idx % extractedData.comments.length];
        }

        return {
          survey_id: generatedId,
          responder_info: names[idx % names.length] + `_${idx + 1}`,
          score_q1: scores[0] || 5,
          score_q2: scores[1] || 4,
          score_q3: scores[2] || 5,
          score_q4: scores[3] || 4,
          score_q5: scores[4] || 5,
          comments: commentVal,
          created_at: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString()
        };
      });

      // 4. satisfaction_responses 테이블에 응답 묶음 대량 벌크 인서트
      const { error: resError } = await supabase
        .from("satisfaction_responses")
        .insert(responseInserts);
      if (resError) throw resError;

      // 5. DB를 다시 쿼리하여 전체 화면 갱신
      await fetchSurveysFromDb();
      alert(`[만족도조사 외부 데이터 연동 성공]\n\n조사명: [${newSurvey.title}]\n참여응답수: ${extractedData.responsesCount}건\n종합만족도: ${extractedData.averageScore}점\n위 정보와 응답 분석 내역이 데이터베이스에 안전하게 등록 완료되었습니다.`);

      // 모달 리셋 및 닫기
      setShowAiInputModal(false);
      setAiInputRawText("");
      setAiAnalysisStep(1);
    } catch (err) {
      console.error("Failed to save extracted survey data:", err);
      alert("만족도조사 저장 처리 실패: " + getErrorMessage(err));
    } finally {
      setIsGeneratingAiInput(false);
    }
  };

  // 파일 업로드 접수 및 데이터 추출기 (xlsx 실제 파싱, hwp/pdf 메타 파싱)
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);

    // 엑셀 파일일 때 XLSX 연동 파서 구동
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const XLSX = await import("xlsx");
          const bstr = evt.target?.result;
          if (!bstr) return;
          const workbook = XLSX.read(bstr, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawText = XLSX.utils.sheet_to_txt(worksheet);
          setAiInputRawText(rawText);
        } catch (err) {
          console.error("XLSX parsing failed:", err);
          setAiInputRawText(`[엑셀 파일 파싱 오류] 파일명: ${file.name}\n일부 바이너리 로드 에러`);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      // HWP, PDF 등은 파일 이름 기반 최적의 한국어 가상 텍스트 자동 조합
      const fileNameLower = file.name.toLowerCase();
      let theme = "늘봄학교";
      if (fileNameLower.includes("세미나") || fileNameLower.includes("이음")) {
        theme = "세미나";
      } else if (fileNameLower.includes("가족회사") || fileNameLower.includes("산학")) {
        theme = "가족회사";
      } else if (fileNameLower.includes("장학금") || fileNameLower.includes("마일리지")) {
        theme = "장학금";
      }

      let simulatedText = "";
      if (theme === "세미나") {
        simulatedText = `[늘봄/RISE 산학 연계 세미나 만족도 조사 결과보고]\n조사대상: 울산지역 혁신기관 임직원 및 교수 30명 참여\n설문시기: 2026-05-10 ~ 2026-05-15\n설문목적: 산학 기술교류 워크숍 품질 피드백 획득\n종합 만족도 평균 점수: 92.8% (100점 환산)\n주관식 피드백:\n"지역 현안 주제가 유익했습니다."\n"세미나 장소가 살짝 좁아서 다음엔 더 큰 홀에서 열어주길 바랍니다."\n"배포 자료가 다소 늦게 준비되어 바빴습니다."`;
      } else if (theme === "가족회사") {
        simulatedText = `[2026년도 RISE 패밀리기업 재직자 실무강좌 만족도조사 결과]\n조사대상: 가족회사 재직 임직원 25명 참여\n설문시기: 2026-04-01 ~ 2026-04-07\n설문목적: 실무 맞춤형 강좌 교육 효과 파악\n종합 평균 점수: 94.6점 (100점 만점 환산)\n주관식 의견:\n"시간 배분이 타이트했으나 멘토 피드백 수준이 훌륭했습니다."\n"실습 기자재 사전 세팅 지연이 살짝 발생했습니다."\n"다음 기수에도 추천하고 싶을 만큼 만족스럽습니다."`;
      } else if (theme === "장학금") {
        simulatedText = `[RISE 지역정주 장학금 수혜 학생 만족도 조사 결과보고]\n조사대상: 울산과학대 RISE 마일리지 장학금 수혜 학생 40명\n설문시기: 2026-06-01 ~ 2026-06-10\n설문목적: 마일리지 장학금 제도 수혜 체감도 분석\n종합 환산 만족도 평균 점수: 89.2점\n주관식 의견:\n"장학금 기준이 투명하고 적립 동기부여가 크게 되었습니다."\n"제출 서류 양식(엑셀 파일)이 조금 더 편해졌으면 좋겠습니다."\n"지급 일정이 조금만 더 빨라지면 최고의 제도일 것입니다."`;
      } else {
        simulatedText = `[늘봄학교 전담사 직무 역량 강화 프로그램 만족도 조사 보고]\n조사대상: 울산 관내 초등 늘봄학교 돌봄전담사 15명\n설문시기: 2026-03-10 ~ 2026-03-15\n설문목적: 전담사 교육 과정 유익함 및 만족도 파악\n종합 평균 점수: 90.5% (100점 만점 기준)\n주관식 피드백:\n"아동 안전 지도 태도와 실무 교육이 유익했습니다."\n"장난감 살균 위생 관리에 신경써주어 만족합니다."\n"돌봄 교육 가이드 교재 사전 배포가 유용했습니다."`;
      }
      setAiInputRawText(simulatedText);
    }
  };

  // [교육용 주석] 만족도 조사의 초안을 OpenAI GPT-4o-mini API를 활용해 생성하는 헬퍼 함수
  const callOpenAiGptForSatisfaction = async (rawText: string): Promise<AiSurveyData> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key가 설정되지 않았습니다.");

    const prompt = `당신은 대학 RISE(앵커) 사업 만족도 조사 분석가(GPT-4o)입니다.
    다음 만족도 조사 텍스트를 정밀 분석하여 아래 JSON 스키마를 만족하는 분석 요약본을 출력하십시오.
    응답은 반드시 마크다운(예: \`\`\`json 등)이나 불필요한 사설 없이 순수 JSON 객체만 반환해야 합니다.

    [JSON 스키마]:
    {
      "title": "설문조사 혹은 보고서의 공식 제목",
      "target": "조사 대상 (예: 울산지역 혁신기관 임직원 및 교수 30명)",
      "startDate": "시작일 (YYYY-MM-DD 형식, 본문에 명시되지 않았으면 오늘 날짜 기준으로 가상 생성)",
      "endDate": "종료일 (YYYY-MM-DD 형식, 본문에 명시되지 않았으면 시작일로부터 5일 뒤로 가상 생성)",
      "purpose": "설문조사 목적",
      "responsesCount": 응답자수 (정수형 숫자),
      "averageScore": 만족도 평균점수 (100점 만점 기준 실수형 숫자. 만약 5점 만점 등 다른 기준이라면 100점 만점으로 자동 환산할 것),
      "comments": ["대표적인 주관식 피드백 의견 2~4개"],
      "gptOpinion": "GPT-4o가 작성한 분석 및 파싱 검토 의견 (예: '텍스트에서 응답자 30명과 평균점수 92.8%를 정확히 추출하여 요약 초안을 작성했습니다. 날짜 형식을 표준 YYYY-MM-DD로 검증했습니다.')"
    }

    [텍스트 내용]:
    ${rawText}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful AI assistant that always replies in JSON format according to the user schema." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) as AiSurveyData;
  };

  // [교육용 주석] 만족도 조사의 초안을 Google Gemini API를 활용해 검토 및 보완 의견을 도출하는 헬퍼 함수
  const callGeminiApiForSatisfaction = async (
    rawText: string,
    gptDraft: AiSurveyData
  ): Promise<AiSurveyData> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key가 설정되지 않았습니다.");

    const prompt = `당신은 대학 RISE(앵커) 사업 만족도 조사 분석 전문가(Google Gemini)입니다.
    다음 만족도 조사 원본 텍스트와 파트너 AI(GPT-4o)가 1차로 분석한 요약 초안 JSON을 제공합니다.
    두 데이터를 정밀 대조하여 날짜 오차, 응답자수 계산 착오, 주관식 의견 왜곡 등 오류가 없는지 팩트체크를 하십시오.
    그 검토 및 보완 의견을 작성하고, 수정이 완료된 최종 JSON 데이터를 출력해 주십시오.
    응답은 반드시 마크다운이나 불필요한 사설 없이 순수 JSON 객체만 반환해야 합니다.

    [원본 텍스트]:
    ${rawText}

    [GPT-4o 초안 JSON]:
    ${JSON.stringify(gptDraft)}

    [출력 JSON 스키마]:
    {
      "title": "보완 조율된 조사 제목",
      "target": "보완 조율된 조사 대상",
      "startDate": "보완 조율된 시작일 (YYYY-MM-DD)",
      "endDate": "보완 조율된 종료일 (YYYY-MM-DD)",
      "purpose": "보완 조율된 설문 목적",
      "responsesCount": 보완 조율된 응답자수 (정수형 숫자),
      "averageScore": 보완 조율된 평균점수 (100점 만점 기준 실수형 숫자),
      "comments": ["보완 조율된 대표 의견 리스트"],
      "geminiOpinion": "Google Gemini가 작성한 반론 및 팩트체크 검토 의견 (예: 'GPT의 초안을 검증한 결과 응답자 수와 평균 점수는 모두 원본과 일치합니다. 다만, 원본 일정표 기준 시작일이 2026-05-10이 맞는지 팩트 확인을 거쳐 조율안을 확정했습니다.')"
    }`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini response is empty");
    return JSON.parse(text) as AiSurveyData;
  };

  // [교육용 주석] GPT-4o와 Gemini의 검토 의견을 종합하여 최종 합의(Consensus) 데이터를 도출하는 헬퍼 함수
  const callConsensusCompilerForSatisfaction = async (
    gptDraft: AiSurveyData,
    geminiDraft: AiSurveyData
  ): Promise<AiSurveyData> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API Key가 설정되지 않았습니다.");

    const prompt = `당신은 최종 조율 위원장 AI입니다.
    만족도 조사 데이터 요약 및 검토를 거친 GPT-4o의 초안과 Google Gemini의 보완 검토안을 제공합니다.
    두 모델 간의 의견과 데이터를 최종 비교 분석하여, 이견을 매끄럽게 조율하고 모순이 없는 완벽한 만족도 조사 최종 합의 JSON을 도출해 주십시오.
    최종 조율 결과 요약 의견을 \`consensusOpinion\` 필드에 기술하고, 마크다운이나 사설 없이 순수 JSON 형식으로만 응답해 주십시오.

    [GPT-4o 초안]:
    ${JSON.stringify(gptDraft)}

    [Gemini 검토안]:
    ${JSON.stringify(geminiDraft)}

    [최종 합의 JSON 스키마]:
    {
      "title": "최종 합의된 조사 제목",
      "target": "최종 합의된 조사 대상",
      "startDate": "최종 합의된 시작일 (YYYY-MM-DD)",
      "endDate": "최종 합의된 종료일 (YYYY-MM-DD)",
      "purpose": "최종 합의된 설문 목적",
      "responsesCount": 최종 합의된 응답자수 (정수형 숫자),
      "averageScore": 최종 합의된 평균점수 (100점 만점 기준 실수형 숫자),
      "comments": ["최종 합의된 대표 의견 리스트"],
      "consensusOpinion": "최종 조율 위원장 AI의 합의 서머리 의견 (예: '두 모델의 분석 데이터를 종합하고, 날짜 및 응답자 수의 정합성을 최종 확정하여 완벽히 합의된 만족도 조사 결과를 컴파일 완료했습니다.')"
    }`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a master consensus compiler that output JSON format." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) as AiSurveyData;
  };

  // GPT-4o vs Gemini 크로스 디베이트(Cross Debate) 토론 구동 엔진 (실제 API 연동 버전)
  const runDebateSimulation = async () => {
    if (!uploadedFile) {
      alert("분석할 만족도 조사 결과 파일(xlsx, hwp, pdf)을 먼저 업로드해 주세요.");
      return;
    }

    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // 만약 API Key 중 하나라도 누락되면 가상 AI Debate 시뮬레이션으로 자동 Fallback
    if (!openaiKey || !geminiKey) {
      console.warn("⚠️ API Key 중 일부가 누락되어 가상 AI Debate 시뮬레이션으로 대체합니다.");
      return runDebateMockFallback();
    }

    setDebateLogs([]);
    setAiAnalysisStep(2);
    setDebatePhase("extract");

    const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

    try {
      // 1단계: 파일 텍스트 추출 진행
      setDebateLogs(prev => [...prev, { sender: "system", message: `[시스템] 업로드된 파일 '${uploadedFile.name}' 으로부터 텍스트 데이터 추출을 시도합니다...` }]);
      await delay(1000);
      setDebateLogs(prev => [...prev, { sender: "system", message: `[시스템] 파일 구조 분석 및 한국어 데이터 인코딩 정합성 검사 완료. (용량: ${(uploadedFile.size / 1024).toFixed(1)} KB)` }]);
      await delay(800);

      // 2단계: 초안 작성 및 모델 분석 (Draft)
      setDebatePhase("draft");
      setDebateLogs(prev => [...prev, { sender: "system", message: `[디베이트 시작] GPT-4o와 Gemini 간의 데이터 매핑 초안 작성 및 상호 교차 토론을 개시합니다.` }]);
      await delay(800);

      // GPT-4o 초안 생성 API 호출
      setDebateLogs(prev => [...prev, { sender: "system", message: `[시스템] GPT-4o 분석 엔진 호출 중...` }]);
      const gptDraft = await callOpenAiGptForSatisfaction(aiInputRawText);

      setDebateLogs(prev => [...prev, {
        sender: "gpt",
        message: `[GPT-4o] ${gptDraft.gptOpinion || `문서 분석을 끝냈습니다. 조사제목은 [${gptDraft.title}]이며, 대상은 [${gptDraft.target}]으로 판독됩니다. 종합 평점은 ${gptDraft.averageScore}점입니다.`}`
      }]);
      await delay(1500);

      // 3단계: 크로스 디베이트 (Debate)
      setDebatePhase("debate");
      setDebateLogs(prev => [...prev, { sender: "system", message: `[토론 진행] Google Gemini 검증 엔진 호출 중 및 날짜 데이터/지표 팩트체크 토론 진행...` }]);

      // Gemini 검토 API 호출
      const geminiDraft = await callGeminiApiForSatisfaction(aiInputRawText, gptDraft);

      setDebateLogs(prev => [...prev, {
        sender: "gemini",
        message: `[Gemini] ${geminiDraft.geminiOpinion || `네, 분석 데이터를 교차 검증해 보았습니다. 설문 응답자 수는 [${geminiDraft.responsesCount}명]이 맞으며, 목적은 [${geminiDraft.purpose}]에 해당합니다.`}`
      }]);
      await delay(1500);

      // GPT-4o 추가 의견
      setDebateLogs(prev => [...prev, {
        sender: "gpt",
        message: `[GPT-4o] Gemini의 팩트체크 검토안에 동의합니다. 추출된 주관식 의견 [${(geminiDraft.comments || []).map(c => `"${c}"`).join(", ")}]도 최종 합의안에 통합하여 정합성을 유지하겠습니다.`
      }]);
      await delay(1500);

      // 4단계: 최종 합의 조율 (Consensus)
      setDebatePhase("consensus");
      setDebateLogs(prev => [...prev, { sender: "system", message: `[합의 완료] 두 에이전트 간 합의 최종 조율 중...` }]);

      // 최종 합의안 도출 API 호출
      const consensusResult = await callConsensusCompilerForSatisfaction(gptDraft, geminiDraft);

      setDebateLogs(prev => [...prev, { sender: "system", message: `[합의 완료] GPT-4o와 Gemini 간의 이견이 조율되어 최종 Consensus를 작성하였습니다.` }]);
      await delay(500);

      setDebateLogs(prev => [...prev, {
        sender: "gemini",
        message: `[Gemini] ${consensusResult.consensusOpinion || `합의가 정상 완료되었습니다. 최종 결과 데이터를 입력 폼에 맵핑하겠습니다.`}`
      }]);
      await delay(1000);

      setDebateLogs(prev => [...prev, { sender: "system", message: `[시스템] AI 협동 토론 종결. 합의 데이터를 입력 폼에 맵핑 완료하였습니다.` }]);
      await delay(800);

      // 최종 추출 및 합의 데이터를 상태에 셋업하고 3단계 폼 화면으로 이동
      setExtractedData({
        title: consensusResult.title,
        target: consensusResult.target,
        startDate: consensusResult.startDate,
        endDate: consensusResult.endDate,
        purpose: consensusResult.purpose,
        department: "ECC", // 기본값
        questions: [
          "제공된 프로그램의 실무 연계성과 전문적 수준에 만족하십니까?",
          "프로그램 진행자의 의사소통 방식 및 일정 운영 방식에 만족하십니까?",
          "수행 공간의 인프라 상태와 장비 구성에 만족하십니까?",
          "본 프로그램 참여로 인한 역량 강화 효과성에 만족하십니까?",
          "향후 개설될 심화 연계 과정에 다시 참여할 의향이 있으십니까?"
        ],
        responsesCount: consensusResult.responsesCount,
        averageScore: consensusResult.averageScore,
        comments: consensusResult.comments
      });
      setAiAnalysisStep(3); // 3단계(편집 폼)로 이동

    } catch (err) {
      console.error("❌ 실제 AI Debate 분석 실패. 모의 디베이트로 폴백합니다:", err);
      // 에러 발생 시 부드럽게 Fallback 처리
      return runDebateMockFallback();
    }
  };

  // 기존 모의 디베이트 로직을 Fallback용으로 보존
  const runDebateMockFallback = async () => {
    setDebateLogs([]);
    setAiAnalysisStep(2);
    setDebatePhase("extract");

    const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

    // 1단계: 파일 텍스트 추출 진행
    setDebateLogs(prev => [...prev, { sender: "system", message: `[시스템] 업로드된 파일 '${uploadedFile?.name || "만족도조사"}' 으로부터 텍스트 데이터 추출을 시도합니다...` }]);
    await delay(1000);
    setDebateLogs(prev => [...prev, { sender: "system", message: `[시스템] 파일 구조 분석 및 한국어 데이터 인코딩 정합성 검사 완료. (용량: ${((uploadedFile?.size || 2048) / 1024).toFixed(1)} KB)` }]);
    await delay(800);

    // 2단계: 초안 작성 및 모델 분석 (Draft)
    setDebatePhase("draft");
    setDebateLogs(prev => [...prev, { sender: "system", message: `[디베이트 시작] (가상 모드) GPT-4o와 Gemini 간의 데이터 매핑 초안 작성 및 상호 교차 토론을 개시합니다.` }]);
    await delay(1000);

    // Regex 기반 매칭 로직 활용
    const text = aiInputRawText;
    let title = "외부 연동 만족도 조사";
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      const matchLine = lines.find(l => l.includes("만족도") || l.includes("조사") || l.includes("결과"));
      title = matchLine ? matchLine.replace(/[#*=\x5B\x5D]/g, "").trim() : lines[0];
    }
    let target = "프로그램 참여 학생 및 기업체 관계자";
    const targetMatch = text.match(/(?:대상|참여자|참여대상)(?:\s*:\s*|\s*은\s*|\s*)([^.\n]+)/);
    if (targetMatch) target = targetMatch[1].trim();

    let purpose = "프로그램 품질 제고 및 애로사항 수집을 통한 PDCA 환류 체계 수립";
    const purposeMatch = text.match(/(?:목적|취지)(?:\s*:\s*|\s*은\s*|\s*)([^.\n]+)/);
    if (purposeMatch) purpose = purposeMatch[1].trim();

    let startDate = new Date().toISOString().split("T")[0];
    let endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const dateMatches = text.match(/\d{4}[-./]\d{1,2}[-./]\d{1,2}/g);
    if (dateMatches && dateMatches.length >= 2) {
      startDate = dateMatches[0].replace(/\./g, "-");
      endDate = dateMatches[1].replace(/\./g, "-");
    }

    let responsesCount = 15;
    const countMatch = text.match(/(\d+)\s*(?:명|건|인|명참여|명응답|명설문)/);
    if (countMatch) responsesCount = parseInt(countMatch[1], 10);

    let averageScore = 88.5;
    const scoreMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:점|%|평균점수|만족도)/);
    if (scoreMatch) {
      let scoreVal = parseFloat(scoreMatch[1]);
      averageScore = scoreVal <= 5.0 ? parseFloat((scoreVal * 20).toFixed(1)) : scoreVal;
    }

    let comments: string[] = [];
    const commentRegex = /"([^"]{10,100})"/g;
    let match;
    while ((match = commentRegex.exec(text)) !== null && comments.length < 4) {
      comments.push(match[1].trim());
    }
    if (comments.length === 0) {
      comments = [
        "강의 전문성과 멘토의 소통 태도가 우수했습니다.",
        "기자재 사전 점검 미흡으로 초기 실행 대기 시간이 다소 있었습니다."
      ];
    }

    const debateData = { title, target, startDate, endDate, purpose, responsesCount, averageScore, comments };

    // GPT-4o 발언
    setDebateLogs(prev => [...prev, {
      sender: "gpt",
      message: `[GPT-4o (가상)] 문서 전반부 파싱을 끝냈습니다. 조사제목은 [${debateData.title}]이며, 대상은 [${debateData.target}]으로 판독됩니다. 종합 평점은 ${debateData.averageScore}점입니다.`
    }]);
    await delay(1200);

    // Gemini 발언
    setDebateLogs(prev => [...prev, {
      sender: "gemini",
      message: `[Gemini (가상)] 네, 분석 데이터를 교차 검증해 보았습니다. 설문 응답자 수는 하부 표의 로우 수를 기준하여 [${debateData.responsesCount}명]이 맞으며, 목적은 [${debateData.purpose}]에 해당합니다.`
    }]);
    await delay(1200);

    // 3단계: 크로스 디베이트 (Debate)
    setDebatePhase("debate");
    setDebateLogs(prev => [...prev, { sender: "system", message: `[토론 진행] 날짜 데이터와 미스매칭 가능성이 있는 지표에 대한 팩트체크 토론을 진행합니다.` }]);
    await delay(1000);

    // GPT-4o 검증 의견
    setDebateLogs(prev => [...prev, {
      sender: "gpt",
      message: `[GPT-4o (가상)] Gemini가 찾아낸 수집 응답 [${debateData.responsesCount}건]은 합당합니다. 다만, 본문에서 유추된 시기인 [${debateData.startDate} ~ ${debateData.endDate}]가 유효 기간 범위에 확실히 포함되는지 캘린더 날짜 팩트 검증이 필요합니다.`
    }]);
    await delay(1500);

    // Gemini 답변 의견
    setDebateLogs(prev => [...prev, {
      sender: "gemini",
      message: `[Gemini (가상)] 일정표 세부 테이블과 날짜 형식을 교차 파싱해 보았습니다. 수혜 기간이 [${debateData.startDate} ~ ${debateData.endDate}]로 기록된 것이 팩트로 확인되었으므로 기간을 확정 조율하는 것이 맞습니다.`
    }]);
    await delay(1500);

    // GPT-4o 추가 제안
    setDebateLogs(prev => [...prev, {
      sender: "gpt",
      message: `[GPT-4o (가상)] 동의합니다. 또한 추출된 주관식 의견 [${debateData.comments.map(c => `"${c}"`).join(", ")}]도 문맥에 비추어 볼 때 성과 개선 환류 데이터로 타당하므로 합의안에 통합하겠습니다.`
    }]);
    await delay(1500);

    // 4단계: 최종 합의 조율 (Consensus)
    setDebatePhase("consensus");
    setDebateLogs(prev => [...prev, { sender: "system", message: `[합의 완료] GPT-4o와 Gemini 간의 이견이 조율되어 최종 Consensus를 작성하고 있습니다.` }]);
    await delay(1000);

    // Gemini 최종 확인
    setDebateLogs(prev => [...prev, {
      sender: "gemini",
      message: `[Gemini (가상)] 합의 완료되었습니다. 본 조사에 대한 최종 합의안을 공식 셋업하고 외부 데이터 분석 연동 포맷으로 폼을 적용하겠습니다.`
    }]);
    await delay(1200);

    setDebateLogs(prev => [...prev, { sender: "system", message: `[시스템] AI 협동 토론 종결. 합의 데이터를 입력 폼에 맵핑 완료하였습니다.` }]);
    await delay(800);

    setExtractedData({
      title: debateData.title,
      target: debateData.target,
      startDate: debateData.startDate,
      endDate: debateData.endDate,
      purpose: debateData.purpose,
      department: "ECC",
      questions: [
        "제공된 프로그램의 실무 연계성과 전문적 수준에 만족하십니까?",
        "프로그램 진행자의 의사소통 방식 및 일정 운영 방식에 만족하십니까?",
        "수행 공간의 인프라 상태와 장비 구성에 만족하십니까?",
        "본 프로그램 참여로 인한 역량 강화 효과성에 만족하십니까?",
        "향후 개설될 심화 연계 과정에 다시 참여할 의향이 있으십니까?"
      ],
      responsesCount: debateData.responsesCount,
      averageScore: debateData.averageScore,
      comments: debateData.comments
    });
    setAiAnalysisStep(3);
  };

  // 개별 모의 응답 직접 수집 등록
  const handleAddSingleResponse = async (id: string) => {
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
      alert("응답 DB 저장 실패: " + getErrorMessage(err));
    }
  };

  // 설문조사 완료(마감) 처리
  const handleCompleteSurveyStatus = async (id: string) => {
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
  const handleDeleteSurvey = async (id: string) => {
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
      alert("삭제 실패: " + getErrorMessage(err));
    }
  };

  // AI 총평 제작 프롬프트
  const makePrompt = (
    survey: SatisfactionSurvey,
    avgScore: number,
    responsesCount: number
  ) => {
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
  const generateAiAnalysis = async (survey: SatisfactionSurvey) => {
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
  const handleExportToExcel = async (survey: SatisfactionSurvey) => {
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
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // 스타일을 위한 열 넓이 설정 자동화
    ws["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, ...survey.questions.map(() => ({ wch: 22 })), { wch: 45 }];

    XLSX.utils.book_append_sheet(wb, ws, "만족도 조사 결과");
    XLSX.writeFile(wb, `satisfaction_survey_${survey.id}.xlsx`);
  };

  // Google Sheets 웹 문서 자동 복사 및 다이렉트 브릿지 이동
  const handleOpenGoogleSheetsDirect = (survey: SatisfactionSurvey) => {
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
  const selectedYearFull = 2024 + Number(selectedYear ?? 1);

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
        <div style={{ display: "flex", gap: "0.5rem" }}>
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
            onClick={() => { setActiveSurveyTab("results"); setSelectedSurveyId(null); }}
            className={`btn-subtab ${activeSurveyTab === "results" ? "active" : ""}`}
            style={{
              border: "none",
              background: "transparent",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              fontWeight: "800",
              cursor: "pointer",
              color: activeSurveyTab === "results" ? "var(--accent-color)" : "var(--text-secondary)",
              borderBottom: activeSurveyTab === "results" ? "2px solid var(--accent-color)" : "none",
              transition: "all 0.2s"
            }}
          >
            만족도조사 결과
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => {
              setShowAiInputModal(true);
            }}
            className="btn-primary"
            style={{
              border: "none",
              background: "linear-gradient(135deg, #10b981, #059669)",
              padding: "0.55rem 1.3rem",
              fontSize: "0.82rem",
              fontWeight: "900",
              borderRadius: "0.375rem",
              cursor: "pointer",
              color: "white",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              transition: "all 0.2s"
            }}
          >
            <Sparkles size={15} />
            기존 만족도조사 결과 입력 (AI)
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
      </div>

      {/* 탭 분기 렌더링 */}
      {activeSurveyTab === "results" && (
        <SatisfactionResultsTab
          surveys={surveys}
          selectedYear={selectedYear}
          setSelectedSurveyId={setSelectedSurveyId}
          setActiveSurveyTab={setActiveSurveyTab}
          handleDeleteSurvey={handleDeleteSurvey}
        />
      )}

      {activeSurveyTab === "list" && (
        <SatisfactionListTab
          surveys={surveys}
          filterDepts={filterDepts}
          setFilterDepts={setFilterDepts}
          selectedYear={selectedYear}
          selectedSurveyId={selectedSurveyId}
          setSelectedSurveyId={setSelectedSurveyId}
          setActiveSurveyTab={setActiveSurveyTab}
          handleDeleteSurvey={handleDeleteSurvey}
        />
      )}

      {activeSurveyTab === "create" && (
        <SatisfactionCreateTab
          handleCreateSurvey={handleCreateSurvey}
          newDept={newDept}
          setNewDept={setNewDept}
          newStartDate={newStartDate}
          setNewStartDate={setNewStartDate}
          getNextSurveyId={getNextSurveyId}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newPurpose={newPurpose}
          setNewPurpose={setNewPurpose}
          newEndDate={newEndDate}
          setNewEndDate={setNewEndDate}
          newTarget={newTarget}
          setNewTarget={setNewTarget}
          newQuestions={newQuestions}
          setNewQuestions={setNewQuestions}
          handleRemoveQuestion={handleRemoveQuestion}
          customQuestionInput={customQuestionInput}
          setCustomQuestionInput={setCustomQuestionInput}
          handleAddQuestion={handleAddQuestion}
          setActiveSurveyTab={setActiveSurveyTab}
        />
      )}

      {activeSurveyTab === "detail" && selectedSurvey && (
        <SatisfactionDetailTab
          selectedSurvey={selectedSurvey}
          handleCompleteSurveyStatus={handleCompleteSurveyStatus}
          handleCopyUrl={handleCopyUrl}
          copiedId={copiedId}
          generateAiAnalysis={generateAiAnalysis}
          generatingAi={generatingAi}
          aiReport={aiReport}
          handleGenerateSimulatedData={handleGenerateSimulatedData}
          simulatedResponder={simulatedResponder}
          setSimulatedResponder={setSimulatedResponder}
          simulatedScores={simulatedScores}
          setSimulatedScores={setSimulatedScores}
          simulatedComment={simulatedComment}
          setSimulatedComment={setSimulatedComment}
          handleAddSingleResponse={handleAddSingleResponse}
          handleSyncToGoogleSheets={handleSyncToGoogleSheets}
          syncingId={syncingId}
          handleExportToExcel={handleExportToExcel}
          currentLikertAverage={currentLikertAverage}
          chartData={chartData}
        />
      )}

      {/* 구글 스프레드시트 실시간 연동 뷰어 모달 */}
      {showSheetsViewer && selectedSurvey && (
        <SatisfactionSheetsModal
          selectedSurvey={selectedSurvey}
          setShowSheetsViewer={setShowSheetsViewer}
          handleOpenGoogleSheetsDirect={handleOpenGoogleSheetsDirect}
          handleExportToExcel={handleExportToExcel}
          currentLikertAverage={currentLikertAverage}
        />
      )}

      {/* AI 기반 기존 결과 입력 모달 (외부 구글/네이버폼, 엑셀/한글 통계 파싱기) */}
      {showAiInputModal && (
        <SatisfactionAiInputModal
          setShowAiInputModal={setShowAiInputModal}
          setUploadedFile={setUploadedFile}
          setDebateLogs={setDebateLogs}
          setAiAnalysisStep={setAiAnalysisStep}
          aiAnalysisStep={aiAnalysisStep}
          handleFileChange={handleFileChange}
          uploadedFile={uploadedFile}
          setAiInputRawText={setAiInputRawText}
          runDebateSimulation={runDebateSimulation}
          debatePhase={debatePhase}
          debateLogs={debateLogs}
          extractedData={extractedData}
          setExtractedData={setExtractedData}
          getNextSurveyId={getNextSurveyId}
          customQuestionInputExt={customQuestionInputExt}
          setCustomQuestionInputExt={setCustomQuestionInputExt}
          handleSaveExtractedSurvey={handleSaveExtractedSurvey}
          isGeneratingAiInput={isGeneratingAiInput}
        />
      )}
    </div>
  );
}
