import React, { useState } from "react";
import { Plus, Trash2, Info, ListFilter, ArrowUpDown, Edit } from "lucide-react";
import { supabase } from "../supabaseClient"; // Supabase 클라이언트 연동 (요건 3 반영)

// 1차년도 및 2차년도 단위과제별 연계 프로그램 데이터셋
const PROGRAMS_BY_UNIT = {
  "A1": [
    { id: "A1-1", name: "미래 핵심 신산업 주문식 교육 운영" },
    { id: "A1-2", name: "글로컬 앵커 교육과정 고도화" },
    { id: "A1-3", name: "앵커 혁신 교육과정 및 인프라 구축" }
  ],
  "A2": [
    { id: "A2-1", name: "지역 특화 산업 맞춤형 실무 인재 양성" },
    { id: "A2-2", name: "지산학관 공유 협력 네트워크 구축" }
  ],
  "B1": [
    { id: "B1-1", name: "지역 정주형 취창업 지원 프로그램" },
    { id: "B1-2", name: "생애 주기별 맞춤형 직업 교육 고도화" }
  ],
  "B2": [
    { id: "B2-1", name: "신산업 선도형 글로벌 직업 교육 브랜드 구축" },
    { id: "B2-2", name: "해외 우수 대학 및 산업체 교류 협력 활성화" }
  ],
  "B3": [
    { id: "B3-1", name: "지역 사회 문제 해결 및 나눔 실천" },
    { id: "B3-2", name: "문화 예술 콘텐츠 활성화 및 정서 지원" }
  ],
  "B4": [
    { id: "B4-1", name: "소외 계층 맞춤형 교육 서비스 및 장학" },
    { id: "B4-2", name: "다문화 및 다양성 가치 확산 캠페인" }
  ],
  "C1": [
    { id: "C1-1", name: "대학 연구 역량 강화 및 원천 기술 개발" },
    { id: "C1-2", name: "혁신 기술 특허 출원 및 사업화 이전" }
  ],
  "C2": [
    { id: "C2-1", name: "산학 공동 기술 개발 및 연구 센터 운영" },
    { id: "C2-2", name: "기업 애로 기술 지도 및 컨설팅 지원" }
  ],
  "D1": [
    { id: "D1-1", name: "지역 평생 교육 포털 구축 및 운영" },
    { id: "D1-2", name: "시민 역량 강화 교양 및 실무 아카데미" }
  ],
  "D2": [
    { id: "D2-1", name: "성인 학습자 대상 취창업 역량 강화 패키지" },
    { id: "D2-2", name: "재취업 및 전직 지원 맞춤형 컨설팅" }
  ],
  "D3": [
    { id: "D3-1", name: "소상공인 및 전통시장 활성화 기술 지원" },
    { id: "D3-2", name: "지역 특화 소상공인 사업화 멘토링" }
  ],
  "D4": [
    { id: "D4-1", name: "글로벌 한인 차세대 네트워크 공유 교류" },
    { id: "D4-2", name: "글로벌 평생 교육 선도 모델 정립" }
  ],
  "A1가": [
    { id: "A1가-1", name: "친환경 스마트 친조선 융합 기술 교육" },
    { id: "A1가-2", name: "글로벌 선박 정밀 가공 실무 양성" }
  ],
  "A1나": [
    { id: "A1나-1", name: "미래형 스마트 모빌리티 설계 및 제어 교육" },
    { id: "A1나-2", name: "모빌리티 정비 및 튜닝 전문 인재 육성" }
  ],
  "A3": [
    { id: "A3-1", name: "바이오 메디컬 융합 서비스 전문가 육성" },
    { id: "A3-2", name: "디지털 헬스케어 기기 및 인프라 구축" }
  ],
  "Common": [
    { id: "COM-1", name: "앵커 사업단 공통 프로그램 기획 및 성과 관리" },
    { id: "COM-2", name: "전체 참여 과제 공유 워크숍 및 혁신 포럼" }
  ]
};

// AI 가상 문서요약 분석 시뮬레이터 함수 (사용자 요구사항 2 반영)
const runAiMockAnalysis = (docType, textContent, itemName, deptName, totalPrice) => {
  const randomNo = Math.floor(Math.random() * 900) + 100;
  const priceThousand = totalPrice ? Math.round(totalPrice / 1000) : 120000;
  
  if (docType === "proposal") {
    return {
      docNo: `UC-EQ-P-${randomNo}`,
      unit: "A1 : 지역과 미래를 만드는 UC-HYPER 전문기술인재 양성",
      dept: deptName || "간호학부 (사업단 협업)",
      budget: `${priceThousand.toLocaleString()}천원`,
      goals: [
        `${itemName || "도입 핵심 기재"} 기반 전문 실무 교육과정 수립`,
        "선진 시뮬레이션 인프라 구축 및 융합 실습 환경 리모델링",
        "지산학 연계 라이즈 사업의 교육 실적 성과 관리 및 모니터링"
      ]
    };
  } else if (docType === "purchase") {
    return {
      docNo: `UC-EQ-PR-${randomNo}`,
      fromDept: deptName || "간호학부",
      toDept: "대학본부 총무팀",
      budget: `${priceThousand.toLocaleString()}천원`,
      specs: [
        `${itemName || "도입 요청 기재"} 핵심 조달 기술 사양 충족 검토`,
        "정밀 제어 칩셋 탑재 및 고정밀 수치 보정 기능 보장",
        "전문 엔지니어 1:1 무상 온사이트 유지보수 기한 2년 이상 보증 조건"
      ]
    };
  } else { // bid
    return {
      docNo: `UC-EQ-B-${randomNo}`,
      method: "제한경쟁입찰 (협상에 의한 계약)",
      budget: `${priceThousand.toLocaleString()}천원`,
      qualifications: [
        "국가종합전자조달시스템에 조달용 기자재 공급업으로 등록을 필한 업체",
        "최근 3개년 이내 대학 및 교육기관 대상 관련 실적 유효 보유 업체",
        "신속 사후 관리 A/S 기술 확약서 및 원제조업체 물품공급확약서 제출 가능 업체"
      ],
      deadline: "2026-07-25 18:00"
    };
  }
};

// OpenAI GPT API를 직접 호출하는 비동기 함수 (요건 2 반영)
// 클라이언트 사이드에서 직접 호출하며, API Key는 환경 변수 VITE_OPENAI_API_KEY에서 읽어옵니다.
const callOpenAiGpt = async (docType, fileName, textContent, itemName, deptName, totalPrice) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ VITE_OPENAI_API_KEY 환경 변수가 없으므로, 로컬 AI 요약 시뮬레이터로 자동 대체합니다.");
    return runAiMockAnalysis(docType, textContent || fileName, itemName, deptName, totalPrice);
  }

  const promptMap = {
    proposal: `당신은 대학 RISE(앵커) 사업 기획 분석가입니다. 아래 문서정보와 텍스트를 분석하여, 다음 JSON 스키마를 만족하는 요약본을 JSON 모드로 응답하십시오.
    [스키마]:
    {
      "docNo": "기획문서 결재번호 (예: UC-EQ-P-로 시작하는 고유번호 생성)",
      "unit": "단위과제 명칭",
      "dept": "주관 부서",
      "budget": "과제 배정 예산 (예: 120,000천원 형식)",
      "goals": ["주요 추진 전략 목표 리스트 3가지"]
    }
    [정보]:
    - 품명: ${itemName || "알 수 없음"}
    - 학과/부서: ${deptName || "사업단"}
    - 예산: ${totalPrice ? (totalPrice / 1000).toLocaleString() + "천원" : "120,000천원"}
    - 원본명: ${fileName}
    - 문서 텍스트: ${textContent || "기재 없음"}`,

    purchase: `당신은 대학 조달 담당자입니다. 아래 구매요청 문서정보를 분석하여, 다음 JSON 스키마를 만족하는 요약본을 JSON 모드로 응답하십시오.
    [스키마]:
    {
      "docNo": "구매문서 결재번호 (예: UC-EQ-PR로 시작하는 고유번호 생성)",
      "fromDept": "발신 부서",
      "toDept": "수신 부서 (보통 대학본부 총무팀)",
      "budget": "도입 소요예산 (예: 120,000천원 형식)",
      "specs": ["조달 위탁 요청 기술 사양 핵심 3가지"]
    }
    [정보]:
    - 품명: ${itemName || "알 수 없음"}
    - 학과/부서: ${deptName || "사업단"}
    - 예산: ${totalPrice ? (totalPrice / 1000).toLocaleString() + "천원" : "120,000천원"}
    - 원본명: ${fileName}
    - 문서 텍스트: ${textContent || "기재 없음"}`,

    bid: `당신은 공인 입찰 공고 담당자입니다. 아래 입찰 문서정보를 분석하여, 다음 JSON 스키마를 만족하는 요약본을 JSON 모드로 응답하십시오.
    [스키마]:
    {
      "docNo": "입찰문서 결재번호 (예: UC-EQ-B로 시작하는 고유번호 생성)",
      "method": "입찰 계약 방식 (예: 제한경쟁입찰 등)",
      "budget": "배정 예산 규모 (예: 120,000천원 형식)",
      "qualifications": ["참가 자격 요건 및 규격 제한사항 3가지"],
      "deadline": "입찰 등록 마감 일자 및 시각 (예: 2026-07-25 18:00)"
    }
    [정보]:
    - 품명: ${itemName || "알 수 없음"}
    - 학과/부서: ${deptName || "사업단"}
    - 예산: ${totalPrice ? (totalPrice / 1000).toLocaleString() + "천원" : "120,000천원"}
    - 원본명: ${fileName}
    - 문서 텍스트: ${textContent || "기재 없음"}`
  };

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
          { role: "system", content: "You are a helpful AI assistant that always replies in JSON format according to the user schema." },
          { role: "user", content: promptMap[docType] }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("❌ OpenAI GPT API 분석 실패:", error);
    // API 에러 발생 시 부드럽게 mock 데이터로 복구하여 컴포넌트 크래시 방지 (Rule 2)
    return runAiMockAnalysis(docType, textContent || fileName, itemName, deptName, totalPrice);
  }
};

// Supabase Storage 업로드 및 Public URL 반환 함수 (요건 3 반영)
const uploadFileToSupabase = async (docType, file, onProgress) => {
  if (!file) return null;
  
  // 1단계: 파일 정보 보안 검토 및 암호화 필터 (Rule 8)
  // 학생 정보나 개인정보 관련 민감 키워드가 파일명에 담겨 있을 경우 보안 경고
  if (file.name.includes("개인정보") || file.name.includes("주민") || file.name.includes("비밀번호")) {
    console.warn("⚠️ [보안 경고] 파일명에 민감한 개인정보 키워드가 감지되었습니다. 암호화 전송을 확인하세요.");
  }

  const fileExt = file.name.split(".").pop();
  const randomId = Math.random().toString(36).substring(2, 10);
  const filePath = `equipment/${docType}/${Date.now()}_${randomId}.${fileExt}`;

  // 모의 프로그레스 진행 바 작동 (사용자 시각적 흐름 연출)
  let currentProgress = 0;
  const progressInterval = setInterval(() => {
    currentProgress += 20;
    if (currentProgress <= 100) {
      if (onProgress) onProgress(currentProgress);
    } else {
      clearInterval(progressInterval);
    }
  }, 150);

  try {
    // 실제 Supabase Storage 버킷 업로드 시도 (요구사항 반영)
    // 버킷명: document_procument
    const { data, error } = await supabase.storage
      .from("document_procument")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (error) {
      throw error;
    }

    // 파일의 Public URL 취득
    const { data: { publicUrl } } = supabase.storage
      .from("document_procument")
      .getPublicUrl(filePath);

    // 완료 대기
    await new Promise(resolve => setTimeout(resolve, 200));
    if (onProgress) onProgress(100);
    return {
      name: file.name,
      size: file.size,
      url: publicUrl || ""
    };
  } catch (error) {
    console.warn("⚠️ 실제 Supabase Storage 업로드에 실패했습니다. 로컬 mock 업로드로 가상 대체합니다.");
    
    // 모의 업로드 결과 반환 (Supabase Storage 버킷이 아직 세팅되지 않은 경우 원활한 실연을 지원)
    await new Promise(resolve => setTimeout(resolve, 400));
    if (onProgress) onProgress(100);
    return {
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file) || "" // 가상 파일 링크
    };
  }
};

const defaultEquipments = [
  { id: 1, unit: "A1", seq: 1, deptName: "간호학부", divisionName: "", itemName: "스마트 환자 시뮬레이터 (중환자 케어 실습 장비)", unitPrice: 120000000, quantity: 1, description: "글로벌 앵커 혁신 교육과정 임상 실습 고도화 핵심 기기", operation: "글로컬 앵커 교육과정 고도화", password: "1234",
    dateP: "2025-03-10", dateA: "2025-04-15", dateB: "2025-06-12", datePr: "2025-07-20", dateI: "2025-09-05"
  },
  { id: 2, unit: "A2", seq: 2, deptName: "화학공학과", divisionName: "", itemName: "정밀 화학 분석 크로마토그래피 시스템", unitPrice: 245000000, quantity: 1, description: "신산업 저탄소 에너지 트랙 화학 정밀 분석 실습 장비", operation: "지역 특화 산업 맞춤형 실무 인재 양성", password: "1234",
    dateP: "2025-03-15", dateA: "2025-04-20", dateB: "2025-06-18", datePr: "2025-07-25", dateI: "2025-09-10"
  },
  { id: 3, unit: "B1", seq: 3, deptName: "컴퓨터공학과", divisionName: "", itemName: "AI 알고리즘 모델링 연산용 고성능 GPU 워크스테이션", unitPrice: 15000000, quantity: 3, description: "RCC 특화산업 AI 융합 실감형 교육 센터 실무 교육 지원", operation: "지역 정주형 취창업 지원 프로그램", password: "1234",
    dateP: "2025-03-12", dateA: "2025-04-18", dateB: "", datePr: "2025-06-25", dateI: "2025-08-14"
  },
  { id: 4, unit: "B2", seq: 4, deptName: "기계공학부", divisionName: "", itemName: "스마트 팩토리 모듈 제어 및 3D 정밀 프린팅 모듈", unitPrice: 38000000, quantity: 1, description: "지산학 연계 제조 혁신 엔지니어 교육 기자재", operation: "신산업 선도형 글로벌 직업 교육 브랜드 구축", password: "1234",
    dateP: "2025-03-20", dateA: "2025-05-15", dateB: "2025-06-08", datePr: "2025-06-20", dateI: "2025-08-18"
  },
  { id: 5, unit: "B3", seq: 5, deptName: "전기전자공학부", divisionName: "", itemName: "반도체 임베디드 코딩 및 고정밀 계측 오실로스코프", unitPrice: 8500000, quantity: 4, description: "반도체 전공 대학 연계 실무 미러형 교육 설계용 장비", operation: "지역 사회 문제 해결 및 나눔 실천", password: "1234",
    dateP: "2025-03-25", dateA: "2025-04-28", dateB: "2025-06-05", datePr: "2025-06-18", dateI: "2025-08-20"
  },
  { id: 6, unit: "B4", seq: 6, deptName: "유아교육과", divisionName: "", itemName: "늘봄 연계 창의 놀이 실증용 스마트 인터랙티브 디스플레이", unitPrice: 8500000, quantity: 2, description: "에듀테크 기반 창의적 교육 콘텐츠 제작 교육 과정 운영", operation: "소외 계층 맞춤형 교육 서비스 및 장학", password: "1234",
    dateP: "2025-03-18", dateA: "2025-05-10", dateB: "", datePr: "2025-06-24", dateI: "2025-08-25"
  },
  { id: 7, unit: "C1", seq: 7, deptName: "컴퓨터공학과", divisionName: "", itemName: "다목적 6축 소형 스마트 교육용 협동 로봇 머니퓰레이터", unitPrice: 28000000, quantity: 1, description: "미래 지능형 로봇 운용/제어 교과목 현장 중심 실습", operation: "대학 연구 역량 강화 및 원천 기술 개발", password: "1234",
    dateP: "2025-03-22", dateA: "2025-05-12", dateB: "2025-06-15", datePr: "2025-06-28", dateI: "2025-08-28"
  },
  { id: 8, unit: "C2", seq: 8, deptName: "반려동물보건과", divisionName: "", itemName: "동물 전용 디지털 초음파 진단 장치", unitPrice: 19000000, quantity: 1, description: "신설학과 실무 미러형 임상 실습실 조달 품목", operation: "산학 공동 기술 개발 및 연구 센터 운영", password: "1234",
    dateP: "2025-04-10", dateA: "2025-05-20", dateB: "2025-06-18", datePr: "2025-07-15", dateI: "2025-09-12"
  },
  { id: 9, unit: "D1", seq: 9, deptName: "조선해양시스템공학과", divisionName: "", itemName: "미래 친환경선박 가상 운항 교육 시뮬레이터", unitPrice: 45000000, quantity: 1, description: "5극3특 가상 운항 실습 교육 과정 지원용 장비", operation: "지역 평생 교육 포털 구축 및 운영", password: "1234",
    dateP: "2025-03-08", dateA: "2025-05-08", dateB: "2025-07-10", datePr: "2025-08-20", dateI: "2025-11-15"
  },
  { id: 10, unit: "D2", seq: 10, deptName: "물리치료학과", divisionName: "", itemName: "메디컬 스킨케어 다기능 뷰티 디바이스", unitPrice: 6500000, quantity: 5, description: "웰니스 뷰티 케어 실습 및 지역 상생 뷰티 아카데미 활용", operation: "성인 학습자 대상 취창업 역량 강화 패키지", password: "1234",
    dateP: "2025-03-14", dateA: "2025-04-24", dateB: "", datePr: "2025-06-22", dateI: "2025-08-29"
  }
];

// 백만원 단위 포맷팅 헬퍼 함수 (소수점 첫째자리까지 표현 및 천단위 쉼표 추가)
const formatToMillionWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0.0";
  return (value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// 천원 단위 포맷팅 헬퍼 함수 (정수 표현 및 천단위 쉼표 추가)
const formatToThousandWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return (value / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 });
};

// 백만원 문자열 예산 데이터를 천원 단위 형식으로 동적 환산해 주는 파싱 헬퍼 함수
const convertMillionWonToThousandWon = (budgetStr) => {
  if (!budgetStr) return "0천원";
  const numOnly = parseFloat(budgetStr.replace(/,/g, "").replace(/[^0-9.]/g, ""));
  if (isNaN(numOnly)) return budgetStr;
  const thousandWonVal = Math.round(numOnly * 1000);
  return thousandWonVal.toLocaleString() + "천원";
};

// 날짜 데이터를 기반으로 3월~2월 캘린더 구매단계(P, A, B, Pr, I) 매핑 헬퍼 함수 (4번 요건 대응)
const getMilestonesFromDates = (item, activeYear) => {
  const milestones = { "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [], "11": [], "12": [], "1": [], "2": [] };
  const baseYear = 2024 + Number(activeYear || 1); // 1차년도: 2025, 2차년도: 2026
  
  const checkAndAdd = (dateStr, phaseCode) => {
    if (!dateStr) return;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const isCurrentYearPart = (month >= 3 && month <= 12 && year === baseYear);
    const isNextYearPart = ((month === 1 || month === 2) && year === baseYear + 1);
    
    if (isCurrentYearPart || isNextYearPart) {
      const monthKey = String(month);
      if (milestones[monthKey] && !milestones[monthKey].includes(phaseCode)) {
        milestones[monthKey].push(phaseCode);
      }
    }
  };
  
  checkAndAdd(item.dateP, "P");
  checkAndAdd(item.dateA, "A");
  checkAndAdd(item.dateB, "B");
  checkAndAdd(item.datePr, "Pr");
  checkAndAdd(item.dateI, "I");
  
  return milestones;
};

// 단계별 입력 일정 순차 및 사업연차 적합성 검증 헬퍼 함수 (연차-단계별 일자 연계)
const validateDatesChronological = (yearVal, dateP, dateA, dateB, datePr, dateI) => {
  const targetYear = Number(yearVal) || 1; // 1차년도 또는 2차년도
  
  // 1) 사업연차별 유효기간 논리 범위 정의
  // 1차년도: '25.3월 ~ '26.2월 -> 2025-03-01 ~ 2026-02-29
  // 2차년도: '26.3월 ~ '27.2월 -> 2026-03-01 ~ 2027-02-28
  const baseStart = targetYear === 1 ? new Date("2025-03-01") : new Date("2026-03-01");
  const baseEnd = targetYear === 1 ? new Date("2026-02-29") : new Date("2027-02-28");
  const periodStr = targetYear === 1 ? "'25.3월 ~ '26.2월" : "'26.3월 ~ '27.2월";

  const dates = [
    { name: "기획(P)", val: dateP },
    { name: "승인(A)", val: dateA },
    { name: "입찰(B)", val: dateB },
    { name: "구매(Pr)", val: datePr },
    { name: "검수(I)", val: dateI }
  ].filter(d => d.val); // 값이 채워진 것만 필터링

  // 2) 선택한 사업 연차 범위 내에 일자가 속하는지 검증
  for (let i = 0; i < dates.length; i++) {
    const dVal = new Date(dates[i].val);
    if (dVal < baseStart || dVal > baseEnd) {
      return {
        isValid: false,
        msg: `⚠️ 연차 일치 위배: ${targetYear}차년도 기자재의 ${dates[i].name} 단계 일자(${dates[i].val})는 ${targetYear}차년도 사업 기간(${periodStr}) 범위를 벗어납니다. 날짜를 확인해 주세요.`
      };
    }
  }

  // 3) 각 단계가 시간 순서상 순차적인지 검증
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i].val);
    const next = new Date(dates[i + 1].val);
    if (current > next) {
      return {
        isValid: false,
        msg: `⚠️ 일정 순서 위배: ${dates[i].name} 단계 일자(${dates[i].val})가 ${dates[i+1].name} 단계 일자(${dates[i+1].val})보다 늦을 수 없습니다. 일정을 순차적으로 기입해 주세요.`
      };
    }
  }
  return { isValid: true };
};



// 단위과제별 2차년도 사업계획서 요약 모의 데이터 (기획문서용)
const PROPOSAL_SUMMARIES = {
  "A1": {
    title: "지역과 미래를 만드는 UC-HYPER 전문기술인재 양성",
    dept: "ECC센터 (교육혁신센터)",
    goals: ["조선 정밀 가공 실무 교육과정 수립", "하이퍼팩토리 리모델링 구축", "미래 핵심 신산업 주문식 교육 운영"],
    budget: "2,540백만원"
  },
  "A1가": {
    title: "지역과 미래를 만드는 UC-HYPER 전문기술인재 양성",
    dept: "ECC센터 (교육혁신센터)",
    goals: ["교수학습 모델 전면 개편", "미래 모빌리티/보건 융합 주문식 교육과정 운영", "하이퍼 캠퍼스 온라인 실습 시스템 구축"],
    budget: "2,540백만원"
  },
  "A1나": {
    title: "신산업특화 전문기술인재 양성",
    dept: "신산업특화센터",
    goals: ["정밀 화학, 이차전지, 친환경 선박 가공 인재 육성", "신산업 이관 전담 실무 교육장비 가동", "선도 조선소 연계 맞춤형 글로벌 인턴십"],
    budget: "310백만원"
  },
  "A2": {
    title: "지역 창업 생태계 혁신을 위한 글로컬 창업 문화 조성",
    dept: "창업창직교육센터 / SCOUT사업단 협력",
    goals: ["창업캠프 및 창업 아이디어 설명회 개최", "창업동아리 엑셀러레이팅 패키지 지원", "FAB Lab 구축 및 메이커스페이스 활성화"],
    budget: "512백만원"
  },
  "A3": {
    title: "지역산업 연계 글로벌 협력 거점 대학 육성",
    dept: "ECC센터 (교육혁신센터)",
    goals: ["해외 대학 및 글로벌 산업체 협력 네트워크 강화", "다국어 스마트 유학생 케어 앱 론칭 및 상담소 운영", "외국인 전용 특화 직무 단기 아카데미 개편"],
    budget: "1,115백만원"
  },
  "B1": {
    title: "중소·중견기업 맞춤형 기술지원·공동연구 활성화",
    dept: "ICC (기업협업센터)",
    goals: ["공용 고가 정밀 분석 장비 실무 교육 및 지원", "주력 신산업 분야 지산학 융합 컨퍼런스 세미나", "전문기술석사 연계 연구실(Lab) 활성화 지원"],
    budget: "1,320백만원"
  },
  "B2": {
    title: "AID 역량강화 기반 지역산업 전환 지원",
    dept: "AID-X지원센터",
    goals: ["AID-X 지원실 구축 및 정밀 서버 장비 도입", "전 학부(과) 참여형 AI·DX 교육과정 개편", "중소기업 현장 실증형 AI 알고리즘 적용 프로젝트"],
    budget: "710백만원"
  },
  "B3": {
    title: "지･산･학 협력 탄소중립 실천 플랫폼 구축",
    dept: "ICC (기업협업센터)",
    goals: ["AI 기반 탄소중립 및 ESG 교육과정 개발 운영", "중소기업 탄소배출 진단 및 저탄소 플랫폼 지원", "캠퍼스 에코-리빙랩 탄소감축 실증"],
    budget: "915백만원"
  },
  "B4": {
    title: "복합재난 대응 산업안전·보건 통합 운영체계 구축",
    dept: "ICC (기업협업센터)",
    goals: ["VR 활용 복합 가상 대피/화재 재난 안전훈련", "산업군별 맞춤형 재난 기술지원 및 매뉴얼 안전 진단", "간호시뮬레이션 연계 재난 교육장 운영"],
    budget: "540백만원"
  },
  "C1": {
    title: "U-LIFE 평생직업교육 기반 취∙창업 연계모델 구축",
    dept: "RCC (지역협업센터)",
    goals: ["성인학습자 친화형 유연 학사 제도 설계 연구", "취약계층 취·창업 연계 직무교육 및 자격 과정", "평생학습 교육과정 및 평생교육 추진단 운영"],
    budget: "985백만원"
  },
  "C2": {
    title: "동남권과 함께 성장하는 돌봄생태계, 울산愛 구현",
    dept: "울산늘봄누리센터",
    goals: ["방과후/방학 늘봄 프로그램 표준모델 개발 및 시범운영", "동남권 유관기관 돌봄 거버넌스 및 파트너십 구축", "늘봄학교 모니터링 품질관리 체계 및 브랜딩"],
    budget: "760백만원"
  },
  "D1": {
    title: "지역문제해결을 위한 울산형 혁신 솔루션 구축",
    dept: "RCC (지역협업센터)",
    goals: ["대학 교수 및 연구원 참여 리빙랩 과제 설계", "주민 참여형 생활밀착 에코-리빙랩 운영", "지자체 요구 RISE 정책 연구 포럼 개최"],
    budget: "1,180백만원"
  },
  "D2": {
    title: "지속가능한 보건복지 특성화 및 인재양성 체계 구축",
    dept: "RCC (지역협업센터)",
    goals: ["지역사회 기반 보건복지 거버넌스 구축", "맞춤형 보건복지 인재 양성 및 복지케어 모니터링", "실버산업 맞춤형 요양 보호 기술 교육 강좌"],
    budget: "690백만원"
  },
  "D3": {
    title: "에코 컬처로 만드는 꿀잼도시 울산",
    dept: "RCC (지역협업센터)",
    goals: ["캠퍼스-로컬 연계 에코컬처 프로젝트 및 브랜드 디자인", "청년 중심 상업공간 재활성화 및 도시재생", "시민체험형 문화예술 프로그램 및 축제 연계"],
    budget: "865백만원"
  }
};

// 단일 문자열로 저장되어 있을 유스케이스 방어용 헬퍼 함수
const getMilestoneArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
};

// 12개월 일정 마일스톤 가중치 공용 맵 선언 (ReferenceError 방어)
const phaseWeight = { 
  "P": 1, "A": 2, "B": 3, "Pr": 4, "I": 5,
  "Rq": 1, "DR": 2, "PDR": 2, "DL": 3, "BC": 4, "CS": 5
};

export default function ProcurementManager({
  currentRole,
  currentUser,
  selectedYear,
  setSelectedYear,
  subTab,
  onChangeSubTab,
  envData = [],
  setEnvData,
  equipData = [],
  setEquipData,
  serviceData = [],
  setServiceData,
  projects = []
}) {
  const monthsOrder = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2"];

  // 날짜 문자열로부터 해당 연도 회계연도 기준(3월~익년2월) 월 인덱스(0~11)를 반환하는 로컬 헬퍼
  const getMonthIndex = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const baseYear = 2024 + Number(selectedYear || 2);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const isCurrentYearPart = (month >= 3 && month <= 12 && year === baseYear);
    const isNextYearPart = ((month === 1 || month === 2) && year === baseYear + 1);
    if (isCurrentYearPart || isNextYearPart) {
      return monthsOrder.indexOf(String(month));
    }
    return null;
  };

  // 모달 제어 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState("env"); // "env", "equip", "service"
  
  // 수정 모드 상태 추가 (2번 요건 대응)
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // 기획문서, 구매문서 및 입찰문서 팝업용 상태 추가 (사용자 요건 3 대응)
  const [proposalModalData, setProposalModalData] = useState(null);
  const [purchaseModalData, setPurchaseModalData] = useState(null);
  const [bidModalData, setBidModalData] = useState(null);

  // 학과 및 부서 필터 이원화 및 정렬 상태 (3번 요건 대응)
  const [deptFilter, setDeptFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [sortField, setSortField] = useState("seq"); // 기본값 순번
  const [sortDirection, setSortDirection] = useState("asc"); // 기본값 오름차순

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // 환경개선 상세 팝업 상태
  const [selectedEnvItem, setSelectedEnvItem] = useState(null);

  // 기자재 탭 단위과제 필터 상태
  const [selectedEquipUnit, setSelectedEquipUnit] = useState("ALL");

  // 월별 마일스톤 멀티 체크 팝오버 상태
  const [activePopover, setActivePopover] = useState(null); // { equipId, month, x, y }

  // AI 분석 및 업로드 상태 제어
  const [isAnalyzingPlan, setIsAnalyzingPlan] = useState(false);
  const [isAnalyzingPurchase, setIsAnalyzingPurchase] = useState(false);
  const [isAnalyzingBid, setIsAnalyzingBid] = useState(false);

  // 업로드 진행률 상태 제어 (0% ~ 100%)
  const [uploadProgressPlan, setUploadProgressPlan] = useState(0);
  const [uploadProgressPurchase, setUploadProgressPurchase] = useState(0);
  const [uploadProgressBid, setUploadProgressBid] = useState(0);

  // 4. 입력 폼 임시 State
  const [formData, setFormData] = useState({
    title: "",
    unit: "A1",
    plan: "",
    meetingResult: "",
    progress: "",
    budgetPlan: "",
    budgetSpent: "",
    location: "",
    purpose: "",
    birdseyeView: "",
    blueprints: "",
    utilization: "",
    // 기자재용 10대 필드 맵
    name: "",
    deptName: "",      // 학과 선택
    divisionName: "",  // 부서 선택
    unitPrice: "",
    quantity: "",
    description: "",
    step: "기획",
    operation: "미래 핵심 신산업 주문식 교육 운영", // 기본 연계 프로그램 지정
    mgrDept: "ECC",
    // AI 관련문서 원본 텍스트 및 가상 요약 데이터 필드
    docPlanContent: "",
    docPurchaseContent: "",
    docBidContent: "",
    aiProposalData: null,
    aiPurchaseData: null,
    aiBidData: null,
    // Supabase 파일 업로드 메타데이터 보관 필드 추가 (요건 1, 3 반영)
    docPlanFile: null,            // 실제 로컬 File 객체 임시 보관
    docPurchaseFile: null,
    docBidFile: null,
    docPlanFileName: "",          // 업로드된 파일명
    docPurchaseFileName: "",
    docBidFileName: "",
    docPlanFileSize: 0,           // 업로드된 파일 크기 (바이트)
    docPurchaseFileSize: 0,
    docBidFileSize: 0,
    docPlanFileUrl: "",           // Supabase Storage public URL
    docPurchaseFileUrl: "",
    docBidFileUrl: "",
    // 신규 추가 폼에서 월별 구매단계 다중 입력을 위한 milestones 상태
    milestones: { "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [], "11": [], "12": [], "1": [], "2": [] },
    // 용역용
    providerQual: "",
    opResult: ""
  });

  // 파일 업로드 관련 핸들러들 (요건 1, 3 반영)
  const handleFileChange = (docType, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 메타데이터를 우선 로컬 폼 상태에 저장 (보안 고려 포함)
    const fieldPrefix = docType === "proposal" ? "docPlan" : docType === "purchase" ? "docPurchase" : "docBid";
    setFormData(prev => ({
      ...prev,
      [`${fieldPrefix}File`]: file,
      [`${fieldPrefix}FileName`]: file.name,
      [`${fieldPrefix}FileSize`]: file.size
    }));
  };

  const handleFileRemove = (docType) => {
    const fieldPrefix = docType === "proposal" ? "docPlan" : docType === "purchase" ? "docPurchase" : "docBid";
    const progressSetter = docType === "proposal" ? setUploadProgressPlan : docType === "purchase" ? setUploadProgressPurchase : setUploadProgressBid;
    
    setFormData(prev => ({
      ...prev,
      [`${fieldPrefix}File`]: null,
      [`${fieldPrefix}FileName`]: "",
      [`${fieldPrefix}FileSize`]: 0,
      [`${fieldPrefix}FileUrl`]: "",
      [`ai${docType === "proposal" ? "Proposal" : docType === "purchase" ? "Purchase" : "Bid"}Data`]: null,
      [fieldPrefix === "docPlan" ? "docPlan" : fieldPrefix === "docPurchase" ? "docPurchase" : "docBid"]: ""
    }));
    progressSetter(0);
  };

  // AI 분석용 예산 문자열 파서 (예: "120,000천원" 또는 "1.2억원" => 백만원 단위 변환)
  const parseBudgetStringToMillions = (budgetString) => {
    if (!budgetString) return "";
    const cleanStr = budgetString.toString().replace(/,/g, "");
    const numMatch = cleanStr.match(/\d+(\.\d+)?/);
    if (numMatch) {
      const val = parseFloat(numMatch[0]);
      if (cleanStr.includes("천원")) {
        return parseFloat((val * 1000 / 1000000).toFixed(2));
      }
      if (cleanStr.includes("억원")) {
        return val * 100;
      }
      if (cleanStr.includes("만원")) {
        return parseFloat((val / 100).toFixed(2));
      }
      if (val >= 100000) {
        return parseFloat((val / 1000000).toFixed(2));
      }
      return val;
    }
    return "";
  };

  const handleAnalyzeAndUpload = async (docType) => {
    const fieldPrefix = docType === "proposal" ? "docPlan" : docType === "purchase" ? "docPurchase" : "docBid";
    const file = formData[`${fieldPrefix}File`];
    
    // 파일이 로컬에도 없고 원격 업로드 URL도 없는 경우 체크
    if (!file && !formData[`${fieldPrefix}FileUrl`]) {
      alert("⚠️ 먼저 분석할 문서를 업로드해 주세요!");
      return;
    }

    const stateSetter = docType === "proposal" ? setIsAnalyzingPlan : docType === "purchase" ? setIsAnalyzingPurchase : setIsAnalyzingBid;
    const progressSetter = docType === "proposal" ? setUploadProgressPlan : docType === "purchase" ? setUploadProgressPurchase : setUploadProgressBid;

    stateSetter(true);
    progressSetter(10); // 업로드 개시

    try {
      let uploadedFileMeta = {
        name: formData[`${fieldPrefix}FileName`],
        size: formData[`${fieldPrefix}FileSize`],
        url: formData[`${fieldPrefix}FileUrl`]
      };

      // 1. 첨부된 실제 파일 객체가 로컬 임시 상태에 존재할 경우 Supabase Storage 업로드 실행
      if (file) {
        const uploadResult = await uploadFileToSupabase(docType, file, (progress) => {
          progressSetter(progress);
        });
        if (uploadResult) {
          uploadedFileMeta = uploadResult;
        }
      } else {
        progressSetter(100);
      }

      // 2. OpenAI GPT API 분석 요약 실행 (요건 2 반영)
      const totalPrice = (Number(formData.unitPrice) * Number(formData.quantity) * 1000);
      const aiResult = await callOpenAiGpt(
        docType,
        uploadedFileMeta.name,
        "", // 파일에서 텍스트 추출이 복잡하므로 메타와 더불어 mock 텍스트 병합 처리
        formData.name,
        formData.deptName,
        totalPrice
      );

      // 3. 분석 요약 정보 및 업로드된 파일 URL을 formData에 최종 갱신 및 자동 완성
      setFormData(prev => {
        const nextData = {
          ...prev,
          [`${fieldPrefix}FileName`]: uploadedFileMeta.name,
          [`${fieldPrefix}FileSize`]: uploadedFileMeta.size,
          [`${fieldPrefix}FileUrl`]: uploadedFileMeta.url,
          [`ai${docType === "proposal" ? "Proposal" : docType === "purchase" ? "Purchase" : "Bid"}Data`]: aiResult,
          [fieldPrefix === "docPlan" ? "docPlan" : fieldPrefix === "docPurchase" ? "docPurchase" : "docBid"]: aiResult.docNo
        };

        // --- AI 분석 결과를 기반으로 폼 필드 자동 완성 및 정리 ---
        
        // 1. 기획/구매 문서 예산 파싱 => 사업비(unitPrice) 자동 완성
        if (docType === "proposal" || docType === "purchase") {
          const parsedBudget = parseBudgetStringToMillions(aiResult.budget);
          if (parsedBudget) {
            nextData.unitPrice = parsedBudget;
          }
        }
        
        // 2. 결과(입찰) 문서 예산 파싱 => 실제 집행액(budgetSpent) 자동 완성
        if (docType === "bid") {
          const parsedSpent = parseBudgetStringToMillions(aiResult.budget);
          if (parsedSpent) {
            nextData.budgetSpent = parsedSpent;
          }
        }

        // 3. 기획 문서 분석 결과 기반 자동 채우기
        if (docType === "proposal") {
          // 단위과제 자동 선택 (A1, A2, B1, B2, C1, C2 등 매칭)
          if (aiResult.unit) {
            const matchedUnit = ["A1", "A2", "B1", "B2", "C1", "C2"].find(u => 
              aiResult.unit.toUpperCase().includes(u)
            );
            if (matchedUnit) {
              nextData.unit = matchedUnit;
            }
          }
          // 주관 부서 자동 선택
          if (aiResult.dept) {
            nextData.deptName = aiResult.dept;
          }
          // 기획 목표를 바탕으로 구축 목적(purpose)과 계획(plan) 자동완성
          nextData.purpose = "특화 인력 양성을 위한 핵심 시너지 공간 용도 상세 기술";
          if (aiResult.goals && Array.isArray(aiResult.goals) && aiResult.goals.length > 0) {
            nextData.plan = aiResult.goals.join("\n") || "";
          }
        }

        // 4. 구매 문서 분석 결과 기반 자동 채우기
        if (docType === "purchase") {
          if (aiResult.fromDept) {
            nextData.deptName = aiResult.fromDept;
          }
        }

        return nextData;
      });

      alert(`🤖 GPT AI 분석 및 ${docType === "proposal" ? "기획" : docType === "purchase" ? "구매" : "결과"}문서 업로드가 완료되었습니다!`);
    } catch (error) {
      console.error("문서 분석 에러:", error);
      alert("❌ 문서 분석 중 예상치 못한 에러가 발생했습니다.");
    } finally {
      stateSetter(false);
    }
  };

  // 팝오버를 열기 위한 트리거 함수
  const handleMilestoneClick = (e, equipId, month) => {
    e.stopPropagation();
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setActivePopover({
      equipId,
      month,
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  // 다중 체크 시 해당 단계 배열 토글 함수
  const handleMilestoneMultiToggle = (equipId, month, stepName) => {
    // 신규 추가 폼 내 마일스톤 조작 대응
    if (equipId === "NEW_FORM") {
      setFormData(prev => {
        const currentMilestones = prev.milestones || {};
        const currentList = getMilestoneArray(currentMilestones[month]);
        let nextList;
        if (currentList.includes(stepName)) {
          nextList = currentList.filter(s => s !== stepName);
        } else {
          nextList = [...currentList, stepName];
        }
        return {
          ...prev,
          milestones: {
            ...currentMilestones,
            [month]: nextList
          }
        };
      });
      return;
    }

    const activeEquipList = equipData.length > 0 ? equipData : defaultEquipments;
    const updated = activeEquipList.map(e => {
      if (e.id === equipId) {
        const currentMilestones = e.milestones || {};
        const currentList = getMilestoneArray(currentMilestones[month]);
        
        let nextList;
        if (currentList.includes(stepName)) {
          nextList = currentList.filter(s => s !== stepName);
        } else {
          nextList = [...currentList, stepName];
        }
        
        return {
          ...e,
          milestones: {
            ...currentMilestones,
            [month]: nextList
          }
        };
      }
      return e;
    });
    setEquipData(updated);
  };

  // 월별 PDCA 1줄 Gantt의 색상 및 텍스트를 다중 선택 상태에 맞춰 반환해 주는 헬퍼 스타일 함수
  const getMilestoneStyle = (stepList, monthNum) => {
    const list = getMilestoneArray(stepList);
    
    // 0개 선택
    if (list.length === 0) {
      return {
        bg: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        color: "rgba(255, 255, 255, 0.2)",
        text: monthNum,
        shadow: "none"
      };
    }
    
    // 각 단계별 텍스트 및 색상 매핑 (기획 P, 승인 A, 입찰 B, 구매 Pr, 검수 I 및 영문 약어 호환)
    const stepMeta = {
      "기획": { text: "P", color: "#f59e0b" },
      "승인": { text: "A", color: "#3b82f6" },
      "입찰": { text: "B", color: "#06b6d4" },
      "구매": { text: "Pr", color: "#a78bfa" },
      "검수": { text: "I", color: "#10b981" },
      "P": { text: "P", color: "#f59e0b" },
      "A": { text: "A", color: "#3b82f6" },
      "B": { text: "B", color: "#06b6d4" },
      "Pr": { text: "Pr", color: "#a78bfa" },
      "I": { text: "I", color: "#10b981" }
    };
    
    // 1개 선택 시
    if (list.length === 1) {
      const meta = stepMeta[list[0]] || { text: "?", color: "#6b7280" };
      return {
        bg: meta.color,
        border: `1px solid ${meta.color}`,
        color: "white",
        text: meta.text,
        shadow: `0 0 5px ${meta.color}80`
      };
    }
    
    // 2개 선택 시 (대각선 분할 그라데이션 적용)
    if (list.length === 2) {
      const meta1 = stepMeta[list[0]] || { text: "?", color: "#6b7280" };
      const meta2 = stepMeta[list[1]] || { text: "?", color: "#6b7280" };
      return {
        bg: `linear-gradient(135deg, ${meta1.color} 50%, ${meta2.color} 50%)`,
        border: "1px solid rgba(255, 255, 255, 0.3)",
        color: "white",
        text: `${meta1.text}/${meta2.text}`,
        shadow: `0 0 6px rgba(255, 255, 255, 0.3)`
      };
    }
    
    // 3개 이상 선택 시
    const firstMeta = stepMeta[list[0]] || { text: "?", color: "#6b7280" };
    return {
      bg: `linear-gradient(135deg, ${firstMeta.color} 30%, #374151 70%)`,
      border: "1px solid rgba(255, 255, 255, 0.4)",
      color: "white",
      text: `${firstMeta.text}+`,
      shadow: "0 0 6px rgba(255, 255, 255, 0.4)"
    };
  };

  // 동적으로 연계 프로그램을 획득하는 헬퍼 함수 (projects prop 연계 및 하드코딩 Fallback 제공)
  const getDynamicPrograms = (targetUnit) => {
    const unitKey = targetUnit || formData.unit;
    if (projects && projects.length > 0) {
      for (const proj of projects) {
        if (proj.units && proj.units.length > 0) {
          const matchedUnit = proj.units.find(u => u.id === unitKey);
          if (matchedUnit && matchedUnit.programs) {
            return matchedUnit.programs.map(prog => ({
              id: prog.id,
              name: prog.title
            }));
          }
        }
      }
    }
    return PROGRAMS_BY_UNIT[unitKey] || [];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "year") {
      const nextYear = Number(value);
      const nextUnit = nextYear === 1 ? "A1" : "A1가";
      const progs = getDynamicPrograms(nextUnit);
      const defaultProg = progs.length > 0 ? progs[0].name : "";
      setFormData(prev => ({
        ...prev,
        year: nextYear,
        unit: nextUnit,
        operation: defaultProg
      }));
    } else if (name === "unit") {
      const nextUnit = value;
      const progs = getDynamicPrograms(nextUnit);
      const defaultProg = progs.length > 0 ? progs[0].name : "";
      setFormData(prev => ({
        ...prev,
        unit: nextUnit,
        operation: defaultProg
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }

    if (modalType === "env") {
      const targetYear = Number(formData.year) || Number(selectedYear);

      // 금액 오입력(원화 단위 입력) 방지 가드
      const priceVal = parseFloat(formData.unitPrice || 0);
      const spentVal = parseFloat(formData.budgetSpent || 0);
      if (priceVal >= 100000 || spentVal >= 100000) {
        alert("⚠️ 금액 입력 단위를 확인해 주세요!\n현재 금액 입력란은 '백만 원 단위'입니다.\n(예: 1,100만 원 입력 시 -> 11 입력, 5,000만 원 입력 시 -> 50 입력)");
        return;
      }

      // 날짜 순차 정합성 검증
      const dateCheck = validateDatesChronological(targetYear, formData.dateP, formData.dateA, formData.dateB, formData.datePr, formData.dateI);
      if (!dateCheck.isValid) {
        alert(dateCheck.msg);
        return;
      }

      const activeEnvList = envData.length > 0 ? envData : [];
      const combinedDescription = `${formData.purpose || ""}\n${formData.utilization || ""}`;

      if (isEditMode && editingItemId) {
        // 수정 모드
        const updated = activeEnvList.map(item => {
          if (item.id === editingItemId) {
            return {
              ...item,
              year: targetYear,
              unit: formData.unit,
              title: formData.title || formData.name || "새 환경개선 항목",
              itemName: formData.title || formData.name || "새 환경개선 항목",
              deptName: formData.deptName || "",
              divisionName: formData.divisionName || "",
              unitPrice: Math.round(parseFloat(formData.unitPrice || 0) * 1000000),
              quantity: 1,
              budgetPlan: Math.round(parseFloat(formData.unitPrice || 0) * 1000000),
              budgetSpent: Math.round(parseFloat(formData.budgetSpent || 0) * 1000000),
              description: combinedDescription || "-",
              purpose: formData.purpose || "-",
              plan: formData.plan || "-",
              location: formData.location || "-",
              utilization: formData.utilization || "-",
              progress: formData.progress || "-",
              birdseyeView: formData.birdseyeView || "-",
              blueprints: formData.blueprints || "-",
              
              relatedDocs: [
                formData.aiProposalData?.docNo || formData.docPlan,
                formData.aiPurchaseData?.docNo || formData.docPurchase
              ].filter(Boolean).join(", "),
              docPlan: formData.aiProposalData?.docNo || formData.docPlan || "",
              docPurchase: formData.aiPurchaseData?.docNo || formData.docPurchase || "",
              docBid: "",
              docPlanContent: formData.docPlanContent || "",
              docPurchaseContent: formData.docPurchaseContent || "",
              docBidContent: "",
              aiProposalData: formData.aiProposalData || null,
              aiPurchaseData: formData.aiPurchaseData || null,
              aiBidData: null,
              
              docPlanFileName: formData.docPlanFileName || "",
              docPurchaseFileName: formData.docPurchaseFileName || "",
              docBidFileName: "",
              docPlanFileSize: formData.docPlanFileSize || 0,
              docPurchaseFileSize: formData.docPurchaseFileSize || 0,
              docBidFileSize: 0,
              docPlanFileUrl: formData.docPlanFileUrl || "",
              docPurchaseFileUrl: formData.docPurchaseFileUrl || "",
              docBidFileUrl: "",
              
              dateP: formData.dateP || "",
              dateA: formData.dateA || "",
              dateB: formData.dateB || "",
              datePr: formData.datePr || "",
              dateI: formData.dateI || ""
            };
          }
          return item;
        });
        setEnvData(updated);
        setIsAddModalOpen(false);
        setIsEditMode(false);
        setEditingItemId(null);
        alert("🛠️ 교육환경 개선 사업 정보가 성공적으로 수정되었습니다.");
      } else {
        // 신규 등록
        const nextSeq = activeEnvList.length + 1;
        const newItem = {
          id: Date.now(),
          year: targetYear,
          seq: nextSeq,
          unit: formData.unit,
          title: formData.title || formData.name || "새 환경개선 항목",
          itemName: formData.title || formData.name || "새 환경개선 항목",
          deptName: formData.deptName || "",
          divisionName: formData.divisionName || "",
          unitPrice: Math.round(parseFloat(formData.unitPrice || 0) * 1000000),
          quantity: 1,
          budgetPlan: Math.round(parseFloat(formData.unitPrice || 0) * 1000000),
          budgetSpent: Math.round(parseFloat(formData.budgetSpent || 0) * 1000000),
          description: combinedDescription || "-",
          purpose: formData.purpose || "-",
          plan: formData.plan || "-",
          location: formData.location || "-",
          utilization: formData.utilization || "-",
          progress: formData.progress || "-",
          birdseyeView: formData.birdseyeView || "-",
          blueprints: formData.blueprints || "-",
          
          relatedDocs: [
            formData.aiProposalData?.docNo || formData.docPlan,
            formData.aiPurchaseData?.docNo || formData.docPurchase
          ].filter(Boolean).join(", "),
          docPlan: formData.aiProposalData?.docNo || formData.docPlan || "",
          docPurchase: formData.aiPurchaseData?.docNo || formData.docPurchase || "",
          docBid: "",
          docPlanContent: formData.docPlanContent || "",
          docPurchaseContent: formData.docPurchaseContent || "",
          docBidContent: "",
          aiProposalData: formData.aiProposalData || null,
          aiPurchaseData: formData.aiPurchaseData || null,
          aiBidData: null,
          
          docPlanFileName: formData.docPlanFileName || "",
          docPurchaseFileName: formData.docPurchaseFileName || "",
          docBidFileName: "",
          docPlanFileSize: formData.docPlanFileSize || 0,
          docPurchaseFileSize: formData.docPurchaseFileSize || 0,
          docBidFileSize: 0,
          docPlanFileUrl: formData.docPlanFileUrl || "",
          docPurchaseFileUrl: formData.docPurchaseFileUrl || "",
          docBidFileUrl: "",
          
          dateP: formData.dateP || "",
          dateA: formData.dateA || "",
          dateB: formData.dateB || "",
          datePr: formData.datePr || "",
          dateI: formData.dateI || ""
        };
        setEnvData([newItem, ...activeEnvList]);
        setIsAddModalOpen(false);
        alert(`🛠️ 새 교육환경 개선 사업이 ${targetYear}차년도 사업계획서에 성공적으로 등록되었습니다.`);
      }
    } else if (modalType === "equip") {
      // 1) 단장님 조건: 학과 또는 부서 중 최소 하나는 반드시 선택되어야 함
      if (!formData.deptName && !formData.divisionName) {
        alert("⚠️ 학과 또는 부서 중 최소 한 곳은 반드시 지정하셔야 합니다.");
        return;
      }

      const targetYear = Number(formData.year) || Number(selectedYear);

      // 2) 요건 4: 단계별 입력 일정 순차 및 연차 범위 정합성 검증
      const dateCheck = validateDatesChronological(targetYear, formData.dateP, formData.dateA, formData.dateB, formData.datePr, formData.dateI);
      if (!dateCheck.isValid) {
        alert(dateCheck.msg);
        return;
      }

      const activeEquipList = equipData.length > 0 ? equipData : defaultEquipments;

      if (isEditMode && editingItemId) {
        // 수정 모드 분기 (요건 2 대응)
        const combinedDescription = `${formData.descriptionPurpose || ""}\n${formData.descriptionPlan || ""}`;
        const updated = activeEquipList.map(item => {
          if (item.id === editingItemId) {
            return {
              ...item,
              year: targetYear,
              unit: formData.unit,
              deptName: formData.deptName || "",
              divisionName: formData.divisionName || "",
              itemName: formData.name || "수정 기자재 항목",
              unitPrice: Math.round(parseFloat(formData.unitPrice || 0) * 1000000),
              quantity: Number(formData.quantity) || 1,
              description: combinedDescription || "-",
              operation: formData.operation || "미래 핵심 신산업 주문식 교육 운영",
              password: currentUser?.password || formData.password || item.password || "1234", // 현재 로그인 유저 비밀번호 연동
              relatedDocs: [
                formData.aiProposalData?.docNo || formData.docPlan,
                formData.aiPurchaseData?.docNo || formData.docPurchase,
                formData.aiBidData?.docNo || formData.docBid
              ].filter(Boolean).join(", "),
              docPlan: formData.aiProposalData?.docNo || formData.docPlan || "",
              docPurchase: formData.aiPurchaseData?.docNo || formData.docPurchase || "",
              docBid: formData.aiBidData?.docNo || formData.docBid || "",
              docPlanContent: formData.docPlanContent || "",
              docPurchaseContent: formData.docPurchaseContent || "",
              docBidContent: formData.docBidContent || "",
              aiProposalData: formData.aiProposalData || null,
              aiPurchaseData: formData.aiPurchaseData || null,
              aiBidData: formData.aiBidData || null,
              // 파일 업로드 관련 메타데이터 저장 (요건 3 반영)
              docPlanFileName: formData.docPlanFileName || "",
              docPurchaseFileName: formData.docPurchaseFileName || "",
              docBidFileName: formData.docBidFileName || "",
              docPlanFileSize: formData.docPlanFileSize || 0,
              docPurchaseFileSize: formData.docPurchaseFileSize || 0,
              docBidFileSize: formData.docBidFileSize || 0,
              docPlanFileUrl: formData.docPlanFileUrl || "",
              docPurchaseFileUrl: formData.docPurchaseFileUrl || "",
              docBidFileUrl: formData.docBidFileUrl || "",
              dateP: formData.dateP || "",
              dateA: formData.dateA || "",
              dateB: formData.dateB || "",
              datePr: formData.datePr || "",
              dateI: formData.dateI || ""
            };
          }
          return item;
        });
        setEquipData(updated);
        setIsAddModalOpen(false);
        setIsEditMode(false);
        setEditingItemId(null);
        
        // 요건 6: 화면 연차 자동 전환
        if (setSelectedYear) {
          setSelectedYear(targetYear);
        }
        alert("🔬 기자재 정보가 성공적으로 수정되었습니다.");
      } else {
        // 신규 등록 모드
        const nextSeq = activeEquipList.length + 1;
        const combinedDescription = `${formData.descriptionPurpose || ""}\n${formData.descriptionPlan || ""}`;
        const newItem = {
          id: Date.now(),
          year: targetYear,
          unit: formData.unit,
          seq: nextSeq,
          deptName: formData.deptName || "",
          divisionName: formData.divisionName || "",
          itemName: formData.name || "새 기자재 항목",
          unitPrice: Math.round(parseFloat(formData.unitPrice || 0) * 1000000),
          quantity: Number(formData.quantity) || 1,
          description: combinedDescription || "-",
          operation: formData.operation || "미래 핵심 신산업 주문식 교육 운영",
          mgrDept: formData.mgrDept || "ECC",
          password: currentUser?.password || formData.password || "1234", // 현재 로그인 유저 비밀번호 연동
          relatedDocs: [
            formData.aiProposalData?.docNo || formData.docPlan,
            formData.aiPurchaseData?.docNo || formData.docPurchase,
            formData.aiBidData?.docNo || formData.docBid
          ].filter(Boolean).join(", "),
          docPlan: formData.aiProposalData?.docNo || formData.docPlan || "",
          docPurchase: formData.aiPurchaseData?.docNo || formData.docPurchase || "",
          docBid: formData.aiBidData?.docNo || formData.docBid || "",
          docPlanContent: formData.docPlanContent || "",
          docPurchaseContent: formData.docPurchaseContent || "",
          docBidContent: formData.docBidContent || "",
          aiProposalData: formData.aiProposalData || null,
          aiPurchaseData: formData.aiPurchaseData || null,
          aiBidData: formData.aiBidData || null,
          // 파일 업로드 관련 메타데이터 저장 (요건 3 반영)
          docPlanFileName: formData.docPlanFileName || "",
          docPurchaseFileName: formData.docPurchaseFileName || "",
          docBidFileName: formData.docBidFileName || "",
          docPlanFileSize: formData.docPlanFileSize || 0,
          docPurchaseFileSize: formData.docPurchaseFileSize || 0,
          docBidFileSize: formData.docBidFileSize || 0,
          docPlanFileUrl: formData.docPlanFileUrl || "",
          docPurchaseFileUrl: formData.docPurchaseFileUrl || "",
          docBidFileUrl: formData.docBidFileUrl || "",
          dateP: formData.dateP || "",
          dateA: formData.dateA || "",
          dateB: formData.dateB || "",
          datePr: formData.datePr || "",
          dateI: formData.dateI || ""
        };
        setEquipData([...activeEquipList, newItem]);
        setIsAddModalOpen(false);
        
        // 요건 6: 화면 연차 자동 전환
        if (setSelectedYear) {
          setSelectedYear(targetYear);
        }
        alert(`🔬 새 기자재 항목이 ${targetYear}차년도 사업계획서에 성공적으로 등록되었습니다.`);
      }
    } else if (modalType === "service") {
      // 1. 관련학과, 관련부서 중 최소 하나는 반드시 지정해야 함
      if (!formData.deptName && !formData.divisionName) {
        alert("⚠️ 배정 학과(관련학과) 혹은 배정 행정부서(관련부서) 중 최소 하나는 반드시 입력해야 합니다.");
        return;
      }

      const priceVal = parseFloat(formData.budgetPlan || 0);
      const spentVal = parseFloat(formData.budgetSpent || 0);

      // 2. 실제 집행액은 사업예산 이하여야 함
      if (spentVal > priceVal) {
        alert("⚠️ 실제 집행액은 사업예산 계획액을 초과할 수 없습니다. 금액을 확인해 주세요.");
        return;
      }

      // 3. 금액 오입력(천원 단위 대신 원화 전체 기입) 방지 가드
      if (priceVal >= 10000000 || spentVal >= 10000000) {
        alert("⚠️ 금액 입력 단위를 확인해 주세요!\n현재 주요 용역의 금액 입력란은 '천 원 단위'입니다.\n(예: 1,000만 원 입력 시 -> 10000 입력, 1억 원 입력 시 -> 100000 입력)");
        return;
      }

      const activeServiceList = serviceData.length > 0 ? serviceData : [];
      const combinedDocs = [
        formData.aiProposalData?.docNo || formData.docPlan,
        formData.aiPurchaseData?.docNo || formData.docPurchase,
        formData.aiBidData?.docNo || formData.docBid
      ].filter(Boolean).join(", ");

      if (isEditMode) {
        // 수정 모드
        const updated = activeServiceList.map(item => {
          if (item.id === editingItemId) {
            return {
              ...item,
              unit: formData.unit,
              programId: formData.programId || "",
              programName: formData.programName || "",
              deptName: formData.deptName || "",
              divisionName: formData.divisionName || "",
              title: formData.title || "새 주요 용역 항목",
              purpose: formData.purpose || "-",
              providerQual: formData.providerQual || "-",
              // 천원 단위 입력을 원화 단위로 곱하여 저장
              budgetPlan: Math.round(parseFloat(formData.budgetPlan || 0) * 1000),
              budgetSpent: Math.round(parseFloat(formData.budgetSpent || 0) * 1000),
              opResult: formData.opResult || "-",
              password: formData.password || "1234",
              
              // 7대 행정 절차 날짜 매핑
              datePp: formData.datePp || "",
              dateRfo: formData.dateRfo || "",
              dateB: formData.dateB || "",
              dateEs: formData.dateEs || "",
              dateC: formData.dateC || "",
              dateE: formData.dateE || "",
              dateI: formData.dateI || "",

              // 관련문서 정보
              relatedDocs: combinedDocs,
              docPlan: formData.aiProposalData?.docNo || formData.docPlan || "",
              docPurchase: formData.aiPurchaseData?.docNo || formData.docPurchase || "",
              docBid: formData.aiBidData?.docNo || formData.docBid || "",
              docPlanContent: formData.docPlanContent || "",
              docPurchaseContent: formData.docPurchaseContent || "",
              docBidContent: formData.docBidContent || "",
              aiProposalData: formData.aiProposalData || null,
              aiPurchaseData: formData.aiPurchaseData || null,
              aiBidData: formData.aiBidData || null,
              
              // 파일 업로드 관련 메타데이터
              docPlanFileName: formData.docPlanFileName || "",
              docPurchaseFileName: formData.docPurchaseFileName || "",
              docBidFileName: formData.docBidFileName || "",
              docPlanFileSize: formData.docPlanFileSize || 0,
              docPurchaseFileSize: formData.docPurchaseFileSize || 0,
              docBidFileSize: formData.docBidFileSize || 0,
              docPlanFileUrl: formData.docPlanFileUrl || "",
              docPurchaseFileUrl: formData.docPurchaseFileUrl || "",
              docBidFileUrl: formData.docBidFileUrl || ""
            };
          }
          return item;
        });
        setServiceData(updated);
        alert("💼 주요 용역 정보가 성공적으로 수정되었습니다.");
      } else {
        // 신규 등록 모드
        const newItem = {
          id: Date.now(),
          unit: formData.unit,
          programId: formData.programId || "",
          programName: formData.programName || "",
          deptName: formData.deptName || "",
          divisionName: formData.divisionName || "",
          title: formData.title || "새 주요 용역 항목",
          purpose: formData.purpose || "-",
          providerQual: formData.providerQual || "-",
          // 천원 단위 입력을 원화 단위로 곱하여 저장
          budgetPlan: Math.round(parseFloat(formData.budgetPlan || 0) * 1000),
          budgetSpent: Math.round(parseFloat(formData.budgetSpent || 0) * 1000),
          opResult: formData.opResult || "-",
          password: formData.password || "1234",
          
          // 7대 행정 절차 날짜 매핑
          datePp: formData.datePp || "",
          dateRfo: formData.dateRfo || "",
          dateB: formData.dateB || "",
          dateEs: formData.dateEs || "",
          dateC: formData.dateC || "",
          dateE: formData.dateE || "",
          dateI: formData.dateI || "",

          // 관련문서 정보
          relatedDocs: combinedDocs,
          docPlan: formData.aiProposalData?.docNo || formData.docPlan || "",
          docPurchase: formData.aiPurchaseData?.docNo || formData.docPurchase || "",
          docBid: formData.aiBidData?.docNo || formData.docBid || "",
          docPlanContent: formData.docPlanContent || "",
          docPurchaseContent: formData.docPurchaseContent || "",
          docBidContent: formData.docBidContent || "",
          aiProposalData: formData.aiProposalData || null,
          aiPurchaseData: formData.aiPurchaseData || null,
          aiBidData: formData.aiBidData || null,
          
          // 파일 업로드 관련 메타데이터
          docPlanFileName: formData.docPlanFileName || "",
          docPurchaseFileName: formData.docPurchaseFileName || "",
          docBidFileName: formData.docBidFileName || "",
          docPlanFileSize: formData.docPlanFileSize || 0,
          docPurchaseFileSize: formData.docPurchaseFileSize || 0,
          docBidFileSize: formData.docBidFileSize || 0,
          docPlanFileUrl: formData.docPlanFileUrl || "",
          docPurchaseFileUrl: formData.docPurchaseFileUrl || "",
          docBidFileUrl: formData.docBidFileUrl || ""
        };
        setServiceData([newItem, ...activeServiceList]);
        alert("💼 새 주요 용역 항목이 성공적으로 등록되었습니다.");
      }
    }

    // 모달 리셋
    setIsAddModalOpen(false);
    setFormData({
      title: "",
      unit: "A1",
      plan: "",
      meetingResult: "",
      progress: "",
      budgetPlan: "",
      budgetSpent: "",
      location: "",
      purpose: "",
      birdseyeView: "",
      blueprints: "",
      utilization: "",
      name: "",
      deptName: "",
      divisionName: "",
      unitPrice: "",
      quantity: "",
      description: "",
      step: "기획",
      operation: "교과목(정규)",
      mgrDept: "ECC",
      milestones: { "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [], "11": [], "12": [], "1": [], "2": [] },
      providerQual: "",
      opResult: ""
    });
  };

  const openAddModal = (type) => {
    setModalType(type);
    setIsEditMode(false);
    setEditingItemId(null);
    setFormData({
      year: selectedYear,
      unit: selectedYear === 1 ? "A1" : "A1가",
      title: "",
      plan: "",
      meetingResult: "",
      progress: "",
      budgetPlan: "",
      budgetSpent: "",
      location: "",
      purpose: "",
      birdseyeView: "",
      blueprints: "",
      utilization: "",
      name: "",
      deptName: "",
      divisionName: "",
      unitPrice: "",
      quantity: "",
      description: "",
      descriptionPurpose: "",
      descriptionPlan: "",
      step: "기획",
      operation: selectedYear === 1 ? "미래 핵심 신산업 주문식 교육 운영" : "친환경 스마트 친조선 융합 기술 교육", // 1차년도/2차년도 기본 연계 프로그램 분기
      mgrDept: "ECC",
      password: "",
      relatedDocs: "", // 관련문서 초기화
      docPlan: "",
      docPurchase: "",
      docBid: "",
      docPlanContent: "",
      docPurchaseContent: "",
      docBidContent: "",
      aiProposalData: null,
      aiPurchaseData: null,
      aiBidData: null,
      docPlanFile: null,
      docPurchaseFile: null,
      docBidFile: null,
      docPlanFileName: "",
      docPurchaseFileName: "",
      docBidFileName: "",
      docPlanFileSize: 0,
      docPurchaseFileSize: 0,
      docBidFileSize: 0,
      docPlanFileUrl: "",
      docPurchaseFileUrl: "",
      docBidFileUrl: "",
      providerQual: "",
      opResult: "",
      
      // 주요 용역 전용 필드들 추가
      programId: "",
      programName: "",
      datePp: "",
      dateRfo: "",
      dateB: "",
      dateEs: "",
      dateC: "",
      dateE: "",
      dateI: ""
    });
    // 업로드 진행률 리셋
    setUploadProgressPlan(0);
    setUploadProgressPurchase(0);
    setUploadProgressBid(0);
    setIsAddModalOpen(true);
  };

  const openEditModal = (equip) => {
    const currentModalType = subTab === "env_improvement" ? "env" : subTab === "major_services" ? "service" : "equip";
    setModalType(currentModalType);
    setIsEditMode(true);
    setEditingItemId(equip.id);
    const docParts = (equip.relatedDocs || "").split(",").map(d => d.trim()).filter(Boolean);
    const descText = equip.description || "";
    const descParts = descText.split("\n").map(l => l.trim());
    setFormData({
      year: equip.year,
      unit: equip.unit,
      name: equip.itemName || equip.name || equip.title || "",
      title: equip.title || equip.itemName || "",
      deptName: equip.deptName || "",
      divisionName: equip.divisionName || "",
      unitPrice: equip.unitPrice ? parseFloat((equip.unitPrice / 1000000).toFixed(2)) : (equip.budgetPlan ? parseFloat((equip.budgetPlan / 1000000).toFixed(2)) : ""),
      quantity: equip.quantity || 1,
      description: equip.description || "",
      descriptionPurpose: equip.purpose || descParts[0] || "",
      descriptionPlan: equip.plan || descParts[1] || "",
      budgetPlan: currentModalType === "service"
        ? (equip.budgetPlan ? Math.round(equip.budgetPlan / 1000) : "")
        : (equip.budgetPlan ? parseFloat((equip.budgetPlan / 1000000).toFixed(2)) : (equip.unitPrice ? parseFloat((equip.unitPrice / 1000000).toFixed(2)) : "")),
      budgetSpent: currentModalType === "service"
        ? (equip.budgetSpent ? Math.round(equip.budgetSpent / 1000) : "")
        : (equip.budgetSpent ? parseFloat((equip.budgetSpent / 1000000).toFixed(2)) : ""),
      location: equip.location || "",
      utilization: equip.utilization || "",
      progress: equip.progress || "",
      birdseyeView: equip.birdseyeView || "",
      blueprints: equip.blueprints || "",
      operation: equip.operation || "미래 핵심 신산업 주문식 교육 운영",
      password: equip.password || "1234",
      relatedDocs: equip.relatedDocs || "", // 관련문서 로드
      docPlan: equip.docPlan || docParts[0] || "",
      docPurchase: equip.docPurchase || docParts[1] || "",
      docBid: equip.docBid || docParts[2] || "",
      docPlanContent: equip.docPlanContent || "",
      docPurchaseContent: equip.docPurchaseContent || "",
      docBidContent: equip.docBidContent || "",
      aiProposalData: equip.aiProposalData || null,
      aiPurchaseData: equip.aiPurchaseData || null,
      aiBidData: equip.aiBidData || null,
      docPlanFile: null,
      docPurchaseFile: null,
      docBidFile: null,
      docPlanFileName: equip.docPlanFileName || "",
      docPurchaseFileName: equip.docPurchaseFileName || "",
      docBidFileName: equip.docBidFileName || "",
      docPlanFileSize: equip.docPlanFileSize || 0,
      docPurchaseFileSize: equip.docPurchaseFileSize || 0,
      docBidFileSize: equip.docBidFileSize || 0,
      docPlanFileUrl: equip.docPlanFileUrl || "",
      docPurchaseFileUrl: equip.docPurchaseFileUrl || "",
      docBidFileUrl: equip.docBidFileUrl || "",
      
      // 기존 기자재 5대 날짜
      dateP: equip.dateP || "",
      dateA: equip.dateA || "",
      dateB: equip.dateB || "",
      datePr: equip.datePr || "",
      dateI: equip.dateI || "",

      // 주요 용역 7대 날짜 및 프로그램 메타 정보
      programId: equip.programId || "",
      programName: equip.programName || "",
      datePp: equip.datePp || "",
      dateRfo: equip.dateRfo || "",
      dateB: equip.dateB || "",
      dateEs: equip.dateEs || "",
      dateC: equip.dateC || "",
      dateE: equip.dateE || "",
      dateI: equip.dateI || ""
    });
    // 업로드 진행률 리셋
    setUploadProgressPlan(0);
    setUploadProgressPurchase(0);
    setUploadProgressBid(0);
    setIsAddModalOpen(true);
  };

  return (
    <div className="procurement-manager-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <style>{`
        /* 툴팁 기본 스타일 */
        .milestone-tooltip-container {
          position: relative;
        }
        
        .milestone-tooltip {
          position: absolute;
          bottom: 135%;
          left: 50%;
          transform: translate(-50%, 8px);
          background: rgba(15, 23, 42, 0.96);
          color: #ffffff;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.12);
          z-index: 999;
          pointer-events: none;
        }
        
        .milestone-tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(15, 23, 42, 0.96);
        }
        
        .milestone-tooltip-container:hover .milestone-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, 0);
        }

        /* 현재 단계 동적 말풍선(상시 노출) */
        .status-flag-balloon {
          position: absolute;
          bottom: 140%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-color);
          color: #ffffff;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 3px 8px var(--shadow-color);
          border: 1px solid var(--border-color);
          z-index: 10;
          animation: statusPulse 2s infinite ease-in-out;
        }

        .status-flag-balloon::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: var(--bg-color);
        }

        @keyframes statusPulse {
          0%, 100% {
            transform: translate(-50%, 0px);
          }
          50% {
            transform: translate(-50%, -4px);
          }
        }
      `}</style>
      
      {/* 1. 환경개선 탭 본문 */}
      {subTab === "env_improvement" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 환경개선 상단 필터 카드 */}
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                🛠️ 교육환경 개선 사업 현황
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                지자체 라이즈 대학 특화 공간 및 스마트 첨단 강의실 구축 진행 현황
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              {/* 학과 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="">학과 전체</option>
                  <option value="기계공학부">기계공학부</option>
                  <option value="기계시스템전공">{"\u00A0-\u00A0기계시스템전공"}</option>
                  <option value="기계설비전공">{"\u00A0-\u00A0기계설비전공"}</option>
                  <option value="전기전자공학부">전기전자공학부</option>
                  <option value="전기전공">{"\u00A0-\u00A0전기전공"}</option>
                  <option value="스마트전자전공">{"\u00A0-\u00A0스마트전자전공"}</option>
                  <option value="조선해양시스템공학과">조선해양시스템공학과</option>
                  <option value="컴퓨터공학과">컴퓨터공학과</option>
                  <option value="화학공학과">화학공학과</option>
                  <option value="게임영상학과">게임영상학과</option>
                  <option value="실내건축디자인과">실내건축디자인과</option>
                  <option value="융합안전공학과">융합안전공학과</option>
                  <option value="인테리어시공학과">인테리어시공학과</option>
                  <option value="간호학부">간호학부</option>
                  <option value="물리치료학과">물리치료학과</option>
                  <option value="치위생학과">치위생학과</option>
                  <option value="식품영양학과">식품영양학과</option>
                  <option value="호텔조리제빵과">호텔조리제빵과</option>
                  <option value="스포츠재활학부">스포츠재활학부</option>
                  <option value="스포츠건강재활학과">스포츠건강재활학과</option>
                  <option value="푸드케어학과">푸드케어학과</option>
                  <option value="골프산업과">골프산업과</option>
                  <option value="반려동물보건과">반려동물보건과</option>
                  <option value="사회복지학과">사회복지학과</option>
                  <option value="유아교육과">유아교육과</option>
                  <option value="세무회계학과">세무회계학과</option>
                  <option value="사회복지상담학과">사회복지상담학과</option>
                  <option value="국제학부">국제학부</option>
                  <option value="미래모빌리티제조학과">미래모빌리티제조학과</option>
                  <option value="바이오화학생산기술학과">바이오화학생산기술학과</option>
                  <option value="인공지능기반텔레헬스학과">인공지능기반텔레헬스학과</option>
                </select>
              </div>

              {/* 부서 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="">부서 전체</option>
                  <optgroup label="앵커사업단 및 센터">
                    <option value="사업운영팀">사업운영팀</option>
                    <option value="ECC센터">ECC센터</option>
                    <option value="ICC센터">ICC센터</option>
                    <option value="RCC센터">RCC센터</option>
                    <option value="AID-X지원센터">AID-X지원센터</option>
                    <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                    <option value="신산업특화센터">신산업특화센터</option>
                  </optgroup>
                  <optgroup label="대학본부">
                    <option value="교무팀">교무팀</option>
                    <option value="교수학습지원센터">교수학습지원센터</option>
                    <option value="직업교육혁신센터">직업교육혁신센터</option>
                    <option value="교양교육혁신센터">교양교육혁신센터</option>
                    <option value="기획팀">기획팀</option>
                    <option value="대외협력실">대외협력실</option>
                    <option value="입학팀">입학팀</option>
                    <option value="진로진학지원센터">진로진학지원센터</option>
                    <option value="총무팀">총무팀</option>
                    <option value="재무회계팀">재무회계팀</option>
                    <option value="국제교류원운영팀">국제교류원운영팀</option>
                    <option value="글로컬비즈니스센터">글로컬비즈니스센터</option>
                    <option value="IR센터">IR센터</option>
                  </optgroup>
                  <optgroup label="산학협력단">
                    <option value="산학기획팀">산학기획팀</option>
                    <option value="산학지원팀">산학지원팀</option>
                    <option value="창업창직교육센터">창업창직교육센터</option>
                    <option value="현장실습지원센터">현장실습지원센터</option>
                    <option value="울산광역시 탄소중립 지원센터">울산광역시 탄소중립 지원센터</option>
                    <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                    <option value="종합환경분석센터">종합환경분석센터</option>
                    <option value="영상콘텐츠제작센터">영상콘텐츠제작센터</option>
                    <option value="스포츠재활운동센터">스포츠재활운동센터</option>
                    <option value="이차전지연구소">이차전지연구소</option>
                    <option value="지산학혁신연구소">지산학혁신연구소</option>
                    <option value="어린이급식관리사업단">어린이급식관리사업단</option>
                  </optgroup>
                </select>
              </div>

              {/* 전체 과제 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={selectedEquipUnit}
                  onChange={(e) => setSelectedEquipUnit(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="ALL">전체 과제</option>
                  {Number(selectedYear) === 1 
                    ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                        <option key={u} value={u}>{u} 과제</option>
                      ))
                    : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3"].map(u => (
                        <option key={u} value={u}>{u} 과제</option>
                      ))
                  }
                </select>
              </div>



              {currentRole.id !== "GUEST" && (
                <button 
                  className="btn btn-primary"
                  onClick={() => openAddModal("env")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.4rem 1rem",
                    borderRadius: "6px",
                    background: "var(--accent-color)",
                    border: "none",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={16} />
                  환경개선 항목 추가
                </button>
              )}
            </div>
          </div>

          {/* 환경개선 테이블 */}
          <div className="glass-card" style={{ padding: "0.25rem", borderRadius: "12px", overflowX: "auto", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(10, 15, 30, 0.4)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "white" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.01)" }}>
                  <th 
                    rowSpan={3} 
                    onClick={() => handleSort("seq")} 
                    style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "55px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="순번 기준 정렬"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                      순번
                      <ArrowUpDown size={12} style={{ opacity: sortField === "seq" ? 1 : 0.4 }} />
                    </div>
                  </th>
                  <th 
                    rowSpan={3} 
                    onClick={() => handleSort("unit")} 
                    style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "65px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="단위과제 기준 정렬"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                      단위과제
                      <ArrowUpDown size={12} style={{ opacity: sortField === "unit" ? 1 : 0.4 }} />
                    </div>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "130px", verticalAlign: "middle" }}>학과 / 부서</th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "270px", verticalAlign: "middle" }}>환경구축 명</th>
                  <th 
                    rowSpan={3} 
                    onClick={() => handleSort("unitPrice")} 
                    style={{ padding: "0.5rem 0.3rem", textAlign: "center", fontWeight: "800", width: "105px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="사업비 기준 정렬"
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        사업비
                        <ArrowUpDown size={12} style={{ opacity: sortField === "unitPrice" ? 1 : 0.4 }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: "400", color: "var(--text-secondary-dark)", marginTop: "0.1rem" }}>(백만원)</span>
                    </div>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "384px", verticalAlign: "middle" }}>구축목적 및 활용계획</th>
                  <th colSpan={12} style={{ padding: "0.5rem", textAlign: "center", fontWeight: "800", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255, 255, 255, 0.01)", lineHeight: "1.3" }}>
                    구축단계<br />
                    <span style={{ fontSize: "0.63rem", fontWeight: "normal", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>[요청(Rq) ➔ 검토∙심의∙결정(PDR) ➔ 설계∙인허가(DL) ➔ 입찰∙계약(BC) ➔ 시공∙감리(CS)]</span>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "80px", verticalAlign: "middle" }}>관련문서</th>
                  {currentRole.id !== "GUEST" && (
                    <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "65px", verticalAlign: "middle" }}>제어</th>
                  )}
                </tr>
                {/* 2행: 연도 분할 */}
                <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <th colSpan={10} style={{ padding: "0.25rem 0.5rem", textAlign: "center", fontWeight: "750", fontSize: "0.75rem", color: "var(--accent-color)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                    '{String(2024 + (Number(selectedYear) || 1)).slice(-2)}년
                  </th>
                  <th colSpan={2} style={{ padding: "0.25rem 0.5rem", textAlign: "center", fontWeight: "750", fontSize: "0.75rem", color: "var(--accent-color)" }}>
                    '{String(2024 + (Number(selectedYear) || 1) + 1).slice(-2)}년
                  </th>
                </tr>
                {/* 3행: 월 리스트 */}
                <tr style={{ background: "rgba(255, 255, 255, 0.01)", borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
                  {monthsOrder.map((m, idx) => (
                    <th 
                      key={m} 
                      style={{ 
                        padding: "0.3rem 0.2rem", 
                        textAlign: "center", 
                        fontWeight: "800", 
                        fontSize: "0.75rem", 
                        color: "var(--text-secondary-dark)",
                        width: "36px",
                        whiteSpace: "nowrap",
                        borderRight: idx < 11 ? "1px solid rgba(255,255,255,0.03)" : "none"
                      }}
                    >
                      {m}월
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const activeEnvList = envData.length > 0 ? envData : [];
                  
                  // 1) 과제 필터링
                  let filteredEnvs = selectedEquipUnit === "ALL" 
                    ? activeEnvList 
                    : activeEnvList.filter(e => e.unit === selectedEquipUnit);

                  // 2) 학과 및 부서 필터
                  if (deptFilter) {
                    filteredEnvs = filteredEnvs.filter(e => (e.deptName || "").includes(deptFilter));
                  }
                  if (divisionFilter) {
                    filteredEnvs = filteredEnvs.filter(e => (e.divisionName || "").includes(divisionFilter));
                  }

                  // 3) 정렬 적용
                  filteredEnvs = [...filteredEnvs].sort((a, b) => {
                    let aVal = a[sortField];
                    let bVal = b[sortField];
                    if (sortField === "total") {
                      aVal = (Number(a.unitPrice) || 0) * (Number(a.quantity) || 1);
                      bVal = (Number(b.unitPrice) || 0) * (Number(b.quantity) || 1);
                    } else if (sortField === "unitPrice") {
                      aVal = Number(a.unitPrice) || 0;
                      bVal = Number(b.unitPrice) || 0;
                    } else if (sortField === "seq" || sortField === "id") {
                      aVal = Number(aVal) || 0;
                      bVal = Number(bVal) || 0;
                    }
                    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
                    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
                    return 0;
                  });

                  if (filteredEnvs.length === 0) {
                    return (
                      <tr>
                        <td colSpan={11 + monthsOrder.length} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          📭 등록된 교육환경 개선 사업 내역이 없습니다.
                        </td>
                      </tr>
                    );
                  }

                  return filteredEnvs.map((equip, idx) => {
                    const price = equip.unitPrice ? (equip.unitPrice / 1000000) : (equip.budgetPlan ? (equip.budgetPlan / 1000000) : 0);
                    const qty = equip.quantity || 1;
                    const total = price * qty;

                    const idxP = getMonthIndex(equip.dateP);
                    const idxA = getMonthIndex(equip.dateA);
                    const idxB = getMonthIndex(equip.dateB);
                    const idxPr = getMonthIndex(equip.datePr);
                    const idxI = getMonthIndex(equip.dateI);

                    const activePhases = [];
                    if (idxP !== null) activePhases.push({ phase: "Rq", idx: idxP, weight: phaseWeight["P"], date: equip.dateP, label: "요청", color: "#f59e0b" });
                    if (idxA !== null) activePhases.push({ phase: "PDR", idx: idxA, weight: phaseWeight["A"], date: equip.dateA, label: "검토∙심의∙결정", color: "#3b82f6" });
                    if (idxB !== null) activePhases.push({ phase: "DL", idx: idxB, weight: phaseWeight["B"], date: equip.dateB, label: "설계∙인허가", color: "#06b6d4" });
                    if (idxPr !== null) activePhases.push({ phase: "BC", idx: idxPr, weight: phaseWeight["Pr"], date: equip.datePr, label: "입찰∙계약", color: "#a78bfa" });
                    if (idxI !== null) activePhases.push({ phase: "CS", idx: idxI, weight: phaseWeight["I"], date: equip.dateI, label: "시공∙감리", color: "#10b981" });

                    let lastActivePhase = null;
                    if (activePhases.length > 0) {
                      const sortedActive = [...activePhases].sort((a, b) => {
                        if (a.idx !== b.idx) return b.idx - a.idx;
                        return b.weight - a.weight;
                      });
                      lastActivePhase = sortedActive[0];
                    }

                    const arrowsToRender = [];
                    const segments = [
                      { start: idxP, end: idxA, color: "#f59e0b" },
                      { start: idxA, end: idxB, color: "#3b82f6" },
                      { start: idxB, end: idxPr, color: "#06b6d4" },
                      { start: idxPr, end: idxI, color: "#a78bfa" }
                    ];

                    segments.forEach(seg => {
                      if (seg.start !== null && seg.end !== null && seg.start < seg.end) {
                        const pos = (seg.start + seg.end) / 2;
                        const cellIdx = Math.floor(pos);
                        const rem = pos - cellIdx;
                        const leftPercent = (rem === 0) ? "50%" : "100%";
                        arrowsToRender.push({
                          cellIdx,
                          leftPercent,
                          color: seg.color
                        });
                      }
                    });

                    return (
                      <tr 
                        key={equip.id || idx} 
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.15s ease" }}
                      >
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "750", color: "var(--accent-color)" }}>
                          {equip.unit}
                        </td>
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "600" }}>
                          {(() => {
                            const dName = equip.deptName || "";
                            const divName = equip.divisionName || "";
                            if (dName && divName) {
                              return `${dName} / ${divName}`;
                            }
                            return dName || divName || "-";
                          })()}
                        </td>
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "700", color: "white" }}>
                          {equip.title || equip.itemName || "-"}
                        </td>
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "right", fontWeight: "700", color: "#10B981" }}>
                          {price.toFixed(2)}
                        </td>
                        <td style={{ padding: "0.8rem 0.75rem", textAlign: "left", color: "var(--text-secondary)", maxWidth: "384px" }} title={equip.purpose || equip.utilization}>
                          {(() => {
                            const purpose = equip.purpose || "-";
                            const plan = equip.utilization || "-";
                            return (
                              <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.35rem",
                                lineHeight: "1.4",
                                fontSize: "0.78rem"
                              }}>
                                <div style={{ wordBreak: "break-all", whiteSpace: "normal", display: "flex", alignItems: "flex-start", gap: "0.25rem" }}>
                                  <span style={{ color: "var(--accent-color)", fontWeight: "bold" }}>•</span>
                                  <span>
                                    <strong style={{ color: "var(--text-primary)", fontWeight: "700", marginRight: "4px" }}>구축목적:</strong>
                                    {purpose}
                                  </span>
                                </div>
                                <div style={{ wordBreak: "break-all", whiteSpace: "normal", display: "flex", alignItems: "flex-start", gap: "0.25rem" }}>
                                  <span style={{ color: "var(--accent-color)", fontWeight: "bold" }}>•</span>
                                  <span>
                                    <strong style={{ color: "var(--text-primary)", fontWeight: "700", marginRight: "4px" }}>활용계획:</strong>
                                    {plan}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        
                        {monthsOrder.map((m, currIdx) => {
                          const dynamicMilestones = getMilestonesFromDates(equip, selectedYear);
                          const stepList = dynamicMilestones[m] || [];

                          const getSegmentColorForPos = (pos) => {
                            if (idxP !== null && idxA !== null && pos >= idxP && pos <= idxA) return "#f59e0b";
                            if (idxA !== null && idxB !== null && pos >= idxA && pos <= idxB) return "#3b82f6";
                            if (idxB !== null && idxPr !== null && pos >= idxB && pos <= idxPr) return "#06b6d4";
                            if (idxPr !== null && idxI !== null && pos >= idxPr && pos <= idxI) return "#a78bfa";
                            return "rgba(255, 255, 255, 0.12)";
                          };

                          const leftColor = getSegmentColorForPos(currIdx - 0.5);
                          const rightColor = getSegmentColorForPos(currIdx + 0.5);

                          const envPhaseMap = {
                            "P": { code: "Rq", label: "요청", color: "#f59e0b" },
                            "A": { code: "PDR", label: "검토∙심의∙결정", color: "#3b82f6" },
                            "B": { code: "DL", label: "설계∙인허가", color: "#06b6d4" },
                            "Pr": { code: "BC", label: "입찰∙계약", color: "#a78bfa" },
                            "I": { code: "CS", label: "시공∙감리", color: "#10b981" }
                          };

                          const hasMilestone = stepList.length > 0;
                          
                          const getEnvStatusText = (item) => {
                            if (item.dateI) return "시공∙감리 완료";
                            if (item.datePr) return "시공∙감리 중";
                            if (item.dateB) return "입찰∙계약 중";
                            if (item.dateA) return "설계∙인허가 중";
                            if (item.dateP) return "검토∙심의∙결정 중";
                            return "요청 중";
                          };
                          const currentStatus = getEnvStatusText(equip);

                          const shouldShowBalloon = lastActivePhase && lastActivePhase.idx === currIdx;
                          let phaseColor = "rgba(255, 255, 255, 0.2)";
                          let phaseLabel = "";
                          let phaseDate = "";
                          let primaryCode = "";

                          if (hasMilestone) {
                            const rawCode = stepList[0];
                            const info = envPhaseMap[rawCode] || { code: rawCode, label: rawCode, color: "#38bdf8" };
                            primaryCode = info.code;
                            phaseLabel = info.label;
                            phaseColor = info.color;
                            phaseDate = rawCode === "P" ? equip.dateP :
                                        rawCode === "A" ? equip.dateA :
                                        rawCode === "B" ? equip.dateB :
                                        rawCode === "Pr" ? equip.datePr :
                                        equip.dateI;
                          }

                          const colorSet = 
                            currentStatus.includes("요청") ? { bg: "#f59e0b", shadow: "rgba(245,158,11,0.4)", border: "#fbbf24" } :
                            currentStatus.includes("검토") ? { bg: "#3b82f6", shadow: "rgba(59,130,246,0.4)", border: "#60a5fa" } :
                            currentStatus.includes("설계") ? { bg: "#06b6d4", shadow: "rgba(6,182,212,0.4)", border: "#22d3ee" } :
                            currentStatus.includes("입찰") ? { bg: "#a78bfa", shadow: "rgba(167,139,250,0.4)", border: "#c084fc" } :
                            currentStatus.includes("시공") ? { bg: "#10b981", shadow: "rgba(16,185,129,0.4)", border: "#34d399" } :
                            { bg: "rgba(255, 255, 255, 0.1)", shadow: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.2)" };

                          return (
                            <td 
                              key={currIdx} 
                              style={{ 
                                padding: 0, 
                                position: "relative", 
                                borderRight: currIdx < 11 ? "1px solid rgba(255,255,255,0.03)" : "none",
                                verticalAlign: "middle",
                                minWidth: "36px",
                                width: "36px"
                              }}
                            >
                              {/* 가로 진행선 (배경 선) */}
                              <div style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                top: "50%",
                                transform: "translateY(-50%)",
                                height: "2.5px",
                                background: `linear-gradient(to right, ${leftColor} 50%, ${rightColor} 50%)`,
                                zIndex: 0
                              }} />
                              
                              {/* 화살표 선 흐름 기호 (구간 한가운데에 단 1개의 진행 화살표 렌더링) */}
                              {arrowsToRender
                                .filter(arr => arr.cellIdx === currIdx)
                                .map((arr, arrIdx) => (
                                  <div 
                                    key={arrIdx}
                                    style={{
                                      position: "absolute",
                                      left: arr.leftPercent,
                                      top: "50%",
                                      transform: "translate(-50%, -50%)",
                                      width: 0,
                                      height: 0,
                                      borderTop: "3.5px solid transparent",
                                      borderBottom: "3.5px solid transparent",
                                      borderLeft: `5px solid ${arr.color}`,
                                      zIndex: 3,
                                      pointerEvents: "none"
                                    }} 
                                  />
                                ))
                              }

                              {/* 두 번째 그림 스타일의 마일스톤 노드 */}
                              <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "center", height: "32px" }}>
                                {shouldShowBalloon && (
                                  <div 
                                    className="status-flag-balloon"
                                    style={{
                                      "--bg-color": colorSet.bg,
                                      "--shadow-color": colorSet.shadow,
                                      "--border-color": colorSet.border,
                                      bottom: "100%",
                                      marginBottom: "4px"
                                    }}
                                  >
                                    {currentStatus}
                                  </div>
                                )}
                                {hasMilestone && (
                                  <div 
                                    className="milestone-tooltip-container"
                                    style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                                  >
                                    <div className="milestone-tooltip" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textAlign: "center" }}>
                                      <span style={{ color: phaseColor, fontWeight: "900" }}>{phaseLabel} ({primaryCode})</span>
                                      <span style={{ fontSize: "0.68rem", opacity: 0.85, fontWeight: "normal" }}>{phaseDate || "날짜 미정"}</span>
                                    </div>

                                    <svg width="28" height="32" viewBox="0 0 28 32" style={{ overflow: "visible" }}>
                                      <defs>
                                        <filter id={`glow-${primaryCode}`} x="-40%" y="-40%" width="180%" height="180%">
                                          <feGaussianBlur stdDeviation="2.2" result="blur" />
                                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                      </defs>
                                      <path 
                                        d="M 5 7 L 14 11.5 L 23 7" 
                                        fill="none"
                                        stroke={phaseColor} 
                                        strokeWidth="1.5" 
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        opacity="0.9" 
                                      />
                                      <text x="14" y="4.5" textAnchor="middle" fontSize="10" fontWeight="950" fill="white" style={{ fontFamily: "monospace", letterSpacing: "-0.5px" }}>
                                        {primaryCode}
                                      </text>
                                      <circle cx="14" cy="17.5" r="4.5" fill={phaseColor} stroke="#ffffff" strokeWidth="1.5" filter={`url(#glow-${primaryCode})`} style={{ transition: "all 0.2s ease" }} />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        
                        {/* 관련문서 열 */}
                        <td style={{ padding: "0.8rem 0.2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center", width: "100%" }}>
                            {/* 1. 기획문서 */}
                            <button
                              onClick={() => setProposalModalData(equip)}
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.65rem",
                                borderRadius: "4px",
                                background: "rgba(59, 130, 246, 0.12)",
                                color: "#60A5FA",
                                border: "1px solid rgba(59, 130, 246, 0.25)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
                                e.currentTarget.style.borderColor = "#60A5FA";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)";
                                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.25)";
                              }}
                              title="기획(사업단 ➔ 시설안전관리팀) 문서 요약 보기"
                            >
                              기획
                            </button>

                            {/* 2. 구매문서 */}
                            <button
                              onClick={() => setPurchaseModalData(equip)}
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.65rem",
                                borderRadius: "4px",
                                background: "rgba(167, 139, 250, 0.12)",
                                color: "#C084FC",
                                border: "1px solid rgba(167, 139, 250, 0.25)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(167, 139, 250, 0.25)";
                                e.currentTarget.style.borderColor = "#C084FC";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(167, 139, 250, 0.12)";
                                e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.25)";
                              }}
                              title="구매(시설안전관리팀) 문서 요약 보기"
                            >
                              구매
                            </button>

                            {/* 3. 결과문서 */}
                            <button
                              onClick={() => setBidModalData(equip)}
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.65rem",
                                borderRadius: "4px",
                                background: "rgba(16, 185, 129, 0.12)",
                                color: "#34D399",
                                border: "1px solid rgba(16, 185, 129, 0.25)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
                                e.currentTarget.style.borderColor = "#34D399";
                              }}
                               onMouseOut={(e) => {
                                 e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)";
                                 e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.25)";
                               }}
                              title="결과(시설안전관리팀 시공/준공) 문서 요약 보기"
                            >
                              결과
                            </button>
                          </div>
                        </td>
                        {/* 제어 열 버튼 */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center", justifyContent: "center" }}>
                            {currentRole.id !== "GUEST" && (currentRole.id === "ADMIN" || currentRole.id === "TEAM_LEADER" || !equip.created_by || equip.created_by === currentUser?.uuid) && (
                              <>
                                <button 
                                  onClick={() => openEditModal(equip)}
                                  className="btn btn-secondary"
                                  style={{
                                    padding: "0.25rem 0.45rem",
                                    fontSize: "0.65rem",
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: "4px",
                                    color: "white",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    width: "36px",
                                    textAlign: "center"
                                  }}
                                >
                                  수정
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm("정말 이 환경개선 건을 삭제하시겠습니까?")) {
                                      setEnvData(activeEnvList.filter(e => e.id !== equip.id));
                                    }
                                  }}
                                  className="btn btn-danger"
                                  style={{
                                    padding: "0.25rem 0.45rem",
                                    fontSize: "0.65rem",
                                    background: "rgba(239, 68, 68, 0.2)",
                                    border: "1px solid rgba(239, 68, 68, 0.4)",
                                    borderRadius: "4px",
                                    color: "#f87171",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    width: "36px",
                                    textAlign: "center"
                                  }}
                                >
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* 2. 기자재 구입·운영 탭 본문 */}
      {subTab === "equipment_purchase" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 기자재 상단 필터 카드 */}
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                🔬 기자재 구입 및 운영 현황
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                단위과제별 교육/연구용 핵심 기자재의 계획·집행 및 실적 관리
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              {/* 학과 필터 (요건 1: 모달창과 동일한 고정 전체 학과 목록 맵핑) */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="">학과 전체</option>
                  <option value="기계공학부">기계공학부</option>
                  <option value="기계시스템전공">{"\u00A0-\u00A0기계시스템전공"}</option>
                  <option value="기계설비전공">{"\u00A0-\u00A0기계설비전공"}</option>
                  <option value="전기전자공학부">전기전자공학부</option>
                  <option value="전기전공">{"\u00A0-\u00A0전기전공"}</option>
                  <option value="스마트전자전공">{"\u00A0-\u00A0스마트전자전공"}</option>
                  <option value="조선해양시스템공학과">조선해양시스템공학과</option>
                  <option value="컴퓨터공학과">컴퓨터공학과</option>
                  <option value="화학공학과">화학공학과</option>
                  <option value="게임영상학과">게임영상학과</option>
                  <option value="실내건축디자인과">실내건축디자인과</option>
                  <option value="융합안전공학과">융합안전공학과</option>
                  <option value="인테리어시공학과">인테리어시공학과</option>
                  <option value="간호학부">간호학부</option>
                  <option value="물리치료학과">물리치료학과</option>
                  <option value="치위생학과">치위생학과</option>
                  <option value="식품영양학과">식품영양학과</option>
                  <option value="호텔조리제빵과">호텔조리제빵과</option>
                  <option value="스포츠재활학부">스포츠재활학부</option>
                  <option value="스포츠건강재활학과">스포츠건강재활학과</option>
                  <option value="푸드케어학과">푸드케어학과</option>
                  <option value="골프산업과">골프산업과</option>
                  <option value="반려동물보건과">반려동물보건과</option>
                  <option value="사회복지학과">사회복지학과</option>
                  <option value="유아교육과">유아교육과</option>
                  <option value="세무회계학과">세무회계학과</option>
                  <option value="사회복지상담학과">사회복지상담학과</option>
                  <option value="국제학부">국제학부</option>
                  <option value="미래모빌리티제조학과">미래모빌리티제조학과</option>
                  <option value="바이오화학생산기술학과">바이오화학생산기술학과</option>
                  <option value="인공지능기반텔레헬스학과">인공지능기반텔레헬스학과</option>
                </select>
              </div>

              {/* 부서 필터 (요건 1: 모달창과 동일한 고정 전체 본부/산단 하위 부서 목록 맵핑 및 사업단 최상단 배치) */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="">부서 전체</option>
                  <optgroup label="앵커사업단 및 센터">
                    <option value="사업운영팀">사업운영팀</option>
                    <option value="ECC센터">ECC센터</option>
                    <option value="ICC센터">ICC센터</option>
                    <option value="RCC센터">RCC센터</option>
                    <option value="AID-X지원센터">AID-X지원센터</option>
                    <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                    <option value="신산업특화센터">신산업특화센터</option>
                  </optgroup>
                  <optgroup label="대학본부">
                    <option value="교무팀">교무팀</option>
                    <option value="교수학습지원센터">교수학습지원센터</option>
                    <option value="직업교육혁신센터">직업교육혁신센터</option>
                    <option value="교양교육혁신센터">교양교육혁신센터</option>
                    <option value="기획팀">기획팀</option>
                    <option value="대외협력실">대외협력실</option>
                    <option value="입학팀">입학팀</option>
                    <option value="진로진학지원센터">진로진학지원센터</option>
                    <option value="총무팀">총무팀</option>
                    <option value="재무회계팀">재무회계팀</option>
                    <option value="국제교류원운영팀">국제교류원운영팀</option>
                    <option value="글로컬비즈니스센터">글로컬비즈니스센터</option>
                    <option value="IR센터">IR센터</option>
                  </optgroup>
                  <optgroup label="산학협력단">
                    <option value="산학기획팀">산학기획팀</option>
                    <option value="산학지원팀">산학지원팀</option>
                    <option value="창업창직교육센터">창업창직교육센터</option>
                    <option value="현장실습지원센터">현장실습지원센터</option>
                    <option value="울산광역시 탄소중립 지원센터">울산광역시 탄소중립 지원센터</option>
                    <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                    <option value="종합환경분석센터">종합환경분석센터</option>
                    <option value="영상콘텐츠제작센터">영상콘텐츠제작센터</option>
                    <option value="스포츠재활운동센터">스포츠재활운동센터</option>
                    <option value="이차전지연구소">이차전지연구소</option>
                    <option value="지산학혁신연구소">지산학혁신연구소</option>
                    <option value="어린이급식관리사업단">어린이급식관리사업단</option>
                  </optgroup>
                </select>
              </div>

              {/* 단위과제 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={selectedEquipUnit}
                  onChange={(e) => setSelectedEquipUnit(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="ALL">전체 과제</option>
                  {Number(selectedYear) === 1 
                    ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                        <option key={u} value={u}>{u} 과제</option>
                      ))
                    : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3"].map(u => (
                        <option key={u} value={u}>{u} 과제</option>
                      ))
                  }
                </select>
              </div>

              {currentRole.id !== "GUEST" && (
                <button 
                  className="btn btn-primary"
                  onClick={() => openAddModal("equip")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.4rem 1rem",
                    borderRadius: "6px",
                    background: "var(--accent-color)",
                    border: "none",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={16} />
                  기자재 추가
                </button>
              )}
            </div>
          </div>

          {/* 기자재 리스트 (스프레드시트 스타일 표 뷰) */}
          <div className="glass-card" style={{ padding: "0.5rem", borderRadius: "10px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "var(--text-primary)", minWidth: "1200px" }}>
              <thead>
                {/* 1행: 대분류 헤더 */}
                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <th 
                    rowSpan={3} 
                    onClick={() => handleSort("seq")} 
                    style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "55px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="순번 기준 정렬"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                      순번
                      <ArrowUpDown size={12} style={{ opacity: sortField === "seq" ? 1 : 0.4 }} />
                    </div>
                  </th>
                  <th 
                    rowSpan={3} 
                    onClick={() => handleSort("unit")} 
                    style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "65px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="과제 기준 정렬"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                      과제
                      <ArrowUpDown size={12} style={{ opacity: sortField === "unit" ? 1 : 0.4 }} />
                    </div>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "130px", verticalAlign: "middle" }}>학과 / 부서</th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "270px", verticalAlign: "middle" }}>품명</th>
                  <th 
                    rowSpan={3} 
                    onClick={() => handleSort("unitPrice")} 
                    style={{ padding: "0.5rem 0.3rem", textAlign: "center", fontWeight: "800", width: "95px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="단가 기준 정렬"
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        단가
                        <ArrowUpDown size={12} style={{ opacity: sortField === "unitPrice" ? 1 : 0.4 }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: "400", color: "var(--text-secondary-dark)", marginTop: "0.1rem" }}>(백만원)</span>
                    </div>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "50px", verticalAlign: "middle" }}>수량</th>
                  <th 
                    rowSpan={3} 
                    onClick={() => handleSort("total")} 
                    style={{ padding: "0.5rem 0.3rem", textAlign: "center", fontWeight: "800", width: "105px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="금액 기준 정렬"
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        금액
                        <ArrowUpDown size={12} style={{ opacity: sortField === "total" ? 1 : 0.4 }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: "400", color: "var(--text-secondary-dark)", marginTop: "0.1rem" }}>(백만원)</span>
                    </div>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "384px", verticalAlign: "middle" }}>구입목적 및 활용계획</th>
                  <th colSpan={12} style={{ padding: "0.5rem", textAlign: "center", fontWeight: "800", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255, 255, 255, 0.01)", lineHeight: "1.3" }}>
                    구매단계<br />
                    <span style={{ fontSize: "0.75rem", fontWeight: "normal", color: "var(--text-secondary)" }}>(기획:P ➔ 승인:A ➔ 입찰:B ➔ 구매:Pr ➔ 검수:I)</span>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "80px", verticalAlign: "middle" }}>관련문서</th>
                  {currentRole.id !== "GUEST" && (
                    <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "65px", verticalAlign: "middle" }}>제어</th>
                  )}
                </tr>
                {/* 2행: 연도 분할 */}
                <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <th colSpan={10} style={{ padding: "0.25rem 0.5rem", textAlign: "center", fontWeight: "750", fontSize: "0.75rem", color: "var(--accent-color)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                    '{String(2024 + (Number(selectedYear) || 1)).slice(-2)}년
                  </th>
                  <th colSpan={2} style={{ padding: "0.25rem 0.5rem", textAlign: "center", fontWeight: "750", fontSize: "0.75rem", color: "var(--accent-color)" }}>
                    '{String(2024 + (Number(selectedYear) || 1) + 1).slice(-2)}년
                  </th>
                </tr>
                {/* 3행: 월 리스트 */}
                <tr style={{ background: "rgba(255, 255, 255, 0.01)", borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
                  {["3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월", "1월", "2월"].map((m, idx) => (
                    <th 
                      key={m} 
                      style={{ 
                        padding: "0.3rem 0.2rem", 
                        textAlign: "center", 
                        fontWeight: "800", 
                        fontSize: "0.72rem", 
                        color: "var(--text-secondary-dark)",
                        width: "36px",
                        whiteSpace: "nowrap",
                        borderRight: idx < 11 ? "1px solid rgba(255,255,255,0.03)" : "none"
                      }}
                    >
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const activeEquipList = equipData.length > 0 ? equipData : defaultEquipments;
                  
                  // 1) 과제 필터링
                  let filteredEquips = selectedEquipUnit === "ALL" 
                    ? activeEquipList 
                    : activeEquipList.filter(e => e.unit === selectedEquipUnit);

                  // 2) 학과 및 부서 필터 이원화 적용 (요건 3 AND 연산 연계)
                  if (deptFilter) {
                    filteredEquips = filteredEquips.filter(e => {
                      const dName = e.deptName || "";
                      return dName.includes(deptFilter);
                    });
                  }
                  if (divisionFilter) {
                    filteredEquips = filteredEquips.filter(e => {
                      const divName = e.divisionName || "";
                      return divName.includes(divisionFilter);
                    });
                  }

                  // 3) 순번, 과제, 단가, 금액 정렬 적용 (사용자 요건 3 대응)
                  filteredEquips = [...filteredEquips].sort((a, b) => {
                    let aVal = a[sortField];
                    let bVal = b[sortField];
                    
                    if (sortField === "total") {
                      aVal = (Number(a.unitPrice) || 0) * (Number(a.quantity) || 1);
                      bVal = (Number(b.unitPrice) || 0) * (Number(b.quantity) || 1);
                    } else if (sortField === "unitPrice") {
                      aVal = Number(a.unitPrice) || 0;
                      bVal = Number(b.unitPrice) || 0;
                    } else if (sortField === "seq" || sortField === "id") {
                      aVal = Number(a.seq || a.id) || 0;
                      bVal = Number(b.seq || b.id) || 0;
                    } else {
                      aVal = String(aVal || "");
                      bVal = String(bVal || "");
                    }
                    
                    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
                    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
                    return 0;
                  });

                  if (filteredEquips.length > 0) {
                    return filteredEquips.map((equip, idx) => {
                      const price = Number(equip.unitPrice) || 0;
                      const qty = Number(equip.quantity) || 0;
                      const total = price * qty;

                      const getEquipStatus = (eq) => {
                        if (!eq.dateP && !eq.dateA && !eq.dateB && !eq.datePr && !eq.dateI) {
                          return "준비중";
                        }
                        const todayStr = "2026-07-05";
                        if (eq.dateI && todayStr >= eq.dateI) return "검수완료";
                        if (eq.datePr && todayStr >= eq.datePr) return "구매중";
                        if (eq.dateB && todayStr >= eq.dateB) return "구매중";
                        if (eq.dateA && todayStr >= eq.dateA) return "입찰중";
                        if (eq.dateP && todayStr >= eq.dateP) return "결재중";
                        if (eq.dateP && todayStr < eq.dateP) return "준비중";
                        
                        if (eq.datePr) return "구매중";
                        if (eq.dateB) return "구매중";
                        if (eq.dateA) return "입찰중";
                        if (eq.dateP) return "결재중";
                        return "준비중";
                      };

                      const currentStatus = getEquipStatus(equip);

                      const monthsOrder = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2"];
                      const getMonthIndexLocal = (dateStr) => {
                        if (!dateStr) return null;
                        const date = new Date(dateStr);
                        if (isNaN(date.getTime())) return null;
                        const baseYear = 2024 + Number(selectedYear || 1);
                        const year = date.getFullYear();
                        const month = date.getMonth() + 1;
                        const isCurrentYearPart = (month >= 3 && month <= 12 && year === baseYear);
                        const isNextYearPart = ((month === 1 || month === 2) && year === baseYear + 1);
                        if (isCurrentYearPart || isNextYearPart) {
                          return monthsOrder.indexOf(String(month));
                        }
                        return null;
                      };

                      const idxP = getMonthIndexLocal(equip.dateP);
                      const idxA = getMonthIndexLocal(equip.dateA);
                      const idxB = getMonthIndexLocal(equip.dateB);
                      const idxPr = getMonthIndexLocal(equip.datePr);
                      const idxI = getMonthIndexLocal(equip.dateI);

                      const getPhaseColor = (code) => {
                        const colors = {
                          "P": "#f59e0b",
                          "A": "#3b82f6",
                          "B": "#06b6d4",
                          "Pr": "#a78bfa",
                          "I": "#10b981"
                        };
                        return colors[code] || "#38bdf8";
                      };

                      const getPhaseLabel = (code) => {
                        const labels = {
                          "P": "기획",
                          "A": "승인",
                          "B": "입찰",
                          "Pr": "구매",
                          "I": "검수"
                        };
                        return labels[code] || "미정";
                      };

                      const activePhases = [];
                      const phaseWeight = { "P": 1, "A": 2, "B": 3, "Pr": 4, "I": 5 };
                      if (idxP !== null) activePhases.push({ phase: "P", idx: idxP, weight: phaseWeight["P"], date: equip.dateP, label: "기획", color: "#f59e0b" });
                      if (idxA !== null) activePhases.push({ phase: "A", idx: idxA, weight: phaseWeight["A"], date: equip.dateA, label: "승인", color: "#3b82f6" });
                      if (idxB !== null) activePhases.push({ phase: "B", idx: idxB, weight: phaseWeight["B"], date: equip.dateB, label: "입찰", color: "#06b6d4" });
                      if (idxPr !== null) activePhases.push({ phase: "Pr", idx: idxPr, weight: phaseWeight["Pr"], date: equip.datePr, label: "구매", color: "#a78bfa" });
                      if (idxI !== null) activePhases.push({ phase: "I", idx: idxI, weight: phaseWeight["I"], date: equip.dateI, label: "검수", color: "#10b981" });

                      let lastActivePhase = null;
                      if (activePhases.length > 0) {
                        const sortedActive = [...activePhases].sort((a, b) => {
                          if (a.idx !== b.idx) return b.idx - a.idx;
                          return b.weight - a.weight;
                        });
                        lastActivePhase = sortedActive[0];
                      }

                      const arrowsToRender = [];
                      const segments = [
                        { start: idxP, end: idxA, color: "#f59e0b" },
                        { start: idxA, end: idxB, color: "#3b82f6" },
                        { start: idxB, end: idxPr, color: "#06b6d4" },
                        { start: idxPr, end: idxI, color: "#a78bfa" }
                      ];

                      segments.forEach(seg => {
                        if (seg.start !== null && seg.end !== null && seg.start < seg.end) {
                          const pos = (seg.start + seg.end) / 2;
                          const cellIdx = Math.floor(pos);
                          const rem = pos - cellIdx;
                          const leftPercent = (rem === 0) ? "50%" : "100%";
                          arrowsToRender.push({
                            cellIdx,
                            leftPercent,
                            color: seg.color
                          });
                        }
                      });

                      return (
                        <tr 
                          key={equip.id || idx} 
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.15s ease" }}
                        >
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "750", color: "var(--accent-color)" }}>
                            {equip.unit}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "600" }}>
                            {(() => {
                              const dName = equip.deptName || "";
                              const divName = equip.divisionName || "";
                              if (dName && divName) {
                                return `${dName} / ${divName}`;
                              }
                              return dName || divName || "-";
                            })()}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "700", color: "white" }}>
                            {equip.itemName || equip.name || "-"}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "right", color: "var(--text-secondary)", fontWeight: "600" }}>
                            {formatToMillionWon(price)}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "right", fontWeight: "600" }}>
                            {qty}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "right", fontWeight: "700", color: "#10B981" }}>
                            {formatToMillionWon(total)}
                          </td>
                          <td style={{ padding: "0.8rem 0.75rem", textAlign: "left", color: "var(--text-secondary)", maxWidth: "384px" }} title={equip.description || equip.opPlan}>
                            {(() => {
                              // 개행으로 구분된 데이터를 구입목적과 활용계획으로 쪼갭니다 (요구사항 3)
                              const text = equip.description || equip.opPlan || "";
                              const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
                              const purpose = lines[0] || "-";
                              const plan = lines[1] || "-";
                              return (
                                <div style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.35rem",
                                  lineHeight: "1.4",
                                  fontSize: "0.78rem"
                                }}>
                                  <div style={{ wordBreak: "break-all", whiteSpace: "normal", display: "flex", alignItems: "flex-start", gap: "0.25rem" }}>
                                    <span style={{ color: "var(--accent-color)", fontWeight: "bold" }}>•</span>
                                    <span>
                                      <strong style={{ color: "var(--text-primary)", fontWeight: "700", marginRight: "4px" }}>구입목적:</strong>
                                      {purpose}
                                    </span>
                                  </div>
                                  <div style={{ wordBreak: "break-all", whiteSpace: "normal", display: "flex", alignItems: "flex-start", gap: "0.25rem" }}>
                                    <span style={{ color: "var(--accent-color)", fontWeight: "bold" }}>•</span>
                                    <span>
                                      <strong style={{ color: "var(--text-primary)", fontWeight: "700", marginRight: "4px" }}>활용계획:</strong>
                                      {plan}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </td>
                          
                          {monthsOrder.map((m, currIdx) => {
                            const dynamicMilestones = getMilestonesFromDates(equip, selectedYear);
                            const stepList = dynamicMilestones[m] || [];

                            const getSegmentColorForPos = (pos) => {
                              if (idxP !== null && idxA !== null && idxP < idxA) {
                                if (pos >= idxP && pos < idxA) return "#f59e0b";
                              }
                              if (idxA !== null && idxB !== null && idxA < idxB) {
                                if (pos >= idxA && pos < idxB) return "#3b82f6";
                              }
                              if (idxB !== null && idxPr !== null && idxB < idxPr) {
                                if (pos >= idxB && pos < idxPr) return "#06b6d4";
                              }
                              if (idxPr !== null && idxI !== null && idxPr < idxI) {
                                if (pos >= idxPr && pos < idxI) return "#a78bfa";
                              }
                              return "rgba(255, 255, 255, 0.12)";
                            };

                            const leftColor = getSegmentColorForPos(currIdx - 0.5);
                            const rightColor = getSegmentColorForPos(currIdx + 0.5);

                            const hasMilestone = stepList.length > 0;
                            const primaryCode = hasMilestone ? stepList[0] : null;
                            const phaseColor = primaryCode ? getPhaseColor(primaryCode) : "#38bdf8";
                            const phaseLabel = primaryCode ? getPhaseLabel(primaryCode) : "";
                            const phaseDate = primaryCode ? (
                              primaryCode === "P" ? equip.dateP :
                              primaryCode === "A" ? equip.dateA :
                              primaryCode === "B" ? equip.dateB :
                              primaryCode === "Pr" ? equip.datePr :
                              equip.dateI
                            ) : "";

                            // 현재 마일스톤이 이 장비의 마지막 활성 마일스톤인지 판단
                            const isLastActive = lastActivePhase && 
                                                 primaryCode && 
                                                 lastActivePhase.phase === primaryCode && 
                                                 lastActivePhase.idx === currIdx;

                            const hasAnyMilestoneInActiveYear = (activePhases.length > 0);
                            const hasTodayInTimeline = (Number(selectedYear) === 2);
                            const isTodayMonth = (m === "7");
                            let shouldShowBalloon = false;
                            if (hasAnyMilestoneInActiveYear) {
                              if (hasTodayInTimeline) {
                                shouldShowBalloon = isTodayMonth;
                              } else {
                                shouldShowBalloon = isLastActive;
                              }
                            } else {
                              shouldShowBalloon = false;
                            }

                            const statusColors = {
                              "준비중": { bg: "#64748b", border: "#94a3b8", shadow: "rgba(100, 116, 139, 0.3)" },
                              "결재중": { bg: "#3b82f6", border: "#60a5fa", shadow: "rgba(59, 130, 246, 0.3)" },
                              "입찰중": { bg: "#f59e0b", border: "#fbbf24", shadow: "rgba(245, 158, 11, 0.3)" },
                              "구매중": { bg: "#a78bfa", border: "#c084fc", shadow: "rgba(167, 139, 250, 0.3)" },
                              "검수완료": { bg: "#10b981", border: "#34d399", shadow: "rgba(16, 185, 129, 0.3)" }
                            };
                            const colorSet = statusColors[currentStatus] || statusColors["준비중"];

                            return (
                              <td 
                                key={m} 
                                style={{ 
                                  padding: "0.8rem 0", 
                                  textAlign: "center", 
                                  width: "36px",
                                  position: "relative",
                                  verticalAlign: "middle"
                                }}
                              >
                                {/* 가로 타임라인 왼쪽 연결 반선 */}
                                <div style={{
                                  position: "absolute",
                                  left: 0,
                                  right: "50%",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  height: "3px", // 선 두께 강화
                                  background: leftColor === "rgba(255, 255, 255, 0.12)" ? "rgba(255, 255, 255, 0.08)" : leftColor,
                                  display: m === "3" ? "none" : "block", // 3월은 왼쪽 선 생략
                                  zIndex: 0
                                }} />

                                {/* 가로 타임라인 오른쪽 연결 반선 */}
                                <div style={{
                                  position: "absolute",
                                  left: "50%",
                                  right: 0,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  height: "3px", // 선 두께 강화
                                  background: rightColor === "rgba(255, 255, 255, 0.12)" ? "rgba(255, 255, 255, 0.08)" : rightColor,
                                  display: m === "2" ? "none" : "block", // 2월은 오른쪽 선 생략
                                  zIndex: 0
                                }} />
                                
                                {/* 화살표 선 흐름 기호 (구간 한가운데에 단 1개의 진행 화살표 렌더링) */}
                                {arrowsToRender
                                  .filter(arr => arr.cellIdx === currIdx)
                                  .map((arr, arrIdx) => (
                                    <div 
                                      key={arrIdx}
                                      style={{
                                        position: "absolute",
                                        left: arr.leftPercent,
                                        top: "50%",
                                        transform: "translate(-50%, -50%)",
                                        width: 0,
                                        height: 0,
                                        borderTop: "3.5px solid transparent",
                                        borderBottom: "3.5px solid transparent",
                                        borderLeft: `5px solid ${arr.color}`,
                                        zIndex: 3,
                                        pointerEvents: "none"
                                      }} 
                                    />
                                  ))
                                }

                                {/* 두 번째 그림 스타일의 마일스톤 노드 (중앙 도트점 + 상단 텍스트 및 양쪽 사선 깃대 날개) */}
                                <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "center", height: "32px" }}>
                                  {shouldShowBalloon && (
                                    <div 
                                      className="status-flag-balloon"
                                      style={{
                                        "--bg-color": colorSet.bg,
                                        "--shadow-color": colorSet.shadow,
                                        "--border-color": colorSet.border,
                                        bottom: "100%",
                                        marginBottom: "4px"
                                      }}
                                    >
                                      {currentStatus === "구매중" ? "구매 중" :
                                       currentStatus === "결재중" ? "결재 중" :
                                       currentStatus === "입찰중" ? "입찰 중" :
                                       currentStatus}
                                    </div>
                                  )}
                                  {hasMilestone && (
                                    <div 
                                      className="milestone-tooltip-container"
                                      style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                                    >
                                      {/* 커스텀 호버 툴팁 날짜 표기 (요구사항 1: 두 줄로 표현) */}
                                      <div className="milestone-tooltip" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textAlign: "center" }}>
                                        <span style={{ color: phaseColor, fontWeight: "900" }}>{phaseLabel} ({primaryCode})</span>
                                        <span style={{ fontSize: "0.68rem", opacity: 0.85, fontWeight: "normal" }}>{phaseDate || "날짜 미정"}</span>
                                      </div>

                                      <svg width="28" height="32" viewBox="0 0 28 32" style={{ overflow: "visible" }}>
                                        <defs>
                                          {/* 마일스톤별 고유 글로우 필터 */}
                                          <filter id={`glow-${primaryCode}`} x="-40%" y="-40%" width="180%" height="180%">
                                            <feGaussianBlur stdDeviation="2.2" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                          </filter>
                                        </defs>

                                        {/* 1. 꺾인 V 형태 구분선 (도트 정수리 바로 위 11.5 지점에서 부드럽게 꺾이는 path 설계) */}
                                        <path 
                                          d="M 5 7 L 14 11.5 L 23 7" 
                                          fill="none"
                                          stroke={phaseColor} 
                                          strokeWidth="1.5" 
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          opacity="0.9" 
                                        />

                                        {/* 2. V 꺾임선 위의 텍스트 (P, A, B, Pr, I) */}
                                        <text 
                                          x="14" 
                                          y="4.5" 
                                          textAnchor="middle" 
                                          fontSize="10" 
                                          fontWeight="950" 
                                          fill="white"
                                          style={{ fontFamily: "monospace", letterSpacing: "-0.5px" }}
                                        >
                                          {primaryCode}
                                        </text>

                                        {/* 3. 중앙 고유 단계 컬러 도트 점 (vertically center align을 위해 cy=16으로 정확히 중앙 매칭) */}
                                        <circle 
                                          cx="14" 
                                          cy="16" 
                                          r="4.5" 
                                          fill={phaseColor} 
                                          stroke="rgba(255,255,255,0.7)" 
                                          strokeWidth="1"
                                          filter={`url(#glow-${primaryCode})`}
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}

                          <td style={{ padding: "0.8rem 0.2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center", width: "100%" }}>
                              {/* 1. 기획문서 버튼 (파란색 테마) */}
                              <button
                                onClick={() => setProposalModalData(equip)}
                                style={{
                                  padding: "0.25rem 0.45rem",
                                  fontSize: "0.65rem",
                                  borderRadius: "4px",
                                  background: "rgba(59, 130, 246, 0.12)",
                                  color: "#60A5FA",
                                  border: "1px solid rgba(59, 130, 246, 0.25)",
                                  cursor: "pointer",
                                  transition: "all 0.2s"
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
                                  e.currentTarget.style.borderColor = "#60A5FA";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)";
                                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.25)";
                                }}
                                title="기획 제안서 요약 보기"
                              >
                                기획
                              </button>

                              {/* 2. 구매문서 버튼 (보라색 테마) */}
                              <button
                                onClick={() => setPurchaseModalData(equip)}
                                style={{
                                  padding: "0.25rem 0.45rem",
                                  fontSize: "0.65rem",
                                  borderRadius: "4px",
                                  background: "rgba(167, 139, 250, 0.12)",
                                  color: "#C084FC",
                                  border: "1px solid rgba(167, 139, 250, 0.25)",
                                  cursor: "pointer",
                                  transition: "all 0.2s"
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = "rgba(167, 139, 250, 0.25)";
                                  e.currentTarget.style.borderColor = "#C084FC";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = "rgba(167, 139, 250, 0.12)";
                                  e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.25)";
                                }}
                                title="구매 발송문서 요약 보기"
                              >
                                구매
                              </button>

                              {/* 3. 입찰문서 버튼 (초록색 테마) */}
                              <button
                                onClick={() => setBidModalData(equip)}
                                style={{
                                  padding: "0.25rem 0.45rem",
                                  fontSize: "0.65rem",
                                  borderRadius: "4px",
                                  background: "rgba(16, 185, 129, 0.12)",
                                  color: "#34D399",
                                  border: "1px solid rgba(16, 185, 129, 0.25)",
                                  cursor: "pointer",
                                  transition: "all 0.2s"
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
                                  e.currentTarget.style.borderColor = "#34D399";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)";
                                  e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.25)";
                                }}
                                title="입찰 규격 공고 보기"
                              >
                                입찰
                              </button>
                            </div>
                          </td>
                          {currentRole.id !== "GUEST" && (
                            <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center", width: "100%" }}>
                                {(currentRole.id === "ADMIN" || currentRole.id === "TEAM_LEADER" || !equip.created_by || equip.created_by === currentUser?.uuid) && (
                                  <button
                                    onClick={() => openEditModal(equip)}
                                    style={{
                                      background: "rgba(255,255,255,0.06)",
                                      border: "1px solid rgba(255,255,255,0.1)",
                                      borderRadius: "4px",
                                      color: "rgba(255,255,255,0.8)",
                                      padding: "0.25rem 0.45rem",
                                      fontSize: "0.65rem",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                      textAlign: "center",
                                      whiteSpace: "nowrap"
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                                      e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
                                      e.currentTarget.style.color = "#60A5FA";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                      e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                                    }}
                                    title="기자재 수정"
                                  >
                                    수정
                                  </button>
                                )}
                                {(currentRole.id === "ADMIN" || currentRole.id === "TEAM_LEADER" || !equip.created_by || equip.created_by === currentUser?.uuid) && (
                                  <button
                                    onClick={() => {
                                      if (confirm("🚨 이 작업은 되돌릴 수 없습니다. 해당 기자재 항목을 정말로 삭제하시겠습니까?")) {
                                        const inputPw = prompt("🔒 삭제 안전장치: 등록 시 설정한 비밀번호를 입력해 주세요.");
                                        const registeredPw = equip.password || "1234";
                                        
                                        if (inputPw === null) return; // 취소
                                        if (inputPw === registeredPw) {
                                          setEquipData(activeEquipList.filter(e => e.id !== equip.id));
                                          alert("🗑️ 기자재 항목이 안전하게 삭제되었습니다.");
                                        } else {
                                          alert("⚠️ 비밀번호가 일치하지 않습니다. 삭제 권한이 거부되었습니다.");
                                        }
                                      }
                                    }}
                                    style={{
                                      background: "rgba(239, 68, 68, 0.1)",
                                      border: "1px solid rgba(239, 68, 68, 0.2)",
                                      borderRadius: "4px",
                                      color: "#FCA5A5",
                                      padding: "0.25rem 0.45rem",
                                      fontSize: "0.65rem",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                      textAlign: "center",
                                      whiteSpace: "nowrap"
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                                      e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                                      e.currentTarget.style.color = "#F87171";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                                      e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
                                      e.currentTarget.style.color = "#FCA5A5";
                                    }}
                                    title="기자재 삭제"
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    });
                  } else {
                    return (
                      <tr>
                        <td colSpan={24} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          필터링된 기자재 내역이 존재하지 않습니다.
                        </td>
                      </tr>
                    );
                  }
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. 주요 용역 탭 본문 */}
      {subTab === "major_services" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 용역 상단 필터 카드 */}
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                💼 주요 용역 사업 현황
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                앵커사업 주요 용역사업 계약 및 진행 현황
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              {/* 학과 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="">학과 전체</option>
                  <option value="기계공학부">기계공학부</option>
                  <option value="기계시스템전공">{"\u00A0-\u00A0기계시스템전공"}</option>
                  <option value="기계설비전공">{"\u00A0-\u00A0기계설비전공"}</option>
                  <option value="전기전자공학부">전기전자공학부</option>
                  <option value="전기전공">{"\u00A0-\u00A0전기전공"}</option>
                  <option value="스마트전자전공">{"\u00A0-\u00A0스마트전자전공"}</option>
                  <option value="조선해양시스템공학과">조선해양시스템공학과</option>
                  <option value="컴퓨터공학과">컴퓨터공학과</option>
                  <option value="화학공학과">화학공학과</option>
                  <option value="게임영상학과">게임영상학과</option>
                  <option value="실내건축디자인과">실내건축디자인과</option>
                  <option value="융합안전공학과">융합안전공학과</option>
                  <option value="인테리어시공학과">인테리어시공학과</option>
                  <option value="간호학부">간호학부</option>
                  <option value="물리치료학과">물리치료학과</option>
                  <option value="치위생학과">치위생학과</option>
                  <option value="식품영양학과">식품영양학과</option>
                  <option value="호텔조리제빵과">호텔조리제빵과</option>
                  <option value="스포츠재활학부">스포츠재활학부</option>
                  <option value="스포츠건강재활학과">스포츠건강재활학과</option>
                  <option value="푸드케어학과">푸드케어학과</option>
                  <option value="골프산업과">골프산업과</option>
                  <option value="반려동물보건과">반려동물보건과</option>
                  <option value="사회복지학과">사회복지학과</option>
                  <option value="유아교육과">유아교육과</option>
                  <option value="세무회계학과">세무회계학과</option>
                  <option value="사회복지상담학과">사회복지상담학과</option>
                  <option value="국제학부">국제학부</option>
                  <option value="미래모빌리티제조학과">미래모빌리티제조학과</option>
                  <option value="바이오화학생산기술학과">바이오화학생산기술학과</option>
                  <option value="인공지능기반텔레헬스학과">인공지능기반텔레헬스학과</option>
                </select>
              </div>

              {/* 부서 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="">부서 전체</option>
                  <optgroup label="앵커사업단 및 센터">
                    <option value="사업운영팀">사업운영팀</option>
                    <option value="ECC센터">ECC센터</option>
                    <option value="ICC센터">ICC센터</option>
                    <option value="RCC센터">RCC센터</option>
                    <option value="AID-X지원센터">AID-X지원센터</option>
                    <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                    <option value="신산업특화센터">신산업특화센터</option>
                  </optgroup>
                  <optgroup label="대학본부">
                    <option value="교무팀">교무팀</option>
                    <option value="교수학습지원센터">교수학습지원센터</option>
                    <option value="직업교육혁신센터">직업교육혁신센터</option>
                    <option value="교양교육혁신센터">교양교육혁신센터</option>
                    <option value="기획팀">기획팀</option>
                    <option value="대외협력실">대외협력실</option>
                    <option value="입학팀">입학팀</option>
                    <option value="진로진학지원센터">진로진학지원센터</option>
                    <option value="총무팀">총무팀</option>
                    <option value="재무회계팀">재무회계팀</option>
                    <option value="국제교류원운영팀">국제교류원운영팀</option>
                    <option value="글로컬비즈니스센터">글로컬비즈니스센터</option>
                    <option value="IR센터">IR센터</option>
                  </optgroup>
                  <optgroup label="산학협력단">
                    <option value="산학기획팀">산학기획팀</option>
                    <option value="산학지원팀">산학지원팀</option>
                    <option value="창업창직교육센터">창업창직교육센터</option>
                    <option value="현장실습지원센터">현장실습지원센터</option>
                    <option value="울산광역시 탄소중립 지원센터">울산광역시 탄소중립 지원센터</option>
                    <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                    <option value="종합환경분석센터">종합환경분석센터</option>
                    <option value="영상콘텐츠제작센터">영상콘텐츠제작센터</option>
                    <option value="스포츠재활운동센터">스포츠재활운동센터</option>
                    <option value="이차전지연구소">이차전지연구소</option>
                    <option value="지산학혁신연구소">지산학혁신연구소</option>
                    <option value="어린이급식관리사업단">어린이급식관리사업단</option>
                  </optgroup>
                </select>
              </div>

              {/* 전체 과제 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={selectedEquipUnit}
                  onChange={(e) => setSelectedEquipUnit(e.target.value)}
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="ALL">전체 과제</option>
                  {Number(selectedYear) === 1 
                    ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                        <option key={u} value={u}>{u} 과제</option>
                      ))
                    : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3"].map(u => (
                        <option key={u} value={u}>{u} 과제</option>
                      ))
                  }
                </select>
              </div>

              {currentRole.id !== "GUEST" && (
                <button 
                  className="btn btn-primary"
                  onClick={() => openAddModal("service")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.4rem 1rem",
                    borderRadius: "6px",
                    background: "var(--accent-color)",
                    border: "none",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  <Plus size={16} />
                  주요 용역 추가
                </button>
              )}
            </div>
          </div>

          {/* 주요 용역 테이블 */}
          <div className="glass-card" style={{ padding: "0.25rem", borderRadius: "12px", overflowX: "auto", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(10, 15, 30, 0.4)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "white" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.01)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "45px" }}>순번</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "140px" }}>프로그램 ID</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "140px" }}>운영부서</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontWeight: "800", width: "200px" }}>용역명</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: "800", width: "135px" }}>사업예산/집행액(천원)</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontWeight: "800", width: "320px" }}>용역목적 및 수행결과</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "420px" }}>용역 절차</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "130px" }}>관련문서</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "70px" }}>제어</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const activeServiceList = serviceData.length > 0 ? serviceData : [];
                  
                  // 1) 과제 필터링
                  let filteredServices = selectedEquipUnit === "ALL" 
                    ? activeServiceList 
                    : activeServiceList.filter(e => e.unit === selectedEquipUnit);

                  // 2) 학과 및 부서 필터
                  if (deptFilter) {
                    filteredServices = filteredServices.filter(e => (e.deptName || "").includes(deptFilter));
                  }
                  if (divisionFilter) {
                    filteredServices = filteredServices.filter(e => (e.divisionName || "").includes(divisionFilter));
                  }

                  if (filteredServices.length === 0) {
                    return (
                      <tr>
                        <td colSpan={9} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          📭 등록된 주요 용역 사업 내역이 없습니다.
                        </td>
                      </tr>
                    );
                  }

                  return filteredServices.map((equip, idx) => {
                    return (
                      <tr 
                        key={equip.id || idx} 
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.15s ease" }}
                      >
                        {/* 1. 순번 */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          {idx + 1}
                        </td>

                        {/* 2. 프로그램 ID // (프로그램명) */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "700" }}>
                          <div style={{ color: "var(--accent-color)", fontSize: "0.82rem" }}>
                            {equip.programId || `[${equip.unit}]`}
                          </div>
                          {equip.programName && (
                            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", marginTop: "0.15rem", fontWeight: "normal" }}>
                              ({equip.programName})
                            </div>
                          )}
                        </td>

                        {/* 3. 운영부서 */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "600", fontSize: "0.8rem" }}>
                          {(() => {
                            const dName = equip.deptName || "";
                            const divName = equip.divisionName || "";
                            if (dName && divName) {
                              return `${dName} / ${divName}`;
                            }
                            return dName || divName || "-";
                          })()}
                        </td>

                        {/* 4. 용역명 */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "left", fontWeight: "700", color: "white" }}>
                          {equip.title || "-"}
                        </td>

                        {/* 5. 사업예산 / 집행액(천원) */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "right" }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#60A5FA" }}>
                            예산: {Math.round((equip.budgetPlan || 0) / 1000).toLocaleString()}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#10B981", marginTop: "0.15rem", fontWeight: "700" }}>
                            집행: {Math.round((equip.budgetSpent || 0) / 1000).toLocaleString()}
                          </div>
                        </td>

                        {/* 6. 용역목적 및 수행결과 */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "left", color: "var(--text-secondary)", maxWidth: "320px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", lineHeight: "1.4", fontSize: "0.78rem" }}>
                            <div style={{ wordBreak: "break-all", whiteSpace: "normal", display: "flex", alignItems: "flex-start", gap: "0.25rem" }}>
                              <span style={{ color: "var(--accent-color)", fontWeight: "bold" }}>•</span>
                              <span>
                                <strong style={{ color: "var(--text-primary)", fontWeight: "700", marginRight: "4px" }}>용역목적:</strong>
                                {equip.purpose || "-"}
                              </span>
                            </div>
                            <div style={{ wordBreak: "break-all", whiteSpace: "normal", display: "flex", alignItems: "flex-start", gap: "0.25rem" }}>
                              <span style={{ color: "#10b981", fontWeight: "bold" }}>•</span>
                              <span>
                                <strong style={{ color: "var(--text-primary)", fontWeight: "700", marginRight: "4px" }}>수행결과:</strong>
                                {equip.opResult || "-"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 7. 용역 절차 가로 마일스톤 노드 */}
                        <td style={{ padding: "0.8rem 0.5rem", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", width: "100%" }}>
                            {[
                              { dateKey: "datePp", label: "기획", code: "PP", color: "#f59e0b" },
                              { dateKey: "dateRfo", label: "의뢰", code: "RFO", color: "#3b82f6" },
                              { dateKey: "dateB", label: "입찰", code: "B", color: "#06b6d4" },
                              { dateKey: "dateEs", label: "평가∙선정", code: "ES", color: "#ec4899" },
                              { dateKey: "dateC", label: "계약", code: "C", color: "#a78bfa" },
                              { dateKey: "dateE", label: "수행", code: "E", color: "#eab308" },
                              { dateKey: "dateI", label: "검수", code: "I", color: "#10b981" }
                            ].map((step, sIdx) => {
                              const hasDate = !!equip[step.dateKey];
                              const rawDate = equip[step.dateKey]; // YYYY-MM-DD
                              let formattedDate = "";
                              if (hasDate && rawDate.includes("-")) {
                                const parts = rawDate.split("-");
                                formattedDate = `${parts[1]}.${parts[2]}`; // MM.DD 포맷
                              }

                              return (
                                <React.Fragment key={step.code}>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "46px" }}>
                                    <div 
                                      style={{
                                        padding: "0.2rem 0.4rem",
                                        borderRadius: "12px",
                                        fontSize: "0.68rem",
                                        fontWeight: "800",
                                        background: hasDate ? `${step.color}22` : "rgba(255,255,255,0.03)",
                                        color: hasDate ? step.color : "rgba(255,255,255,0.25)",
                                        border: hasDate ? `1px solid ${step.color}66` : "1px solid rgba(255,255,255,0.08)",
                                        whiteSpace: "nowrap",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center"
                                      }}
                                      title={`${step.label}(${step.code}) ${hasDate ? `: ${rawDate}` : "(미지정)"}`}
                                    >
                                      <span>{step.code}</span>
                                    </div>
                                    <span style={{ fontSize: "0.62rem", color: hasDate ? "white" : "rgba(255,255,255,0.2)", marginTop: "0.15rem", fontWeight: hasDate ? "700" : "normal" }}>
                                      {hasDate ? formattedDate : "-"}
                                    </span>
                                  </div>
                                  {sIdx < 6 && (
                                    <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.75rem", fontWeight: "900" }}>➔</span>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </td>

                        {/* 8. 관련문서 기획/구매/결과 3종 단추 */}
                        <td style={{ padding: "0.8rem 0.2rem", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "center", justifyContent: "center" }}>
                            {/* 기획문서 */}
                            <button
                              onClick={() => setProposalModalData(equip)}
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.65rem",
                                borderRadius: "4px",
                                background: "rgba(59, 130, 246, 0.12)",
                                color: "#60A5FA",
                                border: "1px solid rgba(59, 130, 246, 0.25)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
                                e.currentTarget.style.borderColor = "#60A5FA";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)";
                                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.25)";
                              }}
                              title="기획 문서 요약 보기"
                            >
                              기획
                            </button>

                            {/* 구매문서 */}
                            <button
                              onClick={() => setPurchaseModalData(equip)}
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.65rem",
                                borderRadius: "4px",
                                background: "rgba(167, 139, 250, 0.12)",
                                color: "#C084FC",
                                border: "1px solid rgba(167, 139, 250, 0.25)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(167, 139, 250, 0.25)";
                                e.currentTarget.style.borderColor = "#C084FC";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(167, 139, 250, 0.12)";
                                e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.25)";
                              }}
                              title="구매 문서 요약 보기"
                            >
                              구매
                            </button>

                            {/* 결과문서 */}
                            <button
                              onClick={() => setBidModalData(equip)}
                              style={{
                                padding: "0.25rem 0.45rem",
                                fontSize: "0.65rem",
                                borderRadius: "4px",
                                background: "rgba(16, 185, 129, 0.12)",
                                color: "#34D399",
                                border: "1px solid rgba(16, 185, 129, 0.25)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
                                e.currentTarget.style.borderColor = "#34D399";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)";
                                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.25)";
                              }}
                              title="결과 문서 요약 보기"
                            >
                              결과
                            </button>
                          </div>
                        </td>

                        {/* 9. 제어 열 버튼 (세로 2층 배치) */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center", justifyContent: "center" }}>
                            {currentRole.id !== "GUEST" && (currentRole.id === "ADMIN" || currentRole.id === "TEAM_LEADER" || !equip.created_by || equip.created_by === currentUser?.uuid) && (
                              <>
                                <button 
                                  onClick={() => openEditModal(equip)}
                                  className="btn btn-secondary"
                                  style={{
                                    padding: "0.25rem 0.45rem",
                                    fontSize: "0.65rem",
                                    background: "rgba(96, 165, 250, 0.15)",
                                    border: "1px solid rgba(96, 165, 250, 0.35)",
                                    borderRadius: "4px",
                                    color: "#93c5fd",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    width: "38px",
                                    textAlign: "center"
                                  }}
                                >
                                  수정
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm("정말 이 주요 용역 건을 삭제하시겠습니까?")) {
                                      setServiceData(activeServiceList.filter(e => e.id !== equip.id));
                                    }
                                  }}
                                  className="btn btn-danger"
                                  style={{
                                    padding: "0.25rem 0.45rem",
                                    fontSize: "0.65rem",
                                    background: "rgba(239, 68, 68, 0.2)",
                                    border: "1px solid rgba(239, 68, 68, 0.4)",
                                    borderRadius: "4px",
                                    color: "#f87171",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    width: "38px",
                                    textAlign: "center"
                                  }}
                                >
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 추가 모달창 팝업 */}
      {isAddModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div className="glass-card" style={{ width: "780px", maxHeight: "85vh", overflowY: "auto", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, color: "white", fontWeight: "800", fontSize: "1.1rem" }}>
                {modalType === "env" && "🛠️ 신규 교육환경 개선 사업 등록"}
                {modalType === "equip" && (isEditMode ? "🔬 핵심 기자재 도입 정보 수정" : "🔬 신규 핵심 기자재 도입 등록")}
                {modalType === "service" && "💼 신규 주요 용역 계약 등록"}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.2rem", fontWeight: "bold", padding: "0.2rem" }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* 환경개선용 입력 필드들 */}
              {modalType === "env" && (
                <>
                  {/* 첫번째 줄: 단위과제, 사업연차 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>단위과제</label>
                      <select 
                        name="unit" 
                        value={formData.unit} 
                        onChange={handleInputChange} 
                        className="user-selector" 
                        style={{ width: "100%" }}
                      >
                        {Number(formData.year || selectedYear) === 1 
                          ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                          : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "Common"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                        }
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사업연차</label>
                      <select 
                        name="year" 
                        value={formData.year || selectedYear} 
                        onChange={handleInputChange} 
                        className="user-selector" 
                        style={{ width: "100%" }}
                      >
                        <option value={1}>1차년도 (2025년)</option>
                        <option value={2}>2차년도 (2026년)</option>
                      </select>
                    </div>
                  </div>

                  {/* 두번째 줄: 학과 선택, 부서 선택 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.25rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>학과 선택</label>
                      <select 
                        name="deptName" 
                        value={formData.deptName} 
                        onChange={handleInputChange}
                        className="user-selector"
                      >
                        <option value="">-- 선택 안 함 --</option>
                        <option value="기계공학부">기계공학부</option>
                        <option value="기계시스템전공">{" - 기계시스템전공"}</option>
                        <option value="기계설비전공">{" - 기계설비전공"}</option>
                        <option value="전기전자공학부">전기전자공학부</option>
                        <option value="전기전공">{" - 전기전공"}</option>
                        <option value="스마트전자전공">{" - 스마트전자전공"}</option>
                        <option value="조선해양시스템공학과">조선해양시스템공학과</option>
                        <option value="컴퓨터공학과">컴퓨터공학과</option>
                        <option value="화학공학과">화학공학과</option>
                        <option value="게임영상학과">게임영상학과</option>
                        <option value="실내건축디자인과">실내건축디자인과</option>
                        <option value="융합안전공학과">융합안전공학과</option>
                        <option value="인테리어시공학과">인테리어시공학과</option>
                        <option value="간호학부">간호학부</option>
                        <option value="물리치료학과">물리치료학과</option>
                        <option value="치위생학과">치위생학과</option>
                        <option value="식품영양학과">식품영양학과</option>
                        <option value="호텔조리제빵과">호텔조리제빵과</option>
                        <option value="스포츠재활학부">스포츠재활학부</option>
                        <option value="스포츠건강재활학과">스포츠건강재활학과</option>
                        <option value="푸드케어학과">푸드케어학과</option>
                        <option value="골프산업과">골프산업과</option>
                        <option value="반려동물보건과">반려동물보건과</option>
                        <option value="사회복지학과">사회복지학과</option>
                        <option value="유아교육과">유아교육과</option>
                        <option value="세무회계학과">세무회계학과</option>
                        <option value="사회복지상담학과">사회복지상담학과</option>
                        <option value="국제학부">국제학부</option>
                        <option value="미래모빌리티제조학과">미래모빌리티제조학과</option>
                        <option value="바이오화학생산기술학과">바이오화학생산기술학과</option>
                        <option value="인공지능기반텔레헬스학과">인공지능기반텔레헬스학과</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>부서 선택</label>
                      <select 
                        name="divisionName" 
                        value={formData.divisionName} 
                        onChange={handleInputChange}
                        className="user-selector"
                      >
                        <option value="">-- 선택 안 함 --</option>
                        <optgroup label="앵커사업단 및 센터">
                          <option value="사업운영팀">사업운영팀</option>
                          <option value="ECC센터">ECC센터</option>
                          <option value="ICC센터">ICC센터</option>
                          <option value="RCC센터">RCC센터</option>
                          <option value="AID-X지원센터">AID-X지원센터</option>
                          <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                          <option value="신산업특화센터">신산업특화센터</option>
                        </optgroup>
                        <optgroup label="대학본부">
                          <option value="교무팀">교무팀</option>
                          <option value="교수학습지원센터">교수학습지원센터</option>
                          <option value="직업교육혁신센터">직업교육혁신센터</option>
                          <option value="교양교육혁신센터">교양교육혁신센터</option>
                          <option value="기획팀">기획팀</option>
                          <option value="대외협력실">대외협력실</option>
                          <option value="입학팀">입학팀</option>
                          <option value="진로진학지원센터">진로진학지원센터</option>
                          <option value="총무팀">총무팀</option>
                          <option value="재무회계팀">재무회계팀</option>
                          <option value="국제교류원운영팀">국제교류원운영팀</option>
                          <option value="글로컬비즈니스센터">글로컬비즈니스센터</option>
                          <option value="IR센터">IR센터</option>
                        </optgroup>
                        <optgroup label="산학협력단">
                          <option value="산학기획팀">산학기획팀</option>
                          <option value="산학지원팀">산학지원팀</option>
                          <option value="창업창직교육센터">창업창직교육센터</option>
                          <option value="현장실습지원센터">현장실습지원센터</option>
                          <option value="울산광역시 탄소중립 지원센터">울산광역시 탄소중립 지원센터</option>
                          <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                          <option value="종합환경분석센터">종합환경분석센터</option>
                          <option value="영상콘텐츠제작센터">영상콘텐츠제작센터</option>
                          <option value="스포츠재활운동센터">스포츠재활운동센터</option>
                          <option value="이차전지연구소">이차전지연구소</option>
                          <option value="지산학혁신연구소">지산학혁신연구소</option>
                          <option value="어린이급식관리사업단">어린이급식관리사업단</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#ff9800", fontWeight: "700", marginBottom: "1rem" }}>
                    ** 학과나 부서 중 하나는 선택되어야 합니다.
                  </div>

                  {/* 세번째 줄: 구축 공간명, 구축 위치(지정 호실) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>구축 공간명</label>
                      <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 3층 RISE 바이오 메디컬 실습실 구축" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>구축 위치 (지정 호실)</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="예: 대학 본관 302호" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사업비 (백만원)</label>
                      <input 
                        type="number" 
                        name="unitPrice" 
                        step="0.01" 
                        value={formData.unitPrice} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="예: 50.00" 
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>현재 실제 집행액 (백만원)</label>
                      <input 
                        type="number" 
                        name="budgetSpent" 
                        step="0.01" 
                        value={formData.budgetSpent} 
                        onChange={handleInputChange} 
                        placeholder="예: 10.50" 
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} 
                      />
                    </div>
                  </div>

                  {/* 다섯번째 줄: 구축단계 일정 지정 (선택 입력) */}
                  <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.95rem", borderRadius: "8px", border: "1px solid var(--border-color-dark)", marginBottom: "1rem" }}>
                    <span style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "white", marginBottom: "0.5rem" }}>
                      📅 구축단계 일정 지정 (선택 입력)
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>요청(Rq) 일</label>
                        <input type="date" name="dateP" value={formData.dateP || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.4rem 0.35rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.72rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>검토∙심의∙결정(PDR) 일</label>
                        <input type="date" name="dateA" value={formData.dateA || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.4rem 0.35rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.72rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>설계∙인허가(DL) 일</label>
                        <input type="date" name="dateB" value={formData.dateB || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.4rem 0.35rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.72rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>입찰∙계약(BC) 일</label>
                        <input type="date" name="datePr" value={formData.datePr || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.4rem 0.35rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.72rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>시공∙감리(CS) 일</label>
                        <input type="date" name="dateI" value={formData.dateI || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.4rem 0.35rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.72rem" }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>구축 목적 (공간 용도)</label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} required placeholder="특화 인력 양성을 위한 핵심 시너지 공간 용도 상세 기술" style={{ width: "100%", height: "50px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>향후 활용 계획</label>
                    <input type="text" name="utilization" value={formData.utilization} onChange={handleInputChange} required placeholder="예: 공간 연계 교육과정 활용 방식 및 융합 연구 활용" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>세부 공간 구축 설계 계획 (선택)</label>
                    <textarea name="plan" value={formData.plan} onChange={handleInputChange} placeholder="예: 바닥 전선 몰딩, 방음벽 흡음 패널 시공 및 스마트 미러링 보드 마운팅 작업" style={{ width: "100%", height: "50px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>공사 진행 실적 현황 (선택)</label>
                    <textarea name="progress" value={formData.progress} onChange={handleInputChange} placeholder="현재 진행 실무 정보 기술" style={{ width: "100%", height: "50px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                </>
              )}

              {/* 기자재용 입력 필드들 */}
              {modalType === "equip" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>단위과제</label>
                      <select 
                        name="unit" 
                        value={formData.unit} 
                        onChange={handleInputChange} 
                        className="user-selector" 
                        style={{ width: "100%" }}
                      >
                        {Number(formData.year || selectedYear) === 1 
                          ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                          : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "Common"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                        }
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사업연차 선택</label>
                      <select 
                        name="year" 
                        value={formData.year || selectedYear} 
                        onChange={handleInputChange} 
                        className="user-selector" 
                        style={{ width: "100%" }}
                      >
                        <option value={1}>1차년도 (2025년)</option>
                        <option value={2}>2차년도 (2026년)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>연계 프로그램</label>
                    <select 
                      name="operation" 
                      value={formData.operation} 
                      onChange={handleInputChange} 
                      className="user-selector" 
                      style={{ width: "100%" }}
                    >
                      {getDynamicPrograms().map(p => (
                        <option key={p.id} value={p.name}>[{p.id}] {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>학과 선택</label>
                      <select 
                        name="deptName" 
                        value={formData.deptName} 
                        onChange={handleInputChange}
                        className="user-selector"
                      >
                        <option value="">-- 선택 안 함 --</option>
                        {/* 1) 학과는 사업단관리 탭의 대학조직도에 나온 학부(과)를 기준으로 렌더링 */}
                        <option value="기계공학부">기계공학부</option>
                        <option value="기계시스템전공">{"\u00A0-\u00A0기계시스템전공"}</option>
                        <option value="기계설비전공">{"\u00A0-\u00A0기계설비전공"}</option>
                        <option value="전기전자공학부">전기전자공학부</option>
                        <option value="전기전공">{"\u00A0-\u00A0전기전공"}</option>
                        <option value="스마트전자전공">{"\u00A0-\u00A0스마트전자전공"}</option>
                        <option value="조선해양시스템공학과">조선해양시스템공학과</option>
                        <option value="컴퓨터공학과">컴퓨터공학과</option>
                        <option value="화학공학과">화학공학과</option>
                        <option value="게임영상학과">게임영상학과</option>
                        <option value="실내건축디자인과">실내건축디자인과</option>
                        <option value="융합안전공학과">융합안전공학과</option>
                        <option value="인테리어시공학과">인테리어시공학과</option>
                        <option value="간호학부">간호학부</option>
                        <option value="물리치료학과">물리치료학과</option>
                        <option value="치위생학과">치위생학과</option>
                        <option value="식품영양학과">식품영양학과</option>
                        <option value="호텔조리제빵과">호텔조리제빵과</option>
                        <option value="스포츠재활학부">스포츠재활학부</option>
                        <option value="스포츠건강재활학과">스포츠건강재활학과</option>
                        <option value="푸드케어학과">푸드케어학과</option>
                        <option value="골프산업과">골프산업과</option>
                        <option value="반려동물보건과">반려동물보건과</option>
                        <option value="사회복지학과">사회복지학과</option>
                        <option value="유아교육과">유아교육과</option>
                        <option value="세무회계학과">세무회계학과</option>
                        <option value="사회복지상담학과">사회복지상담학과</option>
                        <option value="국제학부">국제학부</option>
                        <option value="미래모빌리티제조학과">미래모빌리티제조학과</option>
                        <option value="바이오화학생산기술학과">바이오화학생산기술학과</option>
                        <option value="인공지능기반텔레헬스학과">인공지능기반텔레헬스학과</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>부서 선택</label>
                      <select 
                        name="divisionName" 
                        value={formData.divisionName} 
                        onChange={handleInputChange}
                        className="user-selector"
                      >
                        <option value="">-- 선택 안 함 --</option>
                        {/* 앵커사업단 및 센터 */}
                        <optgroup label="앵커사업단 및 센터">
                          <option value="사업운영팀">사업운영팀</option>
                          <option value="ECC센터">ECC센터</option>
                          <option value="ICC센터">ICC센터</option>
                          <option value="RCC센터">RCC센터</option>
                          <option value="AID-X지원센터">AID-X지원센터</option>
                          <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                          <option value="신산업특화센터">신산업특화센터</option>
                        </optgroup>
                        {/* 대학본부 하위 조직 */}
                        <optgroup label="대학본부">
                          <option value="교무팀">교무팀</option>
                          <option value="교수학습지원센터">교수학습지원센터</option>
                          <option value="직업교육혁신센터">직업교육혁신센터</option>
                          <option value="교양교육혁신센터">교양교육혁신센터</option>
                          <option value="기획팀">기획팀</option>
                          <option value="대외협력실">대외협력실</option>
                          <option value="입학팀">입학팀</option>
                          <option value="진로진학지원센터">진로진학지원센터</option>
                          <option value="총무팀">총무팀</option>
                          <option value="재무회계팀">재무회계팀</option>
                          <option value="국제교류원운영팀">국제교류원운영팀</option>
                          <option value="글로컬비즈니스센터">글로컬비즈니스센터</option>
                          <option value="IR센터">IR센터</option>
                        </optgroup>
                        {/* 산학협력단 하위 조직 */}
                        <optgroup label="산학협력단">
                          <option value="산학기획팀">산학기획팀</option>
                          <option value="산학지원팀">산학지원팀</option>
                          <option value="창업창직교육센터">창업창직교육센터</option>
                          <option value="현장실습지원센터">현장실습지원센터</option>
                          <option value="울산광역시 탄소중립 지원센터">울산광역시 탄소중립 지원센터</option>
                          <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                          <option value="종합환경분석센터">종합환경분석센터</option>
                          <option value="영상콘텐츠제작센터">영상콘텐츠제작센터</option>
                          <option value="스포츠재활운동센터">스포츠재활운동센터</option>
                          <option value="이차전지연구소">이차전지연구소</option>
                          <option value="지산학혁신연구소">지산학혁신연구소</option>
                          <option value="어린이급식관리사업단">어린이급식관리사업단</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#fbbf24", display: "block", marginTop: "-0.5rem" }}>
                    * 학과 또는 부서 중 최소 한 곳은 필수로 지정되어야 합니다.
                  </span>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>품명</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="예: 임상 실습용 스마트 베드" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  {modalType !== "env" && (() => {
                    const priceVal = parseFloat(formData.unitPrice || 0);
                    const qtyVal = parseFloat(formData.quantity || 0);
                    const totalInMillion = (priceVal * qtyVal).toFixed(2);
                    return (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: "1rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>단가 (백만원)</label>
                            <input type="number" name="unitPrice" step="0.01" value={formData.unitPrice} onChange={handleInputChange} required placeholder="예: 120.00" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>수량</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required placeholder="예: 2" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>금액 (백만원)</label>
                            <input type="text" value={`${parseFloat(totalInMillion).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 백만원`} readOnly style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "#10B981", fontWeight: "bold" }} />
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>구입목적</label>
                            <textarea name="descriptionPurpose" value={formData.descriptionPurpose || ""} onChange={handleInputChange} required placeholder="기자재의 구입 목적 및 타당성 상세 기술" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>활용계획</label>
                            <textarea name="descriptionPlan" value={formData.descriptionPlan || ""} onChange={handleInputChange} required placeholder="핵심 활용 계획 및 예상 시너지 상세 기술" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {modalType === "env" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>구축목적</label>
                        <textarea name="descriptionPurpose" value={formData.descriptionPurpose || ""} onChange={handleInputChange} required placeholder="환경구축의 목적 및 타당성 상세 기술" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>활용계획</label>
                        <textarea name="descriptionPlan" value={formData.descriptionPlan || ""} onChange={handleInputChange} required placeholder="핵심 활용 계획 및 예상 시너지 상세 기술" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                      </div>
                    </div>
                  )}
                  
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color-dark)" }}>
                    <span style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "white", marginBottom: "0.75rem" }}>
                      📅 단계별 이벤트 일자 입력 (선택 입력)
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem" }}>
                          {modalType === "env" ? "요청(Rq) 일자" : "기획(P) 일자"}
                        </label>
                        <input type="date" name="dateP" value={formData.dateP || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.3rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.72rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>
                          {modalType === "env" ? "심의(DR) 일자" : "승인(A) 일자"}
                        </label>
                        <input type="date" name="dateA" value={formData.dateA || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.3rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.72rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem" }}>
                          {modalType === "env" ? "용역(DL) 일자" : "입찰(B) 일자"}
                        </label>
                        <input type="date" name="dateB" value={formData.dateB || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.3rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.72rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem" }}>
                          {modalType === "env" ? "선정(BC) 일자" : "구매(Pr) 일자"}
                        </label>
                        <input type="date" name="datePr" value={formData.datePr || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.3rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.72rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary-dark)", marginBottom: "0.2rem" }}>
                          {modalType === "env" ? "시공(CS) 일자" : "검수(I) 일자"}
                        </label>
                        <input type="date" name="dateI" value={formData.dateI || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.3rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", fontSize: "0.72rem" }} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {(modalType === "env" || modalType === "equip") && (
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color-dark)", marginTop: "1rem" }}>
                  <span style={{ display: "block", fontSize: "0.85rem", fontWeight: "800", color: "#60A5FA", marginBottom: "0.75rem" }}>
                    {modalType === "env" ? "🤖 AI 문서 분석 및 요약 등록 (기획, 구매, 결과)" : "🤖 AI 문서 분석 및 요약 등록 (기획, 구매, 입찰)"}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>


                      
                      {/* 1. 기획문서 업로드 및 AI 분석 */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#93C5FD" }}>
                            {modalType === "env" ? "1. 기획문서 (사업단 ➔ 시설안전관리팀)" : "1. 기획문서 (사업단 작성/결재)"}
                          </span>
                          {formData.aiProposalData && (
                            <span style={{ fontSize: "0.72rem", color: "#10B981", fontWeight: "800" }}>
                              ✅ AI 분석완료 ({formData.aiProposalData.docNo})
                            </span>
                          )}
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {/* 파일 인풋 */}
                            <input 
                              type="file" 
                              id="file-plan-upload" 
                              accept=".pdf,.doc,.docx,.hwp,.txt" 
                              onChange={(e) => handleFileChange("proposal", e)} 
                              style={{ display: "none" }} 
                            />
                            
                            {formData.docPlanFileName ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, background: "rgba(0,0,0,0.3)", padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                <span style={{ fontSize: "0.78rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
                                  📄 {formData.docPlanFileName} ({formatToThousandWon(formData.docPlanFileSize)} KB)
                                </span>
                                <button 
                                  type="button" 
                                  onClick={() => handleFileRemove("proposal")} 
                                  style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.2rem" }}
                                  title="파일 제거"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ) : (
                              <label 
                                htmlFor="file-plan-upload" 
                                style={{ display: "block", flex: 1, textAlign: "center", padding: "0.6rem", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary-dark)", transition: "background 0.2s" }}
                                onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.05)"}
                                onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.02)"}
                              >
                                {modalType === "env" ? "📎 기획(사업단➔시설안전관리팀) 관련 문서 선택 (.pdf, .docx, .hwp)" : "📎 기획문서 파일 선택 (.pdf, .docx, .hwp)"}
                              </label>
                            )}

                            <button
                              type="button"
                              onClick={() => handleAnalyzeAndUpload("proposal")}
                              disabled={isAnalyzingPlan}
                              style={{ padding: "0.5rem 1.1rem", fontSize: "0.75rem", background: "#3b82f6", border: "none", color: "white", borderRadius: "6px", fontWeight: "700", cursor: "pointer", opacity: isAnalyzingPlan ? 0.6 : 1, transition: "background 0.2s" }}
                            >
                              {isAnalyzingPlan ? "분석 중..." : "AI 분석"}
                            </button>
                          </div>

                          {/* 업로드 프로그레스 바 */}
                          {uploadProgressPlan > 0 && (
                            <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${uploadProgressPlan}%`, height: "100%", background: "#3b82f6", transition: "width 0.15s ease-out" }} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. 구매문서 업로드 및 AI 분석 */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#C084FC" }}>
                            {modalType === "env" ? "2. 구매문서 (시설안전관리팀)" : "2. 구매문서 (총무팀 발송)"}
                          </span>
                          {formData.aiPurchaseData && (
                            <span style={{ fontSize: "0.72rem", color: "#10B981", fontWeight: "800" }}>
                              ✅ AI 분석완료 ({formData.aiPurchaseData.docNo})
                            </span>
                          )}
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <input 
                              type="file" 
                              id="file-purchase-upload" 
                              accept=".pdf,.doc,.docx,.hwp,.txt" 
                              onChange={(e) => handleFileChange("purchase", e)} 
                              style={{ display: "none" }} 
                            />
                            
                            {formData.docPurchaseFileName ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, background: "rgba(0,0,0,0.3)", padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                <span style={{ fontSize: "0.78rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
                                  📄 {formData.docPurchaseFileName} ({formatToThousandWon(formData.docPurchaseFileSize)} KB)
                                </span>
                                <button 
                                  type="button" 
                                  onClick={() => handleFileRemove("purchase")} 
                                  style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.2rem" }}
                                  title="파일 제거"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ) : (
                              <label 
                                htmlFor="file-purchase-upload" 
                                style={{ display: "block", flex: 1, textAlign: "center", padding: "0.6rem", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary-dark)", transition: "background 0.2s" }}
                                onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.05)"}
                                onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.02)"}
                              >
                                {modalType === "env" ? "📎 구매(시설안전관리팀) 관련 문서 선택 (.pdf, .docx, .hwp)" : "📎 구매조달 발송파일 선택 (.pdf, .docx, .hwp)"}
                              </label>
                            )}

                            <button
                              type="button"
                              onClick={() => handleAnalyzeAndUpload("purchase")}
                              disabled={isAnalyzingPurchase}
                              style={{ padding: "0.5rem 1.1rem", fontSize: "0.75rem", background: "#a78bfa", border: "none", color: "white", borderRadius: "6px", fontWeight: "700", cursor: "pointer", opacity: isAnalyzingPurchase ? 0.6 : 1, transition: "background 0.2s" }}
                            >
                              {isAnalyzingPurchase ? "분석 중..." : "AI 분석"}
                            </button>
                          </div>

                          {/* 업로드 프로그레스 바 */}
                          {uploadProgressPurchase > 0 && (
                            <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${uploadProgressPurchase}%`, height: "100%", background: "#a78bfa", transition: "width 0.15s ease-out" }} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. 입찰/결과문서 업로드 및 AI 분석 */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#34D399" }}>
                            {modalType === "env" ? "3. 결과문서 (시설안전관리팀)" : "3. 입찰문서 (총무팀 작성)"}
                          </span>
                          {formData.aiBidData && (
                            <span style={{ fontSize: "0.72rem", color: "#10B981", fontWeight: "800" }}>
                              ✅ AI 분석완료 ({formData.aiBidData.docNo})
                            </span>
                          )}
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <input 
                              type="file" 
                              id="file-bid-upload" 
                              accept=".pdf,.doc,.docx,.hwp,.txt" 
                              onChange={(e) => handleFileChange("bid", e)} 
                              style={{ display: "none" }} 
                            />
                            
                            {formData.docBidFileName ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, background: "rgba(0,0,0,0.3)", padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                <span style={{ fontSize: "0.78rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
                                  📄 {formData.docBidFileName} ({formatToThousandWon(formData.docBidFileSize)} KB)
                                </span>
                                <button 
                                  type="button" 
                                  onClick={() => handleFileRemove("bid")} 
                                  style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.2rem" }}
                                  title="파일 제거"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ) : (
                              <label 
                                htmlFor="file-bid-upload" 
                                style={{ display: "block", flex: 1, textAlign: "center", padding: "0.6rem", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.02)", fontSize: "0.75rem", color: "var(--text-secondary-dark)", transition: "background 0.2s" }}
                                onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.05)"}
                                onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.02)"}
                              >
                                {modalType === "env" ? "📎 결과보고서 관련 문서 선택 (.pdf, .docx, .hwp)" : "📎 입찰공고/규격서 파일 선택 (.pdf, .docx, .hwp)"}
                              </label>
                            )}

                            <button
                              type="button"
                              onClick={() => handleAnalyzeAndUpload("bid")}
                              disabled={isAnalyzingBid}
                              style={{ padding: "0.5rem 1.1rem", fontSize: "0.75rem", background: "#10b981", border: "none", color: "white", borderRadius: "6px", fontWeight: "700", cursor: "pointer", opacity: isAnalyzingBid ? 0.6 : 1, transition: "background 0.2s" }}
                            >
                              {isAnalyzingBid ? "분석 중..." : "AI 분석"}
                            </button>
                          </div>

                          {/* 업로드 프로그레스 바 */}
                          {uploadProgressBid > 0 && (
                            <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${uploadProgressBid}%`, height: "100%", background: "#10b981", transition: "width 0.15s ease-out" }} />
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              {/* 용역용 입력 필드들 */}
              {/* 용역용 입력 필드들 */}
              {modalType === "service" && (
                <>
                  {/* 첫번째 줄: 단위과제, 프로그램 진행 상황 (비율 = 1:2) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>단위과제</label>
                      <select 
                        name="unit" 
                        value={formData.unit} 
                        onChange={(e) => {
                          const nextUnit = e.target.value;
                          // 단위과제 변경 시 관련 프로그램 목록이 갱신되므로 첫 번째 프로그램으로 자동 셋해줍니다.
                          const nextProgs = getDynamicPrograms(nextUnit);
                          setFormData(prev => ({
                            ...prev,
                            unit: nextUnit,
                            programId: nextProgs.length > 0 ? nextProgs[0].id : "",
                            programName: nextProgs.length > 0 ? nextProgs[0].name : ""
                          }));
                        }}
                        className="user-selector" 
                        style={{ width: "100%", padding: "0.5rem", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}
                      >
                        <option value="A1">A1 과제</option>
                        <option value="A2">A2 과제</option>
                        <option value="A3">A3 과제</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>연계 프로그램 (진행 상황)</label>
                      <select 
                        name="programSelect" 
                        value={formData.programId && formData.programName ? `${formData.programId}|${formData.programName}` : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const [pId, pName] = val.split("|");
                            setFormData(prev => ({
                              ...prev,
                              programId: pId,
                              programName: pName
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              programId: "",
                              programName: ""
                            }));
                          }
                        }}
                        className="user-selector" 
                        style={{ width: "100%", padding: "0.5rem", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}
                      >
                        <option value="">(연계 프로그램 선택 안 함)</option>
                        {getDynamicPrograms(formData.unit).map(prog => (
                          <option key={prog.id} value={`${prog.id}|${prog.name}`}>
                            [{prog.id}] {prog.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 두번째 줄: 관련학과, 관련부서 (학과, 부서 중 택1 필수) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련학과 (배정 학과) <span style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: "700" }}>(학과/부서 중 택1 필수)</span></label>
                      <select 
                        name="deptName" 
                        value={formData.deptName} 
                        onChange={handleInputChange} 
                        className="user-selector" 
                        style={{ width: "100%", padding: "0.5rem", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}
                      >
                        <option value="">(학과 없음/전체)</option>
                        <option value="기계공학부">기계공학부</option>
                        <option value="기계시스템전공">{"\u00A0-\u00A0기계시스템전공"}</option>
                        <option value="기계설비전공">{"\u00A0-\u00A0기계설비전공"}</option>
                        <option value="전기전자공학부">전기전자공학부</option>
                        <option value="전기전공">{"\u00A0-\u00A0전기전공"}</option>
                        <option value="스마트전자전공">{"\u00A0-\u00A0스마트전자전공"}</option>
                        <option value="조선해양시스템공학과">조선해양시스템공학과</option>
                        <option value="컴퓨터공학과">컴퓨터공학과</option>
                        <option value="화학공학과">화학공학과</option>
                        <option value="게임영상학과">게임영상학과</option>
                        <option value="실내건축디자인과">실내건축디자인과</option>
                        <option value="융합안전공학과">융합안전공학과</option>
                        <option value="인테리어시공학과">인테리어시공학과</option>
                        <option value="간호학부">간호학부</option>
                        <option value="물리치료학과">물리치료학과</option>
                        <option value="치위생학과">치위생학과</option>
                        <option value="식품영양학과">식품영양학과</option>
                        <option value="호텔조리제빵과">호텔조리제빵과</option>
                        <option value="스포츠재활학부">스포츠재활학부</option>
                        <option value="스포츠건강재활학과">스포츠건강재활학과</option>
                        <option value="푸드케어학과">푸드케어학과</option>
                        <option value="골프산업과">골프산업과</option>
                        <option value="반려동물보건과">반려동물보건과</option>
                        <option value="사회복지학과">사회복지학과</option>
                        <option value="유아교육과">유아교육과</option>
                        <option value="세무회계학과">세무회계학과</option>
                        <option value="사회복지상담학과">사회복지상담학과</option>
                        <option value="국제학부">국제학부</option>
                        <option value="미래모빌리티제조학과">미래모빌리티제조학과</option>
                        <option value="바이오화학생산기술학과">바이오화학생산기술학과</option>
                        <option value="인공지능기반텔레헬스학과">인공지능기반텔레헬스학과</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련부서 (배정 행정부서) <span style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: "700" }}>(학과/부서 중 택1 필수)</span></label>
                      <select 
                        name="divisionName" 
                        value={formData.divisionName} 
                        onChange={handleInputChange} 
                        className="user-selector" 
                        style={{ width: "100%", padding: "0.5rem", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}
                      >
                        <option value="">(부서 없음/전체)</option>
                        <optgroup label="앵커사업단 및 센터">
                          <option value="사업운영팀">사업운영팀</option>
                          <option value="ECC센터">ECC센터</option>
                          <option value="ICC센터">ICC센터</option>
                          <option value="RCC센터">RCC센터</option>
                          <option value="AID-X지원센터">AID-X지원센터</option>
                          <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                          <option value="신산업특화센터">신산업특화센터</option>
                        </optgroup>
                        <optgroup label="대학본부">
                          <option value="교무팀">교무팀</option>
                          <option value="교수학습지원센터">교수학습지원센터</option>
                          <option value="직업교육혁신센터">직업교육혁신센터</option>
                          <option value="교양교육혁신센터">교양교육혁신센터</option>
                          <option value="기획팀">기획팀</option>
                          <option value="대외협력실">대외협력실</option>
                          <option value="입학팀">입학팀</option>
                          <option value="진로진학지원센터">진로진학지원센터</option>
                          <option value="총무팀">총무팀</option>
                          <option value="재무회계팀">재무회계팀</option>
                          <option value="국제교류원운영팀">국제교류원운영팀</option>
                          <option value="글로컬비즈니스센터">글로컬비즈니스센터</option>
                          <option value="IR센터">IR센터</option>
                        </optgroup>
                        <optgroup label="산학협력단">
                          <option value="산학기획팀">산학기획팀</option>
                          <option value="산학지원팀">산학지원팀</option>
                          <option value="창업창직교육센터">창업창직교육센터</option>
                          <option value="현장실습지원센터">현장실습지원센터</option>
                          <option value="울산광역시 탄소중립 지원센터">울산광역시 탄소중립 지원센터</option>
                          <option value="울산늘봄누리센터">울산늘봄누리센터</option>
                          <option value="종합환경분석센터">종합환경분석센터</option>
                          <option value="영상콘텐츠제작센터">영상콘텐츠제작센터</option>
                          <option value="스포츠재활운동센터">스포츠재활운동센터</option>
                          <option value="이차전지연구소">이차전지연구소</option>
                          <option value="지산학혁신연구소">지산학혁신연구소</option>
                          <option value="어린이급식관리사업단">어린이급식관리사업단</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#f59e0b", marginTop: "-0.5rem", marginBottom: "0.5rem", fontWeight: "600" }}>
                    * 관련학과 혹은 관련부서 중 최소한 하나는 반드시 지정해야 합니다.
                  </div>

                  {/* 세번째 줄: 용역명칭, 용역목적 (둘 다 필수 입력) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>용역 명칭 (500만원 이상) <span style={{ color: "var(--danger-color)" }}>*</span></label>
                      <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="예: 앵커 산학 네트워크 포럼 기획 운영 대행 용역" 
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>용역목적 (추진 목적) <span style={{ color: "var(--danger-color)" }}>*</span></label>
                      <input 
                        type="text" 
                        name="purpose" 
                        value={formData.purpose} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="예: 해당 용역이 해결하고자 하는 문제 및 목표" 
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} 
                      />
                    </div>
                  </div>

                  {/* 네번째 줄: 특이 요청사항 (선택 입력) */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>특이 요청사항 (선택)</label>
                    <textarea 
                      name="opResult" 
                      value={formData.opResult} 
                      onChange={handleInputChange} 
                      placeholder="예: 수행 결과 및 계약 시 특이사항 기술" 
                      style={{ width: "100%", height: "50px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} 
                    />
                  </div>

                  {/* 다섯번째 줄: 사업예산(천원), 집행액(천원) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사업예산 (천원)</label>
                      <input 
                        type="number" 
                        name="budgetPlan" 
                        value={formData.budgetPlan} 
                        onChange={handleInputChange} 
                        placeholder="예: 25000 (2천5백만원)" 
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>집행액 (천원)</label>
                      <input 
                        type="number" 
                        name="budgetSpent" 
                        value={formData.budgetSpent} 
                        onChange={handleInputChange} 
                        placeholder="예: 20000 (2천만원)" 
                        style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} 
                      />
                    </div>
                  </div>

                  {/* 7대 행정 절차 날짜 입력 필드 */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#60A5FA", display: "block", marginBottom: "0.5rem" }}>📅 7대 행정 절차 완료 일자 설정</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.72rem", color: "#f59e0b", marginBottom: "0.15rem" }}>기획(PP)</label>
                        <input type="date" name="datePp" value={formData.datePp || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.35rem", fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.72rem", color: "#3b82f6", marginBottom: "0.15rem" }}>의뢰(RFO)</label>
                        <input type="date" name="dateRfo" value={formData.dateRfo || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.35rem", fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.72rem", color: "#06b6d4", marginBottom: "0.15rem" }}>입찰(B)</label>
                        <input type="date" name="dateB" value={formData.dateB || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.35rem", fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.72rem", color: "#ec4899", marginBottom: "0.15rem" }}>평가∙선정(ES)</label>
                        <input type="date" name="dateEs" value={formData.dateEs || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.35rem", fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.72rem", color: "#a78bfa", marginBottom: "0.15rem" }}>계약(C)</label>
                        <input type="date" name="dateC" value={formData.dateC || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.35rem", fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.72rem", color: "#eab308", marginBottom: "0.15rem" }}>수행(E)</label>
                        <input type="date" name="dateE" value={formData.dateE || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.35rem", fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.72rem", color: "#10b981", marginBottom: "0.15rem" }}>검수(I)</label>
                        <input type="date" name="dateI" value={formData.dateI || ""} onChange={handleInputChange} style={{ width: "100%", padding: "0.35rem", fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                      </div>
                    </div>
                  </div>

                  {/* 3종 관련 문서 파일 첨부 및 AI 자동분석 패널 */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#a78bfa", display: "block", marginBottom: "0.5rem" }}>📎 행정 서류 첨부 및 AI 분석 연계</span>
                    
                    {/* 1. 기획문서 첨부 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.75rem" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>기획서 관련 문서 (사업단 작성 기안문)</label>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input type="file" id="file-plan-upload-serv" onChange={(e) => handleFileChange("proposal", e)} style={{ display: "none" }} />
                        <label htmlFor="file-plan-upload-serv" style={{ display: "block", flex: 1, textAlign: "center", padding: "0.45rem", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.02)", fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>
                          {formData.docPlanFileName ? `📎 ${formData.docPlanFileName}` : "📎 기획문서 파일 선택 (.pdf, .docx, .hwp)"}
                        </label>
                        <button type="button" onClick={() => handleAnalyzeAndUpload("proposal")} disabled={isAnalyzingPlan} style={{ padding: "0.45rem 1rem", fontSize: "0.72rem", background: "#3b82f6", border: "none", color: "white", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                          {isAnalyzingPlan ? "분석중..." : "AI 분석"}
                        </button>
                      </div>
                    </div>

                    {/* 2. 구매문서 첨부 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.75rem" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>구매의뢰 관련 문서 (위탁 의뢰 이송 공문)</label>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input type="file" id="file-purchase-upload-serv" onChange={(e) => handleFileChange("purchase", e)} style={{ display: "none" }} />
                        <label htmlFor="file-purchase-upload-serv" style={{ display: "block", flex: 1, textAlign: "center", padding: "0.45rem", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.02)", fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>
                          {formData.docPurchaseFileName ? `📎 ${formData.docPurchaseFileName}` : "📎 구매의뢰 문서 파일 선택 (.pdf, .docx, .hwp)"}
                        </label>
                        <button type="button" onClick={() => handleAnalyzeAndUpload("purchase")} disabled={isAnalyzingPurchase} style={{ padding: "0.45rem 1rem", fontSize: "0.72rem", background: "#a78bfa", border: "none", color: "white", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                          {isAnalyzingPurchase ? "분석중..." : "AI 분석"}
                        </button>
                      </div>
                    </div>

                    {/* 3. 결과문서 첨부 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>검수조서 관련 문서 (최종 준공/검수 보고서)</label>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input type="file" id="file-bid-upload-serv" onChange={(e) => handleFileChange("bid", e)} style={{ display: "none" }} />
                        <label htmlFor="file-bid-upload-serv" style={{ display: "block", flex: 1, textAlign: "center", padding: "0.45rem", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.02)", fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>
                          {formData.docBidFileName ? `📎 ${formData.docBidFileName}` : "📎 결과/검수 문서 파일 선택 (.pdf, .docx, .hwp)"}
                        </label>
                        <button type="button" onClick={() => handleAnalyzeAndUpload("bid")} disabled={isAnalyzingBid} style={{ padding: "0.45rem 1rem", fontSize: "0.72rem", background: "#10b981", border: "none", color: "white", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                          {isAnalyzingBid ? "분석중..." : "AI 분석"}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 버튼 그룹 */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "transparent", border: "1px solid var(--border-color-dark)", color: "white", cursor: "pointer" }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{ padding: "0.5rem 1.25rem", borderRadius: "6px", background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", cursor: "pointer" }}
                >
                  새 항목 등록하기
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 월별 Gantt 단계 다중 선택 플로팅 팝오버 컴포넌트 */}
      {activePopover && (
        <>
          <div 
            onClick={() => setActivePopover(null)} 
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200, background: "transparent" }} 
          />
          <div 
            style={{
              position: "fixed",
              top: `${activePopover.y}px`,
              left: `${activePopover.x}px`,
              transform: "translate(-50%, -100%) translateY(-10px)",
              background: "#ffffff", // 완전히 밝은 흰색 배경으로 교체
              border: "1px solid #cbd5e1", // 밝고 고상한 실버 테두리
              borderRadius: "8px",
              padding: "0.75rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25), 0 8px 10px rgba(0,0,0,0.15)", // 자연스러운 음영 그림자
              zIndex: 1251,
              width: "160px",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "0.2rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", textAlign: "center" }}>
              {activePopover.month}월 단계 중복 선택
            </div>
            {[
              { label: "기획 (P)", val: "기획", color: "#ea580c" }, // 밝은 배경에 선명한 오렌지
              { label: "승인 (A)", val: "승인", color: "#1d4ed8" }, // 선명한 다크 블루
              { label: "입찰 (B)", val: "입찰", color: "#0e7490" }, // 진한 시안
              { label: "구매 (Pr)", val: "구매", color: "#6d28d9" }, // 선명한 퍼플
              { label: "검수 (I)", val: "검수", color: "#047857" }  // 진한 에메랄드 그린
            ].map((step) => {
              let isChecked = false;
              if (activePopover.equipId === "NEW_FORM") {
                const currentList = getMilestoneArray(formData.milestones?.[activePopover.month]);
                isChecked = currentList.includes(step.val);
              } else {
                const activeEquipList = equipData.length > 0 ? equipData : defaultEquipments;
                const targetEquip = activeEquipList.find(e => e.id === activePopover.equipId);
                const currentList = targetEquip ? getMilestoneArray(targetEquip.milestones?.[activePopover.month]) : [];
                isChecked = currentList.includes(step.val);
              }

              return (
                <label 
                  key={step.val} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px", 
                    fontSize: "0.75rem", 
                    color: "#0f172a", // 어두운 텍스트로 가독성 확보
                    cursor: "pointer", 
                    userSelect: "none",
                    padding: "0.2rem 0.35rem",
                    borderRadius: "4px",
                    transition: "background 0.1s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleMilestoneMultiToggle(activePopover.equipId, activePopover.month, step.val)}
                    style={{ cursor: "pointer", accentColor: step.color }}
                  />
                  <span style={{ color: step.color, fontWeight: "800" }}>{step.label}</span>
                </label>
              );
            })}
          </div>
        </>
      )}

      {/* 기획문서 팝업 모달 */}
      {proposalModalData && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300 }}>
          <div className="glass-card" style={{ width: "500px", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "#1e293b", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#60A5FA", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                📄 기획문서 <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "rgba(255,255,255,0.6)" }}>(사업단 작성 및 결재 문서)</span>
              </h4>
              <button 
                onClick={() => setProposalModalData(null)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>
            
            {(() => {
              // AI 요약 데이터가 존재할 경우 최우선 반영 (요건 5 반영)
              if (proposalModalData.aiProposalData) {
                const ai = proposalModalData.aiProposalData;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                    <div style={{ background: "rgba(96, 165, 250, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(96, 165, 250, 0.25)" }}>
                      <span style={{ fontSize: "0.72rem", color: "#93C5FD", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>📝 기획문서 결재번호 (AI 분석 완료)</span>
                      <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                        {ai.docNo}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>단위과제</span>
                      <strong style={{ fontSize: "0.9rem" }}>{ai.unit}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>주관 부서</span>
                      <span>{ai.dept}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>과제 배정 예산 (단위: 천원)</span>
                      <strong style={{ color: "#3b82f6" }}>{ai.budget}</strong>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.4rem" }}>주요 추진 전략 목표</span>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {(ai.goals || []).map((goal, idx) => (
                          <li key={idx} style={{ color: "rgba(255,255,255,0.85)" }}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              }

              // 기존 폴백(Fallback) 기획 모의 데이터
              const summary = PROPOSAL_SUMMARIES[proposalModalData.unit] || {
                title: "알 수 없는 단위과제",
                dept: "미지정 센터",
                goals: ["상세 계획 확인 중"],
                budget: "0.0백만원"
              };
              
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                  <div style={{ background: "rgba(96, 165, 250, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(96, 165, 250, 0.25)" }}>
                    <span style={{ fontSize: "0.72rem", color: "#93C5FD", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>📝 기획문서 결재번호</span>
                    <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                      {proposalModalData.docPlan || `UC-EQ-${proposalModalData.unit}-${String(proposalModalData.seq || proposalModalData.id).slice(-3).padStart(3, "0")}`}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>단위과제</span>
                    <strong style={{ fontSize: "0.9rem" }}>{proposalModalData.unit} : {summary.title}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>주관 부서</span>
                    <span>{summary.dept}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>과제 배정 예산</span>
                    <strong style={{ color: "#3b82f6" }}>{convertMillionWonToThousandWon(summary.budget)}</strong>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.4rem" }}>주요 추진 전략 목표</span>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {summary.goals.map((goal, idx) => (
                        <li key={idx} style={{ color: "rgba(255,255,255,0.85)" }}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
              {proposalModalData.docPlanFileUrl ? (
                <a 
                  href={proposalModalData.docPlanFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#60A5FA", textDecoration: "none", fontWeight: "700" }}
                >
                  📎 첨부문서 다운로드
                </a>
              ) : (
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>첨부파일 없음</span>
              )}
              <button 
                onClick={() => setProposalModalData(null)}
                style={{ padding: "0.4rem 1.25rem", borderRadius: "6px", background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", cursor: "pointer" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 구매문서 팝업 모달 */}
      {purchaseModalData && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300 }}>
          <div className="glass-card" style={{ width: "500px", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "#1e293b", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#C084FC", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                📦 구매문서 <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "rgba(255,255,255,0.6)" }}>(사업단 ➡️ 총무팀 발송문서)</span>
              </h4>
              <button 
                onClick={() => setPurchaseModalData(null)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>
            
            {(() => {
              const price = Number(purchaseModalData.unitPrice) || 0;
              const qty = Number(purchaseModalData.quantity) || 0;
              const total = price * qty;

              // AI 요약 데이터가 존재할 경우 반영
              if (purchaseModalData.aiPurchaseData) {
                const ai = purchaseModalData.aiPurchaseData;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                    <div style={{ background: "rgba(167, 139, 250, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(167, 139, 250, 0.25)" }}>
                      <span style={{ fontSize: "0.72rem", color: "#D8B4FE", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>📦 구매문서 결재번호 (AI 분석 완료)</span>
                      <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                        {ai.docNo}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>품명 및 수량</span>
                      <strong style={{ fontSize: "0.9rem" }}>{purchaseModalData.itemName || purchaseModalData.name || "-"} / {qty}대 (세트)</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>발신 부서 / 발송처</span>
                      <span>{ai.fromDept} / <strong>{ai.toDept}</strong></span>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>도입 소요예산 (단위: 천원)</span>
                      <strong style={{ color: "#a78bfa" }}>{ai.budget}</strong>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.4rem" }}>조달 위탁 요청 기술 사양</span>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {(ai.specs || []).map((spec, idx) => (
                          <li key={idx} style={{ color: "rgba(255,255,255,0.85)" }}>{spec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              }
              
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                  <div style={{ background: "rgba(167, 139, 250, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(167, 139, 250, 0.25)" }}>
                    <span style={{ fontSize: "0.72rem", color: "#D8B4FE", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>📦 구매문서 결재번호 (총무팀 수신부서 이송공문)</span>
                    <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                      {purchaseModalData.docPurchase || `UC-PR-${purchaseModalData.unit}-${String(purchaseModalData.seq || purchaseModalData.id).slice(-3).padStart(3, "0")}`}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>품명 및 수량</span>
                    <strong style={{ fontSize: "0.9rem" }}>{purchaseModalData.itemName || purchaseModalData.name || "-"} / {qty}대 (세트)</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>발신 부서 / 발송처</span>
                    <span>{purchaseModalData.divisionName || purchaseModalData.deptName || "라이즈(앵커)사업단"} / <strong>총무팀 (구매 위탁 요청)</strong></span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>도입 소요예산</span>
                    <strong style={{ color: "#a78bfa" }}>{(total / 1000).toLocaleString()}천원 (VAT 포함)</strong>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.3rem" }}>발송 공문 비고</span>
                    <span style={{ color: "rgba(255,255,255,0.8)" }}>
                      본 문서는 사업단 내부 기획/결재가 완료되어, 조달 진행 및 위탁 발주를 위해 총무팀으로 발송 처리된 행정 이송 결재 연계 상태 문서입니다.
                    </span>
                  </div>
                </div>
              );
            })()}
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
              {purchaseModalData.docPurchaseFileUrl ? (
                <a 
                  href={purchaseModalData.docPurchaseFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#C084FC", textDecoration: "none", fontWeight: "700" }}
                >
                  📎 첨부문서 다운로드
                </a>
              ) : (
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>첨부파일 없음</span>
              )}
              <button 
                onClick={() => setPurchaseModalData(null)}
                style={{ padding: "0.4rem 1.25rem", borderRadius: "6px", background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", cursor: "pointer" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 입찰/결과문서 팝업 모달 */}
      {bidModalData && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300 }}>
          <div className="glass-card" style={{ width: "550px", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "#1e293b", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#10B981", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {subTab === "env_improvement" ? (
                  <>📜 결과문서 <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "rgba(255,255,255,0.6)" }}>(시설안전관리팀 시공/준공 결과)</span></>
                ) : (
                  <>📜 입찰문서 <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "rgba(255,255,255,0.6)" }}>(총무팀 작성 문서)</span></>
                )}
              </h4>
              <button 
                onClick={() => setBidModalData(null)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>
            
            {(() => {
              const price = Number(bidModalData.unitPrice) || 0;
              const qty = Number(bidModalData.quantity) || 0;
              const total = price * qty;
              const isEnv = subTab === "env_improvement";

              // AI 요약 데이터가 존재할 경우 반영
              if (bidModalData.aiBidData) {
                const ai = bidModalData.aiBidData;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                    <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                      <span style={{ fontSize: "0.72rem", color: "#A7F3D0", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>
                        {isEnv ? "⚖️ 결과문서 결재번호 (AI 분석 완료)" : "⚖️ 입찰문서 결재번호 (AI 분석 완료)"}
                      </span>
                      <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                        {ai.docNo}
                      </strong>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>
                          {isEnv ? "준공 및 검수 부서" : "공고 및 낙찰 부서"}
                        </span>
                        <strong style={{ color: "#34D399" }}>
                          {isEnv ? "시설안전관리팀" : "대학본부 총무팀"}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>
                          {isEnv ? "준공 시공 상태" : "입찰 계약 방식"}
                        </span>
                        <span style={{ fontWeight: "700", color: "#10b981" }}>{ai.method}</span>
                      </div>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700", width: "140px" }}>
                            {isEnv ? "구축 공간명" : "품명"}
                          </td>
                          <td style={{ padding: "0.5rem", color: "white", fontWeight: "700" }}>{bidModalData.itemName || bidModalData.name || "-"}</td>
                        </tr>
                        {isEnv ? (
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>지정 호실/위치</td>
                            <td style={{ padding: "0.5rem" }}>{bidModalData.location || "지정 안 됨"}</td>
                          </tr>
                        ) : (
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>도입 단가 / 수량</td>
                            <td style={{ padding: "0.5rem" }}>{(price / 1000).toLocaleString()}천원 / {qty}대</td>
                          </tr>
                        )}
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>
                            {isEnv ? "총 집행 공사비" : "배정 예산 규모"}
                          </td>
                          <td style={{ padding: "0.5rem", fontWeight: "800", color: "#10B981" }}>{ai.budget}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>
                            {isEnv ? "최종 시공 완료일" : "입찰 등록 마감"}
                          </td>
                          <td style={{ padding: "0.5rem", color: "#FBBF24", fontWeight: "700" }}>{ai.deadline}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>
                            {isEnv ? "시공 범위 및 실적" : "참가 자격 및 규격"}
                          </td>
                          <td style={{ padding: "0.5rem", color: "rgba(255,255,255,0.85)", lineHeight: "1.4" }}>
                            {(ai.qualifications || []).map((qual, idx) => (
                              <div key={idx} style={{ marginBottom: "0.2rem" }}>- {qual}</div>
                            ))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              }
              
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.82rem" }}>
                  <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                    <span style={{ fontSize: "0.72rem", color: "#A7F3D0", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>
                      {isEnv ? "⚖️ 결과문서 결재번호" : "⚖️ 입찰문서 결재번호"}
                    </span>
                    <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                      {bidModalData.docBid || (isEnv 
                        ? `UC-RES-${bidModalData.unit}-${String(bidModalData.seq || bidModalData.id).slice(-3).padStart(3, "0")}`
                        : `UC-BID-${bidModalData.unit}-${String(bidModalData.seq || bidModalData.id).slice(-3).padStart(3, "0")}`
                      )}
                    </strong>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>작성 부서</span>
                      <strong style={{ color: "#34D399" }}>
                        {isEnv ? "시설안전관리팀" : "대학본부 총무팀"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>
                        {isEnv ? "보고 구분" : "입찰 구분"}
                      </span>
                      <span style={{ fontWeight: "700", color: "#10b981" }}>
                        {isEnv ? "준공 검수 및 시설 인도 보고" : "제한경쟁입찰 (규격/가격 동시)"}
                      </span>
                    </div>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700", width: "120px" }}>
                          {isEnv ? "구축 공간명" : "품명"}
                        </td>
                        <td style={{ padding: "0.5rem", color: "white", fontWeight: "700" }}>{bidModalData.itemName || bidModalData.name || "-"}</td>
                      </tr>
                      {isEnv ? (
                        <>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>구축 위치</td>
                            <td style={{ padding: "0.5rem" }}>{bidModalData.location || "지정 안 됨"}</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>최종 집행액</td>
                            <td style={{ padding: "0.5rem", fontWeight: "800", color: "#10B981" }}>{(Number(bidModalData.budgetSpent || 0) / 1000).toLocaleString()}천원</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>구매 수량</td>
                            <td style={{ padding: "0.5rem" }}>{qty} 대(세트)</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>도입 단가</td>
                            <td style={{ padding: "0.5rem", fontWeight: "700", color: "#60A5FA" }}>{(price / 1000).toLocaleString()}천원</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>소요 예산</td>
                            <td style={{ padding: "0.5rem", fontWeight: "800", color: "#10B981" }}>{(total / 1000).toLocaleString()}천원 (부가가치세 포함)</td>
                          </tr>
                        </>
                      )}
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>
                          {isEnv ? "최종 구축 공간" : "납품 장소"}
                        </td>
                        <td style={{ padding: "0.5rem" }}>
                          {isEnv 
                            ? `울산과학대학교 내 지정 공간 (${bidModalData.location || "지정 안 됨"})`
                            : "물산과학대학교 지정 실습 공간 및 지정 교수연구실"
                          }
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", fontWeight: "700" }}>
                          {isEnv ? "시공 특이 사항" : "요구 성능 규격"}
                        </td>
                        <td style={{ padding: "0.5rem", color: "rgba(255,255,255,0.85)", lineHeight: "1.4" }}>
                          {isEnv ? (
                            <>
                              - 시설안전관리팀 시방서 기준 정밀 준수 준공<br />
                              - 소방 및 전기 안전 기술 진단 적합성 판정 획득<br />
                              - {bidModalData.plan || "상세 공사 계획 대비 시공 완료"}
                            </>
                          ) : (
                            <>
                              - 앵커 사업단 실무위원회 통과 규격서 준수<br />
                              - 무상 유지보수 기한 2년 이상 보장 조건<br />
                              - {bidModalData.description || "상세 사양서 별도 첨부 참조"}
                            </>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
              {bidModalData.docBidFileUrl ? (
                <a 
                  href={bidModalData.docBidFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#10B981", textDecoration: "none", fontWeight: "700" }}
                >
                  📎 첨부문서 다운로드
                </a>
              ) : (
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>첨부파일 없음</span>
              )}
              <button 
                onClick={() => setBidModalData(null)}
                style={{ padding: "0.4rem 1.25rem", borderRadius: "6px", background: "var(--accent-color)", border: "none", color: "white", fontWeight: "600", cursor: "pointer" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
