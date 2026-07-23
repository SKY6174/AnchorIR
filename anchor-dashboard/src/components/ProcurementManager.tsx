import React, { useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent as ReactMouseEvent } from "react";
import { Plus, Trash2, ListFilter, ArrowUpDown, X } from "lucide-react";
import { supabase } from "../supabaseClient"; // Supabase 클라이언트 연동 (요건 3 반영)
import * as pdfjsLib from "pdfjs-dist";

// PDF 텍스트 추출을 위한 글로벌 워커 스크립트 연결
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// 1차년도 및 2차년도 단위과제별 연계 프로그램 데이터셋
const PROGRAMS_BY_UNIT: Record<string, Array<{ id: string; name: string }>> = {
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
  ],
  "X0": [
    { id: "COM-1", name: "앵커 사업단 공통 프로그램 기획 및 성과 관리" },
    { id: "COM-2", name: "전체 참여 과제 공유 워크숍 및 혁신 포럼" }
  ]
};

// AI 가상 문서요약 분석 시뮬레이터 함수 (사용자 요구사항 2 반영)
type ProcurementDocumentType = "proposal" | "purchase" | "bid" | "check";
type MilestoneMap = Record<string, string[]>;
type ProcurementFormData = Record<string, any>;

interface ProcurementToast {
  message: string;
  type: string;
}

interface ActivePopover {
  equipId: number | string;
  month: string;
  x: number;
  y: number;
}

const runAiMockAnalysis = (
  docType: ProcurementDocumentType,
  textContent: string,
  itemName: string,
  deptName: string,
  totalPrice: number,
  fileName = ""
) => {
  const randomNo = Math.floor(Math.random() * 900) + 100;
  const priceThousand = totalPrice ? Math.round(totalPrice / 1000) : 120000;
  const fName = (fileName || "").toLowerCase();
  const bodyText = (textContent || "").toLowerCase();
  const iName = (itemName || "").toLowerCase();

  // [AI 실물 문서 요약 추출 자동 연동 분기]
  // 1) 20DoF 로봇 핸드 문서 감지
  if (fName.includes("로봇") || fName.includes("robot") || fName.includes("hand") || 
      bodyText.includes("로봇") || bodyText.includes("robot") || bodyText.includes("hand") || 
      iName.includes("로봇") || iName.includes("robot") || iName.includes("hand")) {
    if (docType === "proposal") {
      return {
        docNo: "앵커사업단운영팀-1883",
        unit: "B2 : AID 역량강화 기반 지역산업 전환 지원",
        dept: "AID-X지원센터",
        itemName: "20DoF 로봇 핸드",
        itemUnit: "대",
        unitPrice: "8.8", // 단가 (백만 원 단위)
        quantity: 2,
        totalPrice: "17.6",
        budget: "518,700천원",
        goals: [
          "지능형 로봇 및 정밀 제어를 위한 하드웨어 실습 인프라 확보",
          "전 학부(과) 참여형 AI·DX 교육과정 개편 및 실습 연계",
          "중소기업 현장 실증형 AI 알고리즘 적용 프로젝트 지원"
        ],
        draftDate: "2026-07-08",
        approveDate: "2026-07-08",
        descriptionPurpose: "IT-OT의 통합 역량을 갖춘 특화 인력을 양성할 수 있으며, 데이터 보안, 장기간 안정적 운용, 유지보수체계의 확립이 중요하며, 이를 통해 연구비 효율성 및 산학 협력의 경쟁력을 확보할 수 있음",
        descriptionPlan: "도입 완료 후 AID-X지원센터 내 정밀 로봇 실습 교육 및 기자재 안정적 운용을 통해 산학 협력 경쟁력을 강화하고 연간 120명 이상의 전문 인력 실습 활용 기대."
      };
    } else if (docType === "purchase") {
      return {
        docNo: "앵커사업단운영팀-1950",
        mgmtNo: "2026-10-00949",
        fromDept: "앵커사업단운영팀",
        toDept: "대학본부 총무팀",
        itemName: "로봇 핸드",
        itemUnit: "대",
        unitPrice: "8.8",
        quantity: 2,
        totalPrice: "17.6",
        unit: "B2",
        budget: "17,600천원",
        specs: [
          "20자유도(DoF) 초정밀 관절 제어 메커니즘 탑재 로봇 핸드",
          "실시간 피드백 센서 및 멀티 모달 파지 알고리즘 호환 보장",
          "2년간 무상 온사이트 하자보증 및 설치 기술지원 제공 조건"
        ],
        draftDate: "2026-07-08",
        approveDate: "2026-07-08",
        descriptionPurpose: "[AI 자동완성] 로봇 핸드 핵심 기자재를 도입하여 지능형 로봇 및 정밀 제어를 위한 IT-OT 통합 하드웨어 실습 인프라를 확보하고 전략 과제를 완성함.",
        descriptionPlan: "도입 완료 후 AID-X지원센터 내 정밀 로봇 실습 교육 및 기자재 안정적 운용을 통해 산학 협력 경쟁력을 강화하고 연간 120명 이상의 전문 인력 실습 활용 기대."
      };
    } else if (docType === "bid") {
      return {
        docNo: "UC-EQ-B-500",
        method: "제한경쟁입찰 (협상에 의한 계약)",
        itemName: "20DoF 로봇 핸드",
        itemUnit: "대",
        unitPrice: "8.8",
        quantity: 2,
        totalPrice: "17.6",
        budget: "17,600천원",
        qualifications: [
          "국가종합전자조달시스템에 조달용 기자재 공급업으로 등록을 필한 업체",
          "로봇 공학 및 자동화 시스템 전문 정품 공급 실적 보유 업체",
          "제조사 정품 공급 증명 및 기술 지원 확약서 제출 가능 업체"
        ],
        deadline: "2026-07-25 18:00"
      };
    } else { // check
      return {
        docNo: "앵커사업단운영팀-2144",
        mgmtNo: "2026-10-00949",
        fromDept: "AID-X지원센터",
        toDept: "대학본부 총무팀",
        itemName: "20DoF 로봇 핸드",
        itemUnit: "대",
        unitPrice: "8.8",
        quantity: 2,
        totalPrice: "17.6",
        budget: "17,600천원",
        specs: [
          "20DoF 관절 파지 제어 정상 작동 및 외관 결함 없음 검수 필",
          "현장 설치 및 실습 매뉴얼 납품 정합성 검증 완료"
        ],
        draftDate: "2026-07-18",
        approveDate: "2026-07-20",
        descriptionPurpose: "[AI 자동완성] 20DoF 로봇 핸드 검수조서에 근거하여 최종 물리 규격 및 정밀 실습 제어 인터페이스 정합성을 검수함.",
        descriptionPlan: "검수 완료 후 AID-X지원센터 내 정밀 로봇 실습 교육 자원으로 즉각 관리 전환 및 운용 개시."
      };
    }
  }

  // 2) A6000 워크스테이션 문서 감지
  if (fName.includes("a6000") || fName.includes("워크스테이션") || fName.includes("workstation") || 
      bodyText.includes("a6000") || bodyText.includes("워크스테이션") || bodyText.includes("workstation") || 
      iName.includes("a6000") || iName.includes("워크스테이션") || iName.includes("workstation")) {
    if (docType === "proposal") {
      return {
        docNo: "UC-EQ-P-110",
        unit: "C2 : 동남권과 함께 성장하는 돌봄생태계, 울산애 구현",
        dept: "AID-X지원센터",
        itemName: "A6000 워크스테이션",
        unitPrice: "29.8",
        quantity: 2,
        totalPrice: "59.6",
        budget: "59,600천원",
        goals: [
          "지역 산업 수요에 부응하는 DX 특화 연구 인력 양성 인프라 구축",
          "초고해상도 딥러닝 연산 환경을 위한 고성능 GPU 노드 탑재",
          "이월사업비 활용 연구 효율 극대화 및 공동 실습 운용"
        ],
        draftDate: "2026-07-06",
        approveDate: "2026-07-08",
        descriptionPurpose: "[AI 자동완성] A6000 워크스테이션 핵심 기자재를 도입하여 초고해상도 딥러닝 연산 환경을 구축하고 DX 특화 연구 역량을 극대화함.",
        descriptionPlan: "AID-X센터 내 DX 특화 연구 및 장기간 안정적인 연산 모델링 환경 운용 및 공동 실습 공간으로 상시 개방 예정."
      };
    } else if (docType === "purchase") {
      return {
        docNo: "UC-EQ-PR-220",
        fromDept: "AID-X지원센터",
        toDept: "대학본부 총무팀",
        itemName: "A6000 워크스테이션",
        unitPrice: "29.8",
        quantity: 2,
        totalPrice: "59.6",
        unit: "C2",
        budget: "59,600천원",
        specs: [
          "NVIDIA RTX A6000 48GB GPU 탑재 고성능 워크스테이션",
          "대용량 연산 처리를 위한 128GB ECC 메모리 및 2TB NVMe SSD",
          "무상 2년 부품 교체 보증 및 운영체제 최적화 기술 지원"
        ],
        draftDate: "2026-07-06",
        approveDate: "2026-07-08",
        descriptionPurpose: "[AI 자동완성] A6000 워크스테이션 핵심 기자재를 도입하여 초고해상도 딥러닝 연산 환경을 구축하고 DX 특화 연구 역량을 극대화함.",
        descriptionPlan: "AID-X센터 내 DX 특화 연구 및 장기간 안정적인 연산 모델링 환경 운용 및 공동 실습 공간으로 상시 개방 예정."
      };
    }
  }

  // 3) Physical AIoT 교육기자재 문서 감지
  if (fName.includes("aiot") || fName.includes("교육기자재") || 
      bodyText.includes("aiot") || bodyText.includes("교육기자재") || 
      iName.includes("aiot") || iName.includes("교육기자재")) {
    if (docType === "proposal") {
      return {
        docNo: "UC-EQ-P-120",
        unit: "B2 : AID 역량강화 기반 지역산업 전환 지원",
        dept: "AID-X지원센터",
        itemName: "Physical AIoT(제조AI) 교육기자재",
        unitPrice: "9.0",
        quantity: 5,
        totalPrice: "45.0",
        budget: "45,000천원",
        goals: [
          "IT-OT 통합 역량을 갖춘 특화 인력 양성을 위한 실습 환경 개편",
          "실감형 데이터 수집 및 엣지 연산 실습 기반 확보",
          "산학 협력 공동 실증 프로젝트 수행 인프라 연동"
        ],
        draftDate: "2026-07-06",
        approveDate: "2026-07-08",
        descriptionPurpose: "[AI 자동완성] Physical AIoT(제조AI) 교육기자재 핵심 장비를 도입하여 실감형 데이터 수집 및 엣지 연산 실습 기반을 확보함.",
        descriptionPlan: "제조AI 연계 실습 교육 및 산학 협력 공동 실증 프로젝트 수행을 위한 실습 및 연구 자원으로 100% 매칭 운용."
      };
    } else if (docType === "purchase") {
      return {
        docNo: "UC-EQ-PR-330",
        fromDept: "AID-X지원센터",
        toDept: "대학본부 총무팀",
        itemName: "Physical AIoT(제조AI) 교육기자재",
        unitPrice: "9.0",
        quantity: 5,
        totalPrice: "45.0",
        unit: "B2",
        budget: "45,000천원",
        specs: [
          "센서 통합 엣지 게이트웨이 및 임베디드 AIoT 실습 모듈 세트",
          "다양한 실시간 데이터 분석 플랫폼 연계 미들웨어 번들 제공",
          "무상 온사이트 유지보수 기한 2년 이상 보증 조건"
        ],
        draftDate: "2026-07-06",
        approveDate: "2026-07-08",
        descriptionPurpose: "[AI 자동완성] Physical AIoT(제조AI) 교육기자재 핵심 장비를 도입하여 실감형 데이터 수집 및 엣지 연산 실습 기반을 확보함.",
        descriptionPlan: "제조AI 연계 실습 교육 및 산학 협력 공동 실증 프로젝트 수행을 위한 실습 및 연구 자원으로 100% 매칭 운용."
      };
    }
  }

  // 4) Physical AI 실습장비 문서 감지
  if (fName.includes("mfec") || fName.includes("실습장비") || 
      bodyText.includes("mfec") || bodyText.includes("실습장비") || 
      iName.includes("mfec") || iName.includes("실습장비")) {
    if (docType === "proposal") {
      return {
        docNo: "UC-EQ-P-130",
        unit: "B2 : AID 역량강화 기반 지역산업 전환 지원",
        dept: "AID-X지원센터",
        itemName: "Physical AI(MFEC) 실습장비",
        unitPrice: "25.0",
        quantity: 8,
        totalPrice: "200.0",
        budget: "200,000천원",
        goals: [
          "지역 산업 연계 DX 혁신 특화 실무 인재 양성 실습실 구축",
          "현장 미러형 AI 융합 제어 인프라 개편 및 성능 극대화",
          "다학제 융합 캡스톤 디자인 교과 연계 장비 활용 활성화"
        ],
        draftDate: "2026-07-06",
        approveDate: "2026-07-08",
        descriptionPurpose: "[AI 자동완성] Physical AI(MFEC) 실습장비 도입을 통해 현장 미러형 AI 융합 제어 인프라를 개편하여 전공 교육 실습 타당성을 확보함.",
        descriptionPlan: "도입 완료 후 AI 융합 실감형 교육 센터 실무 교육 자원으로 100% 매칭하며, 연간 120명 이상의 인력 실습 활용 기대."
      };
    } else if (docType === "purchase") {
      return {
        docNo: "UC-EQ-PR-340",
        fromDept: "AID-X지원센터",
        toDept: "대학본부 총무팀",
        itemName: "Physical AI(MFEC) 실습장비",
        unitPrice: "25.0",
        quantity: 8,
        totalPrice: "200.0",
        unit: "B2",
        budget: "200,000천원",
        specs: [
          "산업용 정밀 머신러닝 연동 다기능 제어 장치 세트",
          "센서 어레이 결합 및 자동 보정 컨트롤 소프트웨어 포함",
          "무상 엔지니어 온사이트 2년 기술 지원 보증"
        ],
        draftDate: "2026-07-06",
        approveDate: "2026-07-08",
        descriptionPurpose: "[AI 자동완성] Physical AI(MFEC) 실습장비 도입을 통해 현장 미러형 AI 융합 제어 인프라를 개편하여 전공 교육 실습 타당성을 확보함.",
        descriptionPlan: "도입 완료 후 AI 융합 실감형 교육 센터 실무 교육 자원으로 100% 매칭하며, 연간 120명 이상의 인력 실습 활용 기대."
      };
    }
  }

  // 5) 기본/폴백 요약 응답
  if (docType === "proposal") {
    return {
      docNo: `UC-EQ-P-${randomNo}`,
      unit: "B2 : AID 역량강화 기반 지역산업 전환 지원",
      dept: deptName || "AID-X지원센터",
      itemName: itemName || "정밀 의료 실습용 고해상도 초음파 진단기",
      unitPrice: totalPrice ? (totalPrice / 1000).toString() : "120",
      quantity: 1,
      totalPrice: totalPrice ? (totalPrice / 1000).toString() : "120",
      budget: `${priceThousand.toLocaleString()}천원`,
      goals: [
        `${itemName || "도입 핵심 기재"} 기반 전문 실무 교육과정 수립`,
        "선진 시뮬레이션 인프라 구축 및 융합 실습 환경 리모델링",
        "지산학 연계 라이즈 사업의 교육 실적 성과 관리 및 모니터링"
      ],
      draftDate: "2026-03-05",
      approveDate: "2026-07-08",
      descriptionPurpose: `[AI 자동완성] ${itemName || "도입 기자재"} 핵심 장비를 도입하여 전략 과제를 완수하고 실무 실습 교육 타당성을 강화함.`,
      descriptionPlan: "도입 완료 후 관련 전공 실무 과정의 주력 실습 장비로 지정하고 매년 100명 이상의 인력 양성에 상시 매칭 활용 예정."
    };
  } else if (docType === "purchase") {
    return {
      docNo: `UC-EQ-PR-${randomNo}`,
      fromDept: deptName || "AID-X지원센터",
      toDept: "대학본부 총무팀",
      itemName: itemName || "정밀 의료 실습용 고해상도 초음파 진단기",
      unitPrice: totalPrice ? (totalPrice / 1000).toString() : "120",
      quantity: 1,
      totalPrice: totalPrice ? (totalPrice / 1000).toString() : "120",
      budget: `${priceThousand.toLocaleString()}천원`,
      specs: [
        `${itemName || "도입 요청 기재"} 핵심 조달 기술 사양 충족 검토`,
        "정밀 제어 칩셋 탑재 및 고정밀 수치 보정 기능 보장",
        "전문 엔지니어 1:1 무상 온사이트 유지보수 기한 2년 이상 보증 조건"
      ],
      draftDate: "2026-03-05",
      approveDate: "2026-07-08",
      descriptionPurpose: `[AI 자동완성] ${itemName || "도입 기자재"} 핵심 장비를 도입하여 전략 과제를 완수하고 실무 실습 교육 타당성을 강화함.`,
      descriptionPlan: "도입 완료 후 관련 전공 실무 과정의 주력 실습 장비로 지정하고 매년 100명 이상의 인력 양성에 상시 매칭 활용 예정."
    };
  } else if (docType === "bid") {
    return {
      docNo: `UC-EQ-B-${randomNo}`,
      method: "제한경쟁입찰 (협상에 의한 계약)",
      itemName: itemName || "정밀 의료 실습용 고해상도 초음파 진단기",
      unitPrice: totalPrice ? (totalPrice / 1000).toString() : "120",
      quantity: 1,
      totalPrice: totalPrice ? (totalPrice / 1000).toString() : "120",
      budget: `${priceThousand.toLocaleString()}천원`,
      qualifications: [
        "국가종합전자조달시스템에 조달용 기자재 공급업으로 등록을 필한 업체",
        "최근 3개년 이내 대학 및 교육기관 대상 관련 실적 유효 보유 업체",
        "신속 사후 관리 A/S 기술 확약서 및 원제조업체 물품공급확약서 제출 가능 업체"
      ],
      deadline: "2026-07-25 18:00"
    };
  } else { // check
    return {
      docNo: `UC-EQ-C-${randomNo}`,
      mgmtNo: `2026-10-00${randomNo}`, // 검수 시 가상 관리번호 생성
      itemName: itemName || "정밀 의료 실습용 고해상도 초음파 진단기",
      unitPrice: totalPrice ? (totalPrice / 1000).toString() : "120",
      quantity: 1,
      totalPrice: totalPrice ? (totalPrice / 1000).toString() : "120",
      budget: `${priceThousand.toLocaleString()}천원`,
      specs: [
        "물품 사양 일치 검수 통과 및 성능 시험 검사 합격",
        "기자재 입고 및 관리 라벨 부착 정상 확인"
      ],
      draftDate: "2026-07-18",
      approveDate: "2026-07-20",
      descriptionPurpose: `[AI 자동완성] ${itemName || "도입 기자재"} 검수조서에 기반하여 성능 규격을 최종 검수함.`,
      descriptionPlan: "검수 완료에 따라 사업단 자산으로 정식 등록 및 실무 활용 개시."
    };
  }
};

// OpenAI GPT API를 직접 호출하는 비동기 함수 (요건 2 반영 및 자동완성 스펙 확장)
const callOpenAiGpt = async (
  docType: ProcurementDocumentType,
  fileName: string,
  textContent: string,
  itemName: string,
  deptName: string,
  totalPrice: number
) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ VITE_OPENAI_API_KEY 환경 변수가 없으므로, 로컬 AI 요약 시뮬레이터로 자동 대체합니다.");
    return runAiMockAnalysis(docType, textContent || fileName, itemName, deptName, totalPrice, fileName);
  }

  const promptMap: Record<string, string> = {
    proposal: `당신은 대학 RISE(앵커) 사업 기획 분석가입니다. 아래 문서정보와 텍스트를 분석하여, 다음 JSON 스키마를 만족하는 요약본을 JSON 모드로 응답하십시오.
    [스키마]:
    {
      "docNo": "기획문서 결재선/시행란 등에서 추출한 시행 문서번호 (예: '앵커사업단운영팀-1883', 문서 상에 시행 번호가 보이지 않으면 UC-EQ-P로 시작하는 고유번호 생성)",
      "unit": "단위과제 코드 (예: B2, C2 등 매칭되는 정확한 코드를 추출)",
      "dept": "주관 부서 또는 학과 명칭",
      "itemName": "핵심 도입 대상 대표 품명 추출",
      "unitPrice": "단가 (백만 원 단위 소수점으로 추출, 예: 8.8)",
      "quantity": "수량 (정수형, 예: 2)",
      "totalPrice": "총액 (백만 원 단위 소수점으로 추출, 예: 17.6)",
      "budget": "과제 배정 예산 총량 (예: 17,600천원 형식)",
      "goals": ["주요 추진 전략 목표 리스트 3가지"],
      "draftDate": "기안일자 및 시행 일자 (예: YYYY-MM-DD 형식, 문서 내의 시행 일자 '2026. 7. 8.' 등에서 추출하여 '2026-07-08'로 표기)",
      "approveDate": "승인일자 및 시행 일자 (예: YYYY-MM-DD 형식, 문서 내의 시행 일자 '2026. 7. 8.' 등에서 추출하여 '2026-07-08'로 표기)",
      "descriptionPurpose": "문서 내의 '가. 구매필요성' 또는 이에 상응하는 도입 목적/필요성 텍스트를 가능한 요약하지 않고 그대로 상세히 추출 (예: 'IT-OT의 통합 역량을 갖춘 특화 인력을 양성할 수 있으며...')",
      "descriptionPlan": "도입 완료 후 활용 및 인력 양성 기대효과 계획 2문장 요약"
    }
    [정보]:
    - 품명: ${itemName || "알 수 없음"}
    - 학과/부서: ${deptName || "사업단"}
    - 예산: ${totalPrice ? (totalPrice / 1000).toLocaleString() + "천원" : "120,000천원"}
    - 원본명: ${fileName}
    - 문서 텍스트: ${textContent || "기재 없음"}`,

    purchase: `당신은 대학 조달 담당자입니다. 아래 구매요청 문서정보를 분석하여, 다음 JSON 스키마를 만족하는 요약본을 JSON 모드로 응답하십시오.
    특히, 문서 상단의 결재란 부근 등에서 '문서번호'와 '관리번호'를 검색하여 반드시 정확하게 추출하십시오.
    [스키마]:
    {
      "docNo": "구매문서 결재란 부근 등에서 추출한 문서번호 (예: '앵커사업단운영팀-1950', 문서 상에 문서번호가 보이지 않으면 UC-EQ-PR로 시작하는 고유번호 생성)",
      "mgmtNo": "구매문서 결재란 부근 등에서 추출한 관리번호 (예: '2026-10-00949', 문서 상에 관리번호가 보이지 않으면 공백 생성)",
      "fromDept": "발신 부서 또는 학과 명칭",
      "toDept": "수신 부서 (보통 대학본부 총무팀)",
      "itemName": "구매 요청하는 대표 기자재 품명 (예: 로봇 핸드)",
      "unitPrice": "단가 (원화 금액을 백만 원 단위 소수점으로 정확하게 추출, 예: 8,800,000원은 8.8)",
      "quantity": "수량 (정수형, 예: 2)",
      "totalPrice": "총액 (원화 금액을 백만 원 단위 소수점으로 정확하게 추출, 예: 17,600,000원은 17.6)",
      "unit": "해당 단위과제 코드 (예: B2, C2 등 정확한 코드 추출)",
      "budget": "도입 소요예산 (예: 17,600천원 형식)",
      "specs": ["조달 위탁 요청 기술 사양 핵심 3가지"],
      "draftDate": "기안일자 (예: YYYY-MM-DD 형식. 특히 문서 내의 '작성일' 또는 '기안일' 항목(예: '작성일 2026년 07월 08일')에서 날짜를 우선적으로 파싱하여 YYYY-MM-DD 형식으로 표기)",
      "approveDate": "최종 결재 승인일자 (예: YYYY-MM-DD 형식, 없으면 2026-07-08 형식 생성)",
      "descriptionPurpose": "기자재 도입 목적 및 타당성 2문장 요약",
      "descriptionPlan": "향후 활용 및 인력 양성 기대효과 계획 2문장 요약"
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
      "itemName": "입찰 대상 대표 기자재 품명",
      "unitPrice": "단가 (백만 원 단위)",
      "quantity": "수량",
      "totalPrice": "총 금액 (백만 원 단위)",
      "budget": "배정 예산 규모 (예: 17,600천원 형식)",
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
    return runAiMockAnalysis(docType, textContent || fileName, itemName, deptName, totalPrice, fileName);
  }
};

// [교육용 주석] Google Gemini API 연동을 위한 클라이언트 사이드 Fetcher
const callGeminiApi = async (promptText: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key missing");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error! Status: ${response.status}`);
  }

  const data = await response.json();
  const resultText = data.candidates[0].content.parts[0].text;
  return JSON.parse(resultText);
};

// [교육용 주석] Google Gemini API 단독 호출을 위한 비동기 분석 함수
// docType: 문서 분류 (proposal/purchase/bid), fileName: 업로드 파일명, textContent: 본문 텍스트
// itemName: 기자재 품명, deptName: 주관 부서/학과명, totalPrice: 총액 규모
const callGeminiSingleAnalysis = async (
  docType: ProcurementDocumentType,
  fileName: string,
  textContent: string,
  itemName: string,
  deptName: string,
  totalPrice: number
) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ VITE_GEMINI_API_KEY 환경 변수가 없으므로, 로컬 AI 요약 시뮬레이터로 자동 대체합니다.");
    return runAiMockAnalysis(docType, textContent || fileName, itemName, deptName, totalPrice, fileName);
  }

  // GPT-4o 분석 프롬프트와 동일한 스키마 및 가이드를 Gemini 모델에 맞춰 전달
  const promptMap: Record<string, string> = {
    proposal: `당신은 대학 RISE(앵커) 사업 기획 분석가입니다. 아래 문서정보와 텍스트를 분석하여, 다음 JSON 스키마를 만족하는 요약본을 JSON 모드로 응답하십시오.
    [스키마]:
    {
      "docNo": "기획문서 결재선/시행란 등에서 추출한 시행 문서번호 (예: '앵커사업단운영팀-1883', 문서 상에 시행 번호가 보이지 않으면 UC-EQ-P로 시작하는 고유번호 생성)",
      "unit": "단위과제 코드 (예: B2, C2 등 매칭되는 정확한 코드를 추출)",
      "dept": "주관 부서 또는 학과 명칭",
      "itemName": "핵심 도입 대상 대표 품명 추출",
      "unitPrice": "단가 (백만 원 단위 소수점으로 추출, 예: 8.8)",
      "quantity": "수량 (정수형, 예: 2)",
      "totalPrice": "총액 (백만 원 단위 소수점으로 추출, 예: 17.6)",
      "budget": "과제 배정 예산 총량 (예: 17,600천원 형식)",
      "goals": ["주요 추진 전략 목표 리스트 3가지"],
      "draftDate": "기안일자 및 시행 일자 (예: YYYY-MM-DD 형식, 문서 내의 시행 일자 '2026. 7. 8.' 등에서 추출하여 '2026-07-08'로 표기)",
      "approveDate": "승인일자 및 시행 일자 (예: YYYY-MM-DD 형식, 문서 내의 시행 일자 '2026. 7. 8.' 등에서 추출하여 '2026-07-08'로 표기)",
      "descriptionPurpose": "문서 내의 '가. 구매필요성' 또는 이에 상응하는 도입 목적/필요성 텍스트를 가능한 요약하지 않고 그대로 상세히 추출 (예: 'IT-OT의 통합 역량을 갖춘 특화 인력을 양성할 수 있으며...')",
      "descriptionPlan": "도입 완료 후 활용 및 인력 양성 기대효과 계획 2문장 요약"
    }
    [정보]:
    - 품명: ${itemName || "알 수 없음"}
    - 학과/부서: ${deptName || "사업단"}
    - 예산: ${totalPrice ? (totalPrice / 1000).toLocaleString() + "천원" : "120,000천원"}
    - 원본명: ${fileName}
    - 문서 텍스트: ${textContent || "기재 없음"}`,

    purchase: `당신은 대학 조달 담당자입니다. 아래 구매요청 문서정보를 분석하여, 다음 JSON 스키마를 만족하는 요약본을 JSON 모드로 응답하십시오.
    특히, 문서 상단의 결재란 부근 등에서 '문서번호'와 '관리번호'를 검색하여 반드시 정확하게 추출하십시오.
    [스키마]:
    {
      "docNo": "구매문서 결재란 부근 등에서 추출한 문서번호 (예: '앵커사업단운영팀-1950', 문서 상에 문서번호가 보이지 않으면 UC-EQ-PR로 시작하는 고유번호 생성)",
      "mgmtNo": "구매문서 결재란 부근 등에서 추출한 관리번호 (예: '2026-10-00949', 문서 상에 관리번호가 보이지 않으면 공백 생성)",
      "fromDept": "발신 부서 또는 학과 명칭",
      "toDept": "수신 부서 (보통 대학본부 총무팀)",
      "itemName": "구매 요청하는 대표 기자재 품명 (예: 로봇 핸드)",
      "unitPrice": "단가 (원화 금액을 백만 원 단위 소수점으로 정확하게 추출, 예: 8,800,000원은 8.8)",
      "quantity": "수량 (정수형, 예: 2)",
      "totalPrice": "총액 (원화 금액을 백만 원 단위 소수점으로 정확하게 추출, 예: 17,600,000원은 17.6)",
      "unit": "해당 단위과제 코드 (예: B2, C2 등 정확한 코드 추출)",
      "budget": "도입 소요예산 (예: 17,600천원 형식)",
      "specs": ["조달 위탁 요청 기술 사양 핵심 3가지"],
      "draftDate": "기안일자 (예: YYYY-MM-DD 형식. 특히 문서 내의 '작성일' 또는 '기안일' 항목(예: '작성일 2026년 07월 08일')에서 날짜를 우선적으로 파싱하여 YYYY-MM-DD 형식으로 표기)",
      "approveDate": "최종 결재 승인일자 (예: YYYY-MM-DD 형식, 없으면 2026-07-08 형식 생성)",
      "descriptionPurpose": "기자재 도입 목적 및 타당성 2문장 요약",
      "descriptionPlan": "향후 활용 및 인력 양성 기대효과 계획 2문장 요약"
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
      "itemName": "입찰 대상 대표 기자재 품명",
      "unitPrice": "단가 (백만 원 단위)",
      "quantity": "수량",
      "totalPrice": "총 금액 (백만 원 단위)",
      "budget": "배정 예산 규모 (예: 17,600천원 형식)",
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
    return await callGeminiApi(promptMap[docType]);
  } catch (error) {
    console.error("❌ Gemini API 단독 분석 실패, 로컬 시뮬레이터로 대체합니다:", error);
    return runAiMockAnalysis(docType, textContent || fileName, itemName, deptName, totalPrice, fileName);
  }
};

// [교육용 주석] API Key가 없을 시 동작하는 가상 AI Debate 모의 시뮬레이터 (교육적 연출 효과 극대화)
const runAiDebateMock = (
  docType: ProcurementDocumentType,
  fileName: string,
  textContent: string,
  itemName: string,
  deptName: string,
  totalPrice: number
) => {
  console.log("🤖 [AI Debate Simulator] GPT-4o: '기본 초안을 빌드하고 있습니다.'");
  console.log("🤖 [AI Debate Simulator] Gemini: '전략 목표 중 산학 네트워크 강화를 보강할 필요가 있어 보입니다.'");
  console.log("🤖 [AI Debate Simulator] GPT-4o: '동의합니다. 2차 보완 및 최종 합의안을 작성 완료했습니다.'");

  const result = runAiMockAnalysis(docType, textContent, itemName, deptName, totalPrice, fileName);
  result.docNo = result.docNo + " (Debate합의)";
  return result;
};

// [교육용 주석] GPT-4o와 Gemini API 간의 상호 토론(Debate) 및 합의 도출 로직 (프롬프트 고도화)
const callDebateAiAnalysis = async (
  docType: ProcurementDocumentType,
  fileName: string,
  textContent: string,
  itemName: string,
  deptName: string,
  totalPrice: number
) => {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!openaiKey || !geminiKey) {
    console.warn("⚠️ API Key 중 일부가 누락되어 가상 AI Debate 시뮬레이션으로 대체합니다.");
    return runAiDebateMock(docType, fileName, textContent, itemName, deptName, totalPrice);
  }

  try {
    console.log("🤖 [AI Debate] 1단계: GPT-4o 분석 초안 생성 시작...");
    const gptDraft = await callOpenAiGpt(docType, fileName, textContent, itemName, deptName, totalPrice);
    console.log("GPT-4o 초안 완성:", gptDraft);

    console.log("🤖 [AI Debate] 2단계: Google Gemini 검토 및 피드백 개입...");
    const geminiPrompt = `당신은 대학 조달/기획 전문가(Google Gemini)입니다. 
    다음은 파트너 모델(GPT-4o)이 분석해낸 조달문서 1차 요약 초안입니다:
    ${JSON.stringify(gptDraft, null, 2)}

    다음 정보를 기반으로 위 초안에 오류, 누락(특히 예산 오기입, 추진과제 정합성, 날짜 순서)이 없는지 검토하십시오.
    [원본 문서 정보]:
    - 문서명: ${fileName}
    - 품명: ${itemName || "알 수 없음"}
    - 학과/부서: ${deptName || "사업단 협업"}
    - 추정 총액: ${totalPrice ? (totalPrice / 1000).toLocaleString() + "천원" : "미정"}
    - 본문 텍스트: ${textContent || "기재 없음"}

    검토 결과를 반영하여, 수정 보완된 최종 JSON 스펙으로만 응답해 주십시오. JSON 이외의 사설을 적지 마십시오.
    반드시 다음 JSON 형식 스키마를 따르십시오:
    ${docType === 'proposal' ? `{
      "docNo": "기결재번호",
      "unit": "단위과제코드 (예: B2, C2 등 정확하게 추출)",
      "dept": "주관부서",
      "itemName": "대표 품명",
      "unitPrice": "단가 (백만 원 단위)",
      "quantity": "수량",
      "totalPrice": "총액 (백만 원 단위)",
      "budget": "예산액 (천원 단위)",
      "goals": ["목표 3가지"],
      "draftDate": "기안일자(YYYY-MM-DD)",
      "approveDate": "승인일자(YYYY-MM-DD)",
      "descriptionPurpose": "도입 목적 및 타당성 2문장 요약",
      "descriptionPlan": "향후 활용 계획 및 기대효과 2문장 요약"
    }` : docType === 'bid' ? `{
      "docNo": "입찰결재번호",
      "method": "입찰계약방식",
      "itemName": "대표 품명",
      "unitPrice": "단가 (백만 원 단위)",
      "quantity": "수량",
      "totalPrice": "총액 (백만 원 단위)",
      "budget": "예산액 (천원 단위)",
      "qualifications": ["참가 자격 및 제한사항 3가지"],
      "deadline": "입찰마감일시(YYYY-MM-DD HH:MM)"
    }` : `{
      "docNo": "구매결재번호",
      "fromDept": "발신부서",
      "toDept": "수신부서",
      "itemName": "대표 품명",
      "unitPrice": "단가 (백만 원 단위)",
      "quantity": "수량",
      "totalPrice": "총액 (백만 원 단위)",
      "budget": "예산액 (천원 단위)",
      "specs": ["기술규격 3가지"],
      "draftDate": "기안일자(YYYY-MM-DD)",
      "approveDate": "승인일자(YYYY-MM-DD)",
      "descriptionPurpose": "도입 목적 및 타당성 요약",
      "descriptionPlan": "향후 활용 계획 요약"
    }`}`;

    const geminiResponse = await callGeminiApi(geminiPrompt);
    console.log("Gemini 피드백 및 조율안:", geminiResponse);

    console.log("🤖 [AI Debate] 3단계: 두 에이전트 간 합의 최종 조율...");
    const consensusPrompt = `당신은 최종 조율 위원장 AI입니다.
    GPT-4o의 초안 요약과 Google Gemini의 보완 검토안을 상호 비교하여, 행정 문서로서 가장 정교하고 빈틈없는 최종 조달 보고서 JSON을 만드십시오.
    
    - GPT-4o 초안: ${JSON.stringify(gptDraft)}
    - Gemini 검토안: ${JSON.stringify(geminiResponse)}
    
    두 모델의 장점을 융합하고 오류를 배제한 최종 JSON 요약본을 출력해주십시오. 사설을 생략하고 순수 JSON 객체만 리턴하십시오.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a master consensus compiler that output JSON format." },
          { role: "user", content: consensusPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    const resData = await response.json();
    const finalResult = JSON.parse(resData.choices[0].message.content);
    console.log("🤖 [AI Debate] 최종 합의 요약본:", finalResult);
    return finalResult;
    
  } catch (error) {
    console.error("❌ AI Debate 과정 중 에러 발생, 모의 디베이트로 복구 진행:", error);
    return runAiDebateMock(docType, fileName, textContent, itemName, deptName, totalPrice);
  }
};

// Supabase Storage 업로드 및 Public URL 반환 함수 (요건 3 반영)
const uploadFileToSupabase = async (
  docType: ProcurementDocumentType,
  file: File,
  onProgress?: (progress: number) => void
) => {
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
    const { data: _data, error } = await supabase.storage
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
  } catch {
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

const _defaultEquipments = [
  { id: 1, unit: "A1", seq: 1, deptName: "간호학부", divisionName: "", itemName: "스마트 환자 시뮬레이터 (중환자 케어 실습 장비)", spec: "임상 실무 교육용 다기능 스마트 시뮬레이터 시스템", itemUnit: "대", unitPrice: 120000000, quantity: 1, description: "글로벌 앵커 혁신 교육과정 임상 실습 고도화 핵심 기기", operation: "글로컬 앵커 교육과정 고도화", password: "1234",
    dateP: "2025-03-10", dateA: "2025-04-15", dateB: "2025-06-12", datePr: "2025-07-20", dateI: "2025-09-05"
  },
  { id: 2, unit: "A2", seq: 2, deptName: "화학공학과", divisionName: "", itemName: "정밀 화학 분석 크로마토그래피 시스템", spec: "고해상도 다기능 컬럼 크로마토그래피 일체형 세트", itemUnit: "세트", unitPrice: 245000000, quantity: 1, description: "신산업 저탄소 에너지 트랙 화학 정밀 분석 실습 장비", operation: "지역 특화 산업 맞춤형 실무 인재 양성", password: "1234",
    dateP: "2025-03-15", dateA: "2025-04-20", dateB: "2025-06-18", datePr: "2025-07-25", dateI: "2025-09-10"
  },
  { id: 3, unit: "B1", seq: 3, deptName: "컴퓨터공학과", divisionName: "", itemName: "AI 알고리즘 모델링 연산용 고성능 GPU 워크스테이션", spec: "NVIDIA RTX 6000 Ada 48GB 탑재 고성능 하이엔드 서버급", itemUnit: "대", unitPrice: 15000000, quantity: 3, description: "RCC 특화산업 AI 융합 실감형 교육 센터 실무 교육 지원", operation: "지역 정주형 취창업 지원 프로그램", password: "1234",
    dateP: "2025-03-12", dateA: "2025-04-18", dateB: "", datePr: "2025-06-25", dateI: "2025-08-14"
  },
  { id: 4, unit: "B2", seq: 4, deptName: "기계공학부", divisionName: "", itemName: "스마트 팩토리 모듈 제어 및 3D 정밀 프린팅 모듈", spec: "스마트 팩토리 연동 고정밀 3D 적층 제조 실습 패키지", itemUnit: "세트", unitPrice: 38000000, quantity: 1, description: "지산학 연계 제조 혁신 엔지니어 교육 기자재", operation: "신산업 선도형 글로벌 직업 교육 브랜드 구축", password: "1234",
    dateP: "2025-03-20", dateA: "2025-05-15", dateB: "2025-06-08", datePr: "2025-06-20", dateI: "2025-08-18"
  },
  { id: 5, unit: "B3", seq: 5, deptName: "전기전자공학부", divisionName: "", itemName: "반도체 임베디드 코딩 및 고정밀 계측 오실로스코프", spec: "4채널 500MHz 주파수 대역 고정밀 계측 장비", itemUnit: "대", unitPrice: 8500000, quantity: 4, description: "반도체 전공 대학 연계 실무 미러형 교육 설계용 장비", operation: "지역 사회 문제 해결 및 나눔 실천", password: "1234",
    dateP: "2025-03-25", dateA: "2025-04-28", dateB: "2025-06-05", datePr: "2025-06-18", dateI: "2025-08-20"
  },
  { id: 6, unit: "B4", seq: 6, deptName: "유아교육과", divisionName: "", itemName: "늘봄 연계 창의 놀이 실증용 스마트 인터랙티브 디스플레이", spec: "86인치 UHD 해상도 정밀 멀티 터치 스마트 전자칠판", itemUnit: "대", unitPrice: 8500000, quantity: 2, description: "에듀테크 기반 창의적 교육 콘텐츠 제작 교육 과정 운영", operation: "소외 계층 맞춤형 교육 서비스 및 장학", password: "1234",
    dateP: "2025-03-18", dateA: "2025-05-10", dateB: "", datePr: "2025-06-24", dateI: "2025-08-25"
  },
  { id: 7, unit: "C1", seq: 7, deptName: "컴퓨터공학과", divisionName: "", itemName: "다목적 6축 소형 스마트 교육용 협동 로봇 머니퓰레이터", spec: "페이로드 3kg급 정밀 실무 실습용 6축 관절 제어 시스템", itemUnit: "대", unitPrice: 28000000, quantity: 1, description: "미래 지능형 로봇 운용/제어 교과목 현장 중심 실습", operation: "대학 연구 역량 강화 및 원천 기술 개발", password: "1234",
    dateP: "2025-03-22", dateA: "2025-05-12", dateB: "2025-06-15", datePr: "2025-06-28", dateI: "2025-08-28"
  },
  { id: 8, unit: "C2", seq: 8, deptName: "반려동물보건과", divisionName: "", itemName: "동물 전용 디지털 초음파 진단 장치", spec: "수의 임상 실습 특화 15인치 컬러 도플러 초음파 진단기", itemUnit: "대", unitPrice: 19000000, quantity: 1, description: "신설학과 실무 미러형 임상 실습실 조달 품목", operation: "산학 공동 기술 개발 및 연구 센터 운영", password: "1234",
    dateP: "2025-04-10", dateA: "2025-05-20", dateB: "2025-06-18", datePr: "2025-07-15", dateI: "2025-09-12"
  },
  { id: 9, unit: "D1", seq: 9, deptName: "조선해양시스템공학과", divisionName: "", itemName: "미래 친환경선박 가상 운항 교육 시뮬레이터", spec: "VR 연동 친환경 추진선박 조타 시뮬레이터 엔진 포함 패키지", itemUnit: "세트", unitPrice: 45000000, quantity: 1, description: "5극3특 가상 운항 실습 교육 과정 지원용 장비", operation: "지역 평생 교육 포털 구축 및 운영", password: "1234",
    dateP: "2025-03-08", dateA: "2025-05-08", dateB: "2025-07-10", datePr: "2025-08-20", dateI: "2025-11-15"
  },
  { id: 10, unit: "D2", seq: 10, deptName: "물리치료학과", divisionName: "", itemName: "메디컬 스킨케어 다기능 뷰티 디바이스", spec: "초음파∙고주파∙이온토포레시스 멀티 일체형 실습 기기", itemUnit: "대", unitPrice: 6500000, quantity: 5, description: "웰니스 뷰티 케어 실습 및 지역 상생 뷰티 아카데미 활용", operation: "성인 학습자 대상 취창업 역량 강화 패키지", password: "1234",
    dateP: "2025-03-14", dateA: "2025-04-24", dateB: "", datePr: "2025-06-22", dateI: "2025-08-29"
  }
];

export interface ProcurementItem {
  id?: number | string;
  unit: string;
  seq?: number;
  deptName?: string;
  divisionName?: string;
  itemName?: string;
  spec?: string;
  itemUnit?: string;
  unitPrice?: number;
  quantity?: number;
  description?: string;
  operation?: string;
  password?: string;
  dateP?: string;
  dateA?: string;
  dateB?: string;
  datePr?: string;
  dateI?: string;
  [key: string]: any;
}

// 백만원 단위 포맷팅 헬퍼 함수 (소수점 첫째자리까지 표현 및 천단위 쉼표 추가)
const formatToMillionWon = (value?: number | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0.0";
  return (value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// 천원 단위 포맷팅 헬퍼 함수 (정수 표현 및 천단위 쉼표 추가)
const formatToThousandWon = (value?: number | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return (value / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 });
};

// 백만원 문자열 예산 데이터를 천원 단위 형식으로 동적 환산해 주는 파싱 헬퍼 함수
const convertMillionWonToThousandWon = (budgetStr?: string | null): string => {
  if (!budgetStr) return "0천원";
  const numOnly = parseFloat(budgetStr.replace(/,/g, "").replace(/[^0-9.]/g, ""));
  if (isNaN(numOnly)) return budgetStr;
  const thousandWonVal = Math.round(numOnly * 1000);
  return thousandWonVal.toLocaleString() + "천원";
};

// 날짜 데이터를 기반으로 3월~2월 캘린더 구매단계(P, A, B, Pr, I) 매핑 헬퍼 함수 (4번 요건 대응)
const getMilestonesFromDates = (item: ProcurementItem, activeYear: number | string): MilestoneMap => {
  const milestones: MilestoneMap = { "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [], "11": [], "12": [], "1": [], "2": [] };
  const baseYear = 2024 + Number(activeYear || 1); // 1차년도: 2025, 2차년도: 2026
  
  const checkAndAdd = (dateStr: string | undefined, phaseCode: string) => {
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

// [교육용 한글 주석] 기자재 전용 날짜 마일스톤 매핑 헬퍼 함수 (PA, Pr, BC, I 매핑)
const _getMilestonesFromDatesEquip = (item: ProcurementItem, activeYear: number | string): MilestoneMap => {
  const milestones: MilestoneMap = { "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [], "11": [], "12": [], "1": [], "2": [] };
  const baseYear = 2024 + Number(activeYear || 1); // 1차년도: 2025, 2차년도: 2026
  
  const checkAndAdd = (dateStr: string | undefined, phaseCode: string) => {
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
  
  checkAndAdd(item.dateP, "PA");  // 기획∙승인(PA) 시작
  checkAndAdd(item.datePr, "Pr"); // 구매신청(Pr)
  checkAndAdd(item.dateB, "BC");  // 입찰∙계약(BC)
  checkAndAdd(item.dateI, "I");   // 검수(I)
  
  return milestones;
};

// 단계별 입력 일정 순차 및 사업연차 적합성 검증 헬퍼 함수 (연차-단계별 일자 연계)
const validateDatesChronological = (
  yearVal: number | string,
  dateP: string,
  dateA: string,
  dateB: string,
  datePr: string,
  dateI: string
) => {
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

// [교육용 한글 주석] 기자재 전용 단계별 입력 일정 순차 및 사업연차 적합성 검증 헬퍼 함수
const validateDatesChronologicalEquip = (
  yearVal: number | string,
  dateP: string,
  datePr: string,
  dateB: string,
  dateI: string
) => {
  const targetYear = Number(yearVal) || 1; // 1차년도 또는 2차년도
  
  // 1) 사업연차별 유효기간 논리 범위 정의
  const baseStart = targetYear === 1 ? new Date("2025-03-01") : new Date("2026-03-01");
  const baseEnd = targetYear === 1 ? new Date("2026-02-29") : new Date("2027-02-28");
  const periodStr = targetYear === 1 ? "'25.3월 ~ '26.2월" : "'26.3월 ~ '27.2월";

  const dates = [
    { name: "기획∙승인(PA)", val: dateP },
    { name: "구매신청(Pr)", val: datePr },
    { name: "입찰∙계약(BC)", val: dateB },
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
const PROPOSAL_SUMMARIES: Record<string, {
  title: string;
  dept: string;
  goals: string[];
  budget: string;
}> = {
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
const getMilestoneArray = (val: string | string[] | null | undefined): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
};

// 12개월 일정 마일스톤 가중치 공용 맵 선언 (ReferenceError 방어)
const phaseWeight = { 
  "P": 1, "A": 2, "B": 3, "Pr": 4, "I": 5,
  "Rq": 1, "DR": 2, "PDR": 2, "DL": 3, "BC": 4, "CS": 5
};

export interface ProcurementManagerProps {
  currentRole?: any;
  currentUser?: any;
  selectedYear?: number | string;
  setSelectedYear?: (year: any) => void;
  subTab?: string;
  onChangeSubTab?: (subTab: string) => void;
  envData?: ProcurementItem[];
  setEnvData?: React.Dispatch<React.SetStateAction<ProcurementItem[]>>;
  equipData?: ProcurementItem[];
  setEquipData?: React.Dispatch<React.SetStateAction<ProcurementItem[]>>;
  serviceData?: ProcurementItem[];
  setServiceData?: React.Dispatch<React.SetStateAction<ProcurementItem[]>>;
  projects?: any[];
  darkMode?: boolean;
}

export default function ProcurementManager({
  currentRole,
  currentUser,
  selectedYear,
  setSelectedYear,
  subTab,
  onChangeSubTab: _onChangeSubTab,
  envData = [],
  setEnvData = () => undefined,
  equipData = [],
  setEquipData = () => undefined,
  serviceData = [],
  setServiceData = () => undefined,
  projects = [],
  darkMode = true
}: ProcurementManagerProps) {
  const monthsOrder = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2"];

  // 날짜 문자열로부터 해당 연도 회계연도 기준(3월~익년2월) 월 인덱스(0~11)를 반환하는 로컬 헬퍼
  const getMonthIndex = (dateStr?: string | null) => {
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

  // 토스트 상태 추가
  const [toast, setToast] = useState<ProcurementToast | null>(null);
  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  // 모달 제어 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState("env"); // "env", "equip", "service"
  
  // 수정 모드 상태 추가 (2번 요건 대응)
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | string | null>(null);

  // 기획문서, 구매문서 및 입찰문서 팝업용 상태 추가 (사용자 요건 3 대응)
  const [proposalModalData, setProposalModalData] = useState<any>(null);
  const [purchaseModalData, setPurchaseModalData] = useState<any>(null);
  const [bidModalData, setBidModalData] = useState<any>(null);

  // 다중 파일 업로드 지원에 따른 팝업 내 현재 뷰어 대상 인덱스 상태
  const [selectedProposalIdx, setSelectedProposalIdx] = useState(0);
  const [selectedPurchaseIdx, setSelectedPurchaseIdx] = useState(0);

  // 학과 및 부서 필터 이원화 및 정렬 상태 (3번 요건 대응)
  const [deptFilter, setDeptFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [sortField, setSortField] = useState("seq"); // 기본값 순번
  const [sortDirection, setSortDirection] = useState("asc"); // 기본값 오름차순

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // 환경개선 상세 팝업 상태
  const [_selectedEnvItem, _setSelectedEnvItem] = useState<ProcurementItem | null>(null);

  // 기자재 탭 단위과제 필터 상태
  const [selectedEquipUnit, setSelectedEquipUnit] = useState("ALL");

  // 월별 마일스톤 멀티 체크 팝오버 상태
  const [activePopover, setActivePopover] = useState<ActivePopover | null>(null); // { equipId, month, x, y }

  // AI 분석 및 업로드 상태 제어
  const [_isAnalyzingPlan, _setIsAnalyzingPlan] = useState(false);
  const [_isAnalyzingPurchase, _setIsAnalyzingPurchase] = useState(false);
  const [isAnalyzingBid, setIsAnalyzingBid] = useState(false);

  // 업로드 진행률 상태 제어 (0% ~ 100%)
  const [_uploadProgressPlan, setUploadProgressPlan] = useState(0);
  const [_uploadProgressPurchase, setUploadProgressPurchase] = useState(0);
  const [_uploadProgressBid, setUploadProgressBid] = useState(0);

  // AI 분석 모델 엔진 선택 상태 (gemini, gpt, debate)
  const [aiEngine, setAiEngine] = useState("debate");

  // 4. 입력 폼 임시 State
  const [formData, setFormData] = useState<ProcurementFormData>({
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

  // [교육용 주석] 1대N 관계 구축을 위한 기존 기획문서 자동 파싱 라이브러리 추출
  const getUniqueProposalDocs = () => {
    const list: any[] = [];
    const seenDocNos = new Set<string>();

    // 1. equipData (기자재 데이터) 순회하며 고유 기획문서 추출
    (equipData || []).forEach(item => {
      if (item.docPlanFileList && Array.isArray(item.docPlanFileList)) {
        item.docPlanFileList.forEach((file: any) => {
          if (file.aiData && file.aiData.docNo && !seenDocNos.has(file.aiData.docNo)) {
            seenDocNos.add(file.aiData.docNo);
            list.push({ docNo: file.aiData.docNo, name: file.name, size: file.size, url: file.url, aiData: file.aiData });
          }
        });
      } else if (item.aiProposalData && item.aiProposalData.docNo && !seenDocNos.has(item.aiProposalData.docNo)) {
        seenDocNos.add(item.aiProposalData.docNo);
        list.push({ docNo: item.aiProposalData.docNo, name: item.docPlanFileName || `기획결재 (${item.aiProposalData.docNo})`, size: item.docPlanFileSize || 0, url: item.docPlanFileUrl || "", aiData: item.aiProposalData });
      } else if (item.docPlan && !seenDocNos.has(item.docPlan)) {
        seenDocNos.add(item.docPlan);
        list.push({ docNo: item.docPlan, name: item.docPlanFileName || `기획결재 (${item.docPlan})`, size: item.docPlanFileSize || 0, url: item.docPlanFileUrl || "", aiData: item.aiProposalData || null });
      }
    });

    // 2. serviceData (용역 데이터) 순회하며 고유 기획문서 추출
    (serviceData || []).forEach(item => {
      if (item.docPlanFileList && Array.isArray(item.docPlanFileList)) {
        item.docPlanFileList.forEach((file: any) => {
          if (file.aiData && file.aiData.docNo && !seenDocNos.has(file.aiData.docNo)) {
            seenDocNos.add(file.aiData.docNo);
            list.push({ docNo: file.aiData.docNo, name: file.name, size: file.size, url: file.url, aiData: file.aiData });
          }
        });
      } else if (item.aiProposalData && item.aiProposalData.docNo && !seenDocNos.has(item.aiProposalData.docNo)) {
        seenDocNos.add(item.aiProposalData.docNo);
        list.push({ docNo: item.aiProposalData.docNo, name: item.docPlanFileName || `기획결재 (${item.aiProposalData.docNo})`, size: item.docPlanFileSize || 0, url: item.docPlanFileUrl || "", aiData: item.aiProposalData });
      } else if (item.docPlan && !seenDocNos.has(item.docPlan)) {
        seenDocNos.add(item.docPlan);
        list.push({ docNo: item.docPlan, name: item.docPlanFileName || `기획결재 (${item.docPlan})`, size: item.docPlanFileSize || 0, url: item.docPlanFileUrl || "", aiData: item.aiProposalData || null });
      }
    });

    // 3. envData (환경개선 데이터) 순회
    (envData || []).forEach(item => {
      if (item.docPlanFileList && Array.isArray(item.docPlanFileList)) {
        item.docPlanFileList.forEach((file: any) => {
          if (file.aiData && file.aiData.docNo && !seenDocNos.has(file.aiData.docNo)) {
            seenDocNos.add(file.aiData.docNo);
            list.push({ docNo: file.aiData.docNo, name: file.name, size: file.size, url: file.url, aiData: file.aiData });
          }
        });
      } else if (item.aiProposalData && item.aiProposalData.docNo && !seenDocNos.has(item.aiProposalData.docNo)) {
        seenDocNos.add(item.aiProposalData.docNo);
        list.push({ docNo: item.aiProposalData.docNo, name: item.docPlanFileName || `기획결재 (${item.aiProposalData.docNo})`, size: item.docPlanFileSize || 0, url: item.docPlanFileUrl || "", aiData: item.aiProposalData });
      } else if (item.docPlan && !seenDocNos.has(item.docPlan)) {
        seenDocNos.add(item.docPlan);
        list.push({ docNo: item.docPlan, name: item.docPlanFileName || `기획결재 (${item.docPlan})`, size: item.docPlanFileSize || 0, url: item.docPlanFileUrl || "", aiData: item.aiProposalData || null });
      }
    });

    return list;
  };

  // [교육용 주석] 1대N 관계 구축을 위한 기존 기획 결재 연계 적용 함수
  const handleSelectLegacyProposal = (docNo: string) => {
    if (!docNo) return;
    const uniqueDocs = getUniqueProposalDocs();
    const matched = uniqueDocs.find(d => d.docNo === docNo);
    
    if (matched) {
      setFormData(prev => {
        const legacyItem = {
          id: "shared-" + matched.docNo + "-" + Math.random().toString(36).substr(2, 5),
          name: matched.name,
          size: matched.size,
          url: matched.url,
          aiData: matched.aiData,
          fileObj: null, // 실제 파일 업로드 우회
          uploadProgress: 100,
          isAnalyzing: false
        };

        const currentList = prev.docPlanFileList ? [...prev.docPlanFileList] : [];
        // 기획 결재 문서 중복 삽입 방지 검사
        if (!currentList.some((item: any) => (item.aiData?.docNo === matched.docNo) || (item.name === matched.name))) {
          currentList.push(legacyItem);
        }

        // 호환성을 위해 첫 번째 인덱스의 기획결재 정보를 동기화
        return {
          ...prev,
          docPlanFileList: currentList,
          docPlanFileName: currentList[0]?.name || "",
          docPlanFileSize: currentList[0]?.size || 0,
          docPlanFileUrl: currentList[0]?.url || "",
          aiProposalData: currentList[0]?.aiData || null,
          docPlan: currentList[0]?.aiData?.docNo || ""
        };
      });
      showToast(`🔗 기획결재 [${docNo}] 문서가 현재 구매 항목과 정상 연계되었습니다.`);
    }
  };

  // 파일 업로드 관련 핸들러들 (다중 파일 업로드 요건 전격 반영)
  const handleFileChange = (docType: ProcurementDocumentType, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let listKey = "";
    let fieldPrefix = "";
    if (docType === "proposal") {
      listKey = "docPlanFileList";
      fieldPrefix = "docPlan";
    } else if (docType === "purchase") {
      listKey = "docPurchaseFileList";
      fieldPrefix = "docPurchase";
    } else if (docType === "bid") {
      listKey = "docBidFileList";
      fieldPrefix = "docBid";
    } else if (docType === "check") {
      listKey = "docCheckFileList";
      fieldPrefix = "docCheck";
    }

    if (listKey) {
      const newFileItem = {
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        name: file.name,
        size: file.size,
        fileObj: file, // 실제 업로드할 바이너리 파일 객체
        url: "",
        aiData: null,
        uploadProgress: 0,
        isAnalyzing: false
      };

      setFormData(prev => {
        const currentList = prev[listKey] ? [...prev[listKey], newFileItem] : [newFileItem];
        return {
          ...prev,
          [listKey]: currentList,
          // 하위 호환성 유지: 첫 번째 등록 파일의 메타데이터를 기본 단일 필드에 자동 바인딩
          [`${fieldPrefix}FileName`]: currentList[0]?.name || "",
          [`${fieldPrefix}FileSize`]: currentList[0]?.size || 0
        };
      });

      // 동일 파일을 지웠다가 다시 선택하는 경우에 대응하기 위해 인풋값 초기화
      e.target.value = "";
    }
  };

  const handleFileRemove = (docType: ProcurementDocumentType, fileId: number | string) => {
    let listKey = "";
    let fieldPrefix = "";
    let aiKey = "";
    if (docType === "proposal") {
      listKey = "docPlanFileList";
      fieldPrefix = "docPlan";
      aiKey = "Proposal";
    } else if (docType === "purchase") {
      listKey = "docPurchaseFileList";
      fieldPrefix = "docPurchase";
      aiKey = "Purchase";
    } else if (docType === "bid") {
      listKey = "docBidFileList";
      fieldPrefix = "docBid";
      aiKey = "Bid";
    } else if (docType === "check") {
      listKey = "docCheckFileList";
      fieldPrefix = "docCheck";
      aiKey = "Check";
    }

    if (listKey && fileId) {
      setFormData(prev => {
        const currentList = (prev[listKey] || []).filter((item: any) => item.id !== fileId);
        return {
          ...prev,
          [listKey]: currentList,
          // 하위 호환성: 제거 후 남은 첫 번째 파일 정보로 상위 메타 덮어쓰기
          [`${fieldPrefix}FileName`]: currentList[0]?.name || "",
          [`${fieldPrefix}FileSize`]: currentList[0]?.size || 0,
          [`${fieldPrefix}FileUrl`]: currentList[0]?.url || "",
          [`ai${aiKey}Data`]: currentList[0]?.aiData || null,
          [fieldPrefix]: currentList[0]?.aiData?.docNo || ""
        };
      });
    }
  };

  // AI 분석용 예산 문자열 파서 (예: "120,000천원" 또는 "1.2억원" => 백만원 단위 변환)
  const parseBudgetStringToMillions = (budgetString: string | number | null | undefined) => {
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

  const handleAnalyzeAndUpload = async (
    docType: ProcurementDocumentType,
    fileId?: number | string
  ) => {
    let listKey = "";
    let fieldPrefix = "";
    let aiKey = "";
    if (docType === "proposal") {
      listKey = "docPlanFileList";
      fieldPrefix = "docPlan";
      aiKey = "Proposal";
    } else if (docType === "purchase") {
      listKey = "docPurchaseFileList";
      fieldPrefix = "docPurchase";
      aiKey = "Purchase";
    } else if (docType === "bid") {
      listKey = "docBidFileList";
      fieldPrefix = "docBid";
      aiKey = "Bid";
    } else if (docType === "check") {
      listKey = "docCheckFileList";
      fieldPrefix = "docCheck";
      aiKey = "Check";
    }

    if (listKey && fileId) {
      const fileItem = (formData[listKey] || []).find((item: any) => item.id === fileId);
      
      if (!fileItem) {
        alert("⚠️ 분석할 대상 파일을 찾을 수 없습니다.");
        return;
      }
      
      if (fileItem.aiData) {
        alert("💡 이미 AI 분석이 완료된 파일입니다.");
        return;
      }

      // 개별 파일 항목의 분석 대기 상태 활성화
      setFormData(prev => {
        const list = (prev[listKey] || []).map((item: any) => {
          if (item.id === fileId) return { ...item, isAnalyzing: true };
          return item;
        });
        return { ...prev, [listKey]: list };
      });

      try {
        let uploadedFileMeta = {
          name: fileItem.name,
          size: fileItem.size,
          url: fileItem.url
        };

        // 1. 업로드 전 본문 텍스트 추출용 변수 초기화
        let textContent = "";

        // 로컬 임시 바이너리가 첨부되어 있을 때만 Supabase Storage 업로드 및 본문 텍스트 파싱 실행
        if (fileItem.fileObj) {
          // PDF 파일의 경우 브라우저 내 라이브러리로 텍스트 파싱 진행 (내용 기반 분석 요건 충족)
          if (fileItem.fileObj.type === "application/pdf" || fileItem.fileObj.name.toLowerCase().endsWith(".pdf")) {
            try {
              const arrayBuffer = await fileItem.fileObj.arrayBuffer();
              const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
              const pdf = await loadingTask.promise;
              let fullText = "";
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                const pageText = text.items.map((item: any) => item.str || "").join(" ");
                fullText += pageText + "\n";
              }
              textContent = fullText.trim();
            } catch (pdfErr) {
              console.error("PDF 본문 텍스트 추출 실패:", pdfErr);
            }
          }

          const uploadResult = await uploadFileToSupabase(docType, fileItem.fileObj, (progress) => {
            // 개별 파일의 프로그레스 업데이트
            setFormData(prev => {
              const list = (prev[listKey] || []).map((item: any) => {
                if (item.id === fileId) return { ...item, uploadProgress: progress };
                return item;
              });
              return { ...prev, [listKey]: list };
            });
          });
          if (uploadResult) {
            uploadedFileMeta = uploadResult;
          }
        }

        // 선택한 AI 엔진별로 분석 진행 (Gemini 단독 / GPT-4o 단독 / 2개 모델 교차 토론)
        let aiResult;
        const currentEngine = aiEngine || "debate";
        const totalPrice = (Number(formData.unitPrice) * Number(formData.quantity) * 1000);
        
        if (currentEngine === "gemini") {
          aiResult = await callGeminiSingleAnalysis(
            docType,
            uploadedFileMeta.name,
            textContent, // 파일명에 의존하지 않고 추출된 텍스트 본문 전달
            formData.name,
            formData.deptName,
            totalPrice
          );
        } else if (currentEngine === "gpt") {
          aiResult = await callOpenAiGpt(
            docType,
            uploadedFileMeta.name,
            textContent, // 파일명에 의존하지 않고 추출된 텍스트 본문 전달
            formData.name,
            formData.deptName,
            totalPrice
          );
        } else {
          aiResult = await callDebateAiAnalysis(
            docType,
            uploadedFileMeta.name,
            textContent, // 파일명에 의존하지 않고 추출된 텍스트 본문 전달
            formData.name,
            formData.deptName,
            totalPrice
          );
        }

        setFormData(prev => {
          const list = (prev[listKey] || []).map((item: any) => {
            if (item.id === fileId) {
              return { 
                ...item, 
                aiData: aiResult, 
                url: uploadedFileMeta.url,
                isAnalyzing: false 
              };
            }
            return item;
          });

          // 기본 폼 상태 복제
          const nextData: ProcurementFormData = {
            ...prev,
            [listKey]: list,
            // 하위 호환성 유지: 첫 번째 파일 데이터를 롤업 동기화
            [`ai${aiKey}Data`]: list[0]?.aiData || null,
            [`${fieldPrefix}FileUrl`]: list[0]?.url || "",
            [fieldPrefix]: list[0]?.aiData?.docNo || ""
          };

          // [AI 자동채우기 핵심 로직 - AI 문서 기반 원클릭 행정 자동화 고도화]
          // 이전 입력 정보가 있더라도 AI가 분석한 업데이트된 핵심 명세 정보를 우선적으로 덮어씁니다.
          
          // 0. 관리번호(asset_number) 매핑 (1번 요건: 기획/구매가 아닌 검수문서 check 분석 시에만 mgmtNo 연동)
          if (docType === "check" && aiResult.mgmtNo) {
            nextData.asset_number = aiResult.mgmtNo;
          }

          // 1. 단가 및 예산 매핑 (백만원 / 천원 단위 정합성 고려)
          if (aiResult.unitPrice) {
            nextData.unitPrice = Number(aiResult.unitPrice);
          } else {
            const parsedBudget = parseBudgetStringToMillions(aiResult.budget);
            if (parsedBudget) {
              if (modalType === "service") {
                nextData.budgetPlan = Math.round(parsedBudget * 1000); 
              } else if (modalType === "env") {
                nextData.unitPrice = parsedBudget;
                nextData.budgetPlan = parsedBudget;
              } else {
                nextData.unitPrice = parsedBudget; 
              }
            }
          }

          // 2. 수량 매핑
          if (aiResult.quantity) {
            nextData.quantity = Number(aiResult.quantity);
          } else {
            if (!nextData.quantity) {
              nextData.quantity = 1;
            }
          }

          // 3. 단위과제 (unit) & 연계 프로그램 (operation) 자동 매핑
          if (aiResult.unit) {
            const unitMatch = aiResult.unit.match(/[A-D][1-4][가-힣]?/);
            if (unitMatch) {
              const unitCode = unitMatch[0]; // 예: "B2", "C2" 등
              nextData.unit = unitCode;
              
              // 연계 프로그램 세팅
              const progs = getDynamicPrograms(unitCode);
              if (progs.length > 0) {
                nextData.operation = progs[0].name;
              }
            } else {
              if (!nextData.unit) {
                nextData.unit = "A1";
                const progs = getDynamicPrograms("A1");
                if (progs.length > 0) {
                  nextData.operation = progs[0].name;
                }
              }
            }
          }

          // 4. 주관 학과 (deptName) 및 행정 부서 (divisionName) 정교한 매핑
          const rawDept = aiResult.dept || aiResult.fromDept;
          if (rawDept) {
            const cleanDept = rawDept.replace(/\s*\(.*?\)\s*/g, "").trim();
            
            const validDepts = [
              "기계공학부", "기계시스템전공", "기계설비전공", "전기전자공학부", "전기전공", "스마트전자전공",
              "조선해양시스템공학과", "컴퓨터공학과", "화학공학과", "게임영상학과", "실내건축디자인과",
              "융합안전공학과", "인테리어시공학과", "간호학부", "물리치료학과", "치위생학과", "식품영양학과",
              "호텔조리제빵과", "스포츠재활학부", "스포츠건강재활학과", "푸드케어학과", "골프산업과",
              "반려동물보건과", "사회복지학과", "유아교육과", "세무회계학과", "사회복지상담학과", "국제학부",
              "미래모빌리티제조학과", "바이오화학생산기술학과", "인공지능기반텔레헬스학과"
            ];
            
            const matchedDept = validDepts.find(d => cleanDept.includes(d) || d.includes(cleanDept));
            if (matchedDept) {
              nextData.deptName = matchedDept;
              nextData.divisionName = ""; // 학과가 지정되면 행정부서 초기화
            } else {
              const validDivisions = [
                "RCC", "ECC", "글로컬대학30추진단", "교육혁신처", "학생조치처", "입학홍보처",
                "산학협력처", "총무처", "기획처", "교무팀", "학사지원팀", "총무팀", "재무회계팀",
                "IR센터", "산학기획팀", "산학지원팀", "창업창직교육센터", "현장실습지원센터", "AID-X지원센터"
              ];
              const matchedDiv = validDivisions.find(d => cleanDept.toUpperCase().includes(d.toUpperCase()) || d.toUpperCase().includes(cleanDept.toUpperCase()));
              if (matchedDiv) {
                nextData.divisionName = matchedDiv;
                nextData.deptName = ""; // 행정부서가 지정되면 학과 초기화
              } else {
                if (!nextData.deptName && !nextData.divisionName) {
                  nextData.divisionName = "ECC"; // 최종 폴백
                  nextData.deptName = "";
                }
              }
            }
          }

          // 5. 품명 (name, title) 자동 완성
          if (aiResult.itemName) {
            nextData.name = aiResult.itemName;
            nextData.title = aiResult.itemName;
          } else {
            if (!nextData.name) {
              const baseFileName = uploadedFileMeta.name.replace(/\.[^/.]+$/, "");
              if (baseFileName && !/^\d+$/.test(baseFileName) && baseFileName.length > 2) {
                nextData.name = baseFileName;
                nextData.title = baseFileName;
              } else {
                nextData.name = docType === "proposal" ? "스마트 팩토리 IoT 통합 분석 시스템" : "정밀 의료 실습용 고해상도 초음파 진단기";
                nextData.title = docType === "proposal" ? "스마트 팩토리 IoT 통합 분석 시스템" : "정밀 의료 실습용 고해상도 초음파 진단기";
              }
            }
          }

          // 5-2. 규격 및 단위 자동 완성 (요청 1, 2 반영)
          if (aiResult.specs && Array.isArray(aiResult.specs) && aiResult.specs.length > 0) {
            nextData.spec = aiResult.specs[0]; // 첫번째 핵심 스펙 기입
          }
          if (aiResult.itemUnit) {
            nextData.itemUnit = aiResult.itemUnit;
          } else {
            nextData.itemUnit = "대"; // 기본값 폴백
          }

          // 6. 기자재 바코드는 현재 운영계획이 없고 관리번호는 검수 마친 후 수동 기재하므로 자동완성 영역에서 생략

          // 7. 기획 목적 및 활용계획 자동 추출 바인딩 (구입목적, 활용계획)
          const strategicGoals = aiResult.goals ? aiResult.goals.join(", ") : "RISE 사업 전략 과제 추진";
          
          if (modalType === "service") {
            if (aiResult.descriptionPurpose) {
              nextData.purpose = aiResult.descriptionPurpose;
            } else if (!nextData.purpose) {
              nextData.purpose = `[AI 자동완성] ${nextData.title} 용역을 통해 RISE 사업의 전략 목표인 '${strategicGoals}'를 달성하고 고도화된 연구 성과를 창출하고자 함.`;
            }
            nextData.providerQual = nextData.providerQual || "관련 부문 인가 인증 보유 법인 및 대학용역 유사 실적 우수 사업자";
            nextData.opResult = nextData.opResult || "용역 일정 내 성과품 납품 완료 및 만족도 평가 결과 우수 등급 달성";
            
            // 용역(service) 날짜 기입 분기
            if (docType === "proposal" && aiResult.draftDate) {
              nextData.datePp = aiResult.draftDate;
            } else if (docType === "purchase" && aiResult.draftDate) {
              nextData.dateRfo = aiResult.draftDate;
            }
          } else if (modalType === "env") {
            if (aiResult.descriptionPurpose) {
              nextData.purpose = aiResult.descriptionPurpose;
            } else if (!nextData.purpose) {
              nextData.purpose = `[AI 자동완성] 교육환경 개선 사업을 시행하여 시설 안정성을 확보하고 학생 친화적 학습 환경을 혁신하고자 함.`;
            }
            nextData.plan = nextData.plan || `전략 목표: ${strategicGoals}`;
            if (aiResult.descriptionPlan) {
              nextData.utilization = aiResult.descriptionPlan;
            } else if (!nextData.utilization) {
              nextData.utilization = "학부생 공통 개방형 메이커 스페이스 및 교육 실습 공간으로 상시 개방 운영 예정";
            }
            
            // 환경개선(env) 날짜 기입 분기
            if (docType === "proposal") {
              if (aiResult.draftDate) nextData.dateP = aiResult.draftDate;
              if (aiResult.approveDate) nextData.dateA = aiResult.approveDate;
            } else if (docType === "purchase") {
              if (aiResult.draftDate) {
                nextData.datePr = aiResult.draftDate;
              } else if (aiResult.approveDate) {
                nextData.datePr = aiResult.approveDate;
              }
            }
          } else {
            if (aiResult.descriptionPurpose) {
              nextData.descriptionPurpose = aiResult.descriptionPurpose;
            } else if (!nextData.descriptionPurpose) {
              nextData.descriptionPurpose = `[AI 자동완성] ${nextData.name} 핵심 기자재를 도입하여 교육 실습 타당성을 확보하고 전략 목표인 '${strategicGoals}' 과제를 완성함.`;
            }

            if (aiResult.descriptionPlan) {
              nextData.descriptionPlan = aiResult.descriptionPlan;
            } else if (!nextData.descriptionPlan) {
              nextData.descriptionPlan = "도입 완료 후 시뮬레이션 고도화 전공 교과목 실습 기자재로 100% 매칭 활용하며, 연간 120명 이상의 전문 인력 실습 활용 기대.";
            }
            
            // 기자재(equip) 날짜 기입 분기 (기획문서는 PA에, 구매문서는 Pr에 각각 매핑)
            if (docType === "proposal") {
              if (aiResult.approveDate) {
                nextData.dateP = aiResult.approveDate;
              } else if (aiResult.draftDate) {
                nextData.dateP = aiResult.draftDate;
              }
            } else if (docType === "purchase") {
              if (aiResult.draftDate) {
                nextData.datePr = aiResult.draftDate;
              } else if (aiResult.approveDate) {
                nextData.datePr = aiResult.approveDate;
              }
            }
          }

          return nextData;
        });

        const engineNameMap: Record<string, string> = {
          gemini: "Google Gemini API",
          gpt: "OpenAI GPT-4o API",
          debate: "AI 교차 토론 조합 (Gemini ✖️ GPT)"
        };
        alert(`🤖 [${engineNameMap[currentEngine]}] 분석 및 문서 업로드가 완료되었습니다!`);
      } catch (error) {
        console.error("문서 분석 에러:", error);
        alert("❌ 문서 분석 중 예상치 못한 에러가 발생했습니다.");
        setFormData(prev => {
          const list = (prev[listKey] || []).map((item: any) => {
            if (item.id === fileId) return { ...item, isAnalyzing: false };
            return item;
          });
          return { ...prev, [listKey]: list };
        });
      }
    } else {
      // [교육용 주석] 입찰문서(docBid)에 대해서도 GPT-4o와 Google Gemini 간의 교차 토론(Debate) 및 합의(Consensus) 분석 엔진을 가동합니다.
      const fieldPrefix = "docBid";
      const file = formData[`${fieldPrefix}File`];
      if (!file && !formData[`${fieldPrefix}FileUrl`]) {
        alert("⚠️ 먼저 분석할 문서를 업로드해 주세요!");
        return;
      }

      setIsAnalyzingBid(true);
      setUploadProgressBid(10);

      try {
        let uploadedFileMeta = {
          name: formData[`${fieldPrefix}FileName`],
          size: formData[`${fieldPrefix}FileSize`],
          url: formData[`${fieldPrefix}FileUrl`]
        };

        if (file) {
          const uploadResult = await uploadFileToSupabase(docType, file, (progress) => {
            setUploadProgressBid(progress);
          });
          if (uploadResult) {
            uploadedFileMeta = uploadResult;
          }
        } else {
          setUploadProgressBid(100);
        }

        const totalPrice = (Number(formData.unitPrice) * Number(formData.quantity) * 1000);
        // 선택한 AI 엔진별로 분석 진행 (Gemini 단독 / GPT-4o 단독 / 2개 모델 교차 토론)
        let aiResult;
        const currentEngine = aiEngine || "debate";
        
        if (currentEngine === "gemini") {
          aiResult = await callGeminiSingleAnalysis(
            docType,
            uploadedFileMeta.name,
            "",
            formData.name,
            formData.deptName,
            totalPrice
          );
        } else if (currentEngine === "gpt") {
          aiResult = await callOpenAiGpt(
            docType,
            uploadedFileMeta.name,
            "",
            formData.name,
            formData.deptName,
            totalPrice
          );
        } else {
          aiResult = await callDebateAiAnalysis(
            docType,
            uploadedFileMeta.name,
            "",
            formData.name,
            formData.deptName,
            totalPrice
          );
        }

        setFormData(prev => {
          const nextData: ProcurementFormData = {
            ...prev,
            [`${fieldPrefix}FileName`]: uploadedFileMeta.name,
            [`${fieldPrefix}FileSize`]: uploadedFileMeta.size,
            [`${fieldPrefix}FileUrl`]: uploadedFileMeta.url,
            aiBidData: aiResult,
            docBid: aiResult.docNo
          };
          
          // 예산액 파싱 및 반영
          const parsedSpent = parseBudgetStringToMillions(aiResult.budget);
          if (parsedSpent) {
            nextData.budgetSpent = parsedSpent;
          }
          
          // 입찰 마감일 또는 입찰 공고일 분석 결과를 "입찰(B) 일자" 필드에 매핑
          if (aiResult.deadline) {
            const dateMatch = aiResult.deadline.match(/\d{4}-\d{2}-\d{2}/);
            if (dateMatch) {
              nextData.dateB = dateMatch[0];
            }
          }
          
          return nextData;
        });

        const engineNameMap: Record<string, string> = {
          gemini: "Google Gemini API",
          gpt: "OpenAI GPT-4o API",
          debate: "AI 교차 토론 조합 (Gemini ✖️ GPT)"
        };
        alert(`🤖 [${engineNameMap[currentEngine]}] 분석 및 문서 업로드가 완료되었습니다!`);
      } catch (error) {
        console.error("문서 분석 에러:", error);
        alert("❌ 문서 분석 중 예상치 못한 에러가 발생했습니다.");
      } finally {
        setIsAnalyzingBid(false);
      }
    }
  };

  // 팝오버를 열기 위한 트리거 함수
  const _handleMilestoneClick = (
    e: ReactMouseEvent<HTMLElement>,
    equipId: number | string,
    month: string
  ) => {
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
  const handleMilestoneMultiToggle = (
    equipId: number | string,
    month: string,
    stepName: string
  ) => {
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

    const activeEquipList = equipData;
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
  const _getMilestoneStyle = (stepList: string | string[], monthNum: string) => {
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
    const stepMeta: Record<string, { text: string; color: string }> = {
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
  const getDynamicPrograms = (targetUnit: string) => {
    const unitKey = targetUnit || formData.unit;
    if (projects && projects.length > 0) {
      for (const proj of projects) {
        if (proj.units && proj.units.length > 0) {
          const matchedUnit = proj.units.find((u: any) => u.id === unitKey);
          if (matchedUnit && matchedUnit.programs) {
            return matchedUnit.programs.map((prog: any) => ({
              id: prog.id,
              name: prog.title
            }));
          }
        }
      }
    }
    return PROGRAMS_BY_UNIT[unitKey] || [];
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      setFormData(prev => {
        const next: ProcurementFormData = { ...prev, [name]: value };
        // [교육용 주석] 기자재 모달이고 dateP(기획∙승인 일자)가 변경될 때 dateA(승인 일자)도 동일하게 설정하여 DB 호환성 유지
        if (name === "dateP" && modalType === "equip") {
          next.dateA = value;
        }
        return next;
      });
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
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
              docPlanFileList: formData.docPlanFileList || [],
              docPurchaseFileList: formData.docPurchaseFileList || [],
              
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
        showToast("🛠️ 교육환경 개선 사업 정보가 성공적으로 수정되었습니다.");
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
          docPlanFileList: formData.docPlanFileList || [],
          docPurchaseFileList: formData.docPurchaseFileList || [],
          
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
        showToast(`🛠️ 새 교육환경 개선 사업이 ${targetYear}차년도 사업계획서에 성공적으로 등록되었습니다.`);
      }
    } else if (modalType === "equip") {
      // 1) 단장님 조건: 학과 또는 부서 중 최소 하나는 반드시 선택되어야 함
      if (!formData.deptName && !formData.divisionName) {
        alert("⚠️ 학과 또는 부서 중 최소 한 곳은 반드시 지정하셔야 합니다.");
        return;
      }

      const targetYear = Number(formData.year) || Number(selectedYear);

      // 2) 요건 4: 단계별 입력 일정 순차 및 연차 범위 정합성 검증 (기자재 전용 검증으로 수정)
      const dateCheck = validateDatesChronologicalEquip(targetYear, formData.dateP, formData.datePr, formData.dateB, formData.dateI);
      if (!dateCheck.isValid) {
        alert(dateCheck.msg);
        return;
      }

      const activeEquipList = equipData;

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
              barcode: formData.barcode || "",
              asset_number: formData.asset_number || "",
              unitPrice: Math.round(parseFloat(formData.unitPrice || 0) * 1000000),
              quantity: Number(formData.quantity) || 1,
              spec: formData.spec || "",
              itemUnit: formData.itemUnit || "",
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
              docPlanFileList: formData.docPlanFileList || [],
              docPurchaseFileList: formData.docPurchaseFileList || [],
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
        showToast("🔬 기자재 정보가 성공적으로 수정되었습니다.");
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
          barcode: formData.barcode || "",
          asset_number: formData.asset_number || "",
          unitPrice: Math.round(parseFloat(formData.unitPrice || 0) * 1000000),
          quantity: Number(formData.quantity) || 1,
          spec: formData.spec || "",
          itemUnit: formData.itemUnit || "",
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
          docPlanFileList: formData.docPlanFileList || [],
          docPurchaseFileList: formData.docPurchaseFileList || [],
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
        showToast(`🔬 새 기자재 항목이 ${targetYear}차년도 사업계획서에 성공적으로 등록되었습니다.`);
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
              docPlanFileList: formData.docPlanFileList || [],
              docPurchaseFileList: formData.docPurchaseFileList || [],
              
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
        showToast("💼 주요 용역 정보가 성공적으로 수정되었습니다.");
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
          docPlanFileList: formData.docPlanFileList || [],
          docPurchaseFileList: formData.docPurchaseFileList || [],
          
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
        showToast("💼 새 주요 용역 항목이 성공적으로 등록되었습니다.");
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
      spec: "",
      itemUnit: "",
      description: "",
      step: "기획",
      operation: "교과목(정규)",
      mgrDept: "ECC",
      milestones: { "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [], "11": [], "12": [], "1": [], "2": [] },
      providerQual: "",
      opResult: ""
    });
  };

  const openAddModal = (type: "env" | "equip" | "service") => {
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
      barcode: "",
      asset_number: "",
      purpose: "",
      birdseyeView: "",
      blueprints: "",
      utilization: "",
      name: "",
      deptName: "",
      divisionName: "",
      unitPrice: "",
      quantity: "",
      spec: "",
      itemUnit: "",
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
      docCheck: "",
      docPlanContent: "",
      docPurchaseContent: "",
      docBidContent: "",
      docCheckContent: "",
      aiProposalData: null,
      aiPurchaseData: null,
      aiBidData: null,
      aiCheckData: null,
      docPlanFileList: [],
      docPurchaseFileList: [],
      docBidFileList: [],
      docCheckFileList: [],
      docPlanFile: null,
      docPurchaseFile: null,
      docBidFile: null,
      docCheckFile: null,
      docPlanFileName: "",
      docPurchaseFileName: "",
      docBidFileName: "",
      docCheckFileName: "",
      docPlanFileSize: 0,
      docPurchaseFileSize: 0,
      docBidFileSize: 0,
      docCheckFileSize: 0,
      docPlanFileUrl: "",
      docPurchaseFileUrl: "",
      docBidFileUrl: "",
      docCheckFileUrl: "",
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

  const openEditModal = (equip: ProcurementItem) => {
    const currentModalType = subTab === "env_improvement" ? "env" : subTab === "major_services" ? "service" : "equip";
    setModalType(currentModalType);
    setIsEditMode(true);
    setEditingItemId(equip.id ?? null);
    const docParts = (equip.relatedDocs || "").split(",").map((d: string) => d.trim()).filter(Boolean);
    const descText = equip.description || "";
    const descParts = descText.split("\n").map((l: string) => l.trim());
    setFormData({
      year: equip.year,
      unit: equip.unit,
      name: equip.itemName || equip.name || equip.title || "",
      title: equip.title || equip.itemName || "",
      deptName: equip.deptName || "",
      divisionName: equip.divisionName || "",
      barcode: equip.barcode || "",
      asset_number: equip.asset_number || "",
      unitPrice: equip.unitPrice ? parseFloat((equip.unitPrice / 1000000).toFixed(2)) : (equip.budgetPlan ? parseFloat((equip.budgetPlan / 1000000).toFixed(2)) : ""),
      quantity: equip.quantity || 1,
      spec: equip.spec || "",
      itemUnit: equip.itemUnit || "",
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
      purpose: equip.purpose || "",
      plan: equip.plan || "",
      progress: equip.progress || "",
      birdseyeView: equip.birdseyeView || "",
      blueprints: equip.blueprints || "",
      operation: equip.operation || "미래 핵심 신산업 주문식 교육 운영",
      password: equip.password || "1234",
      relatedDocs: equip.relatedDocs || "", // 관련문서 로드
      docPlan: equip.docPlan || docParts[0] || "",
      docPurchase: equip.docPurchase || docParts[1] || "",
      docBid: equip.docBid || docParts[2] || "",
      docCheck: equip.docCheck || docParts[3] || "",
      docPlanContent: equip.docPlanContent || "",
      docPurchaseContent: equip.docPurchaseContent || "",
      docBidContent: equip.docBidContent || "",
      docCheckContent: equip.docCheckContent || "",
      aiProposalData: equip.aiProposalData || null,
      aiPurchaseData: equip.aiPurchaseData || null,
      aiBidData: equip.aiBidData || null,
      aiCheckData: equip.aiCheckData || null,
      docPlanFileList: equip.docPlanFileList || (equip.docPlanFileName ? [{
        id: "legacy-plan",
        name: equip.docPlanFileName,
        size: equip.docPlanFileSize || 0,
        url: equip.docPlanFileUrl || "",
        aiData: equip.aiProposalData || null
      }] : []),
      docPurchaseFileList: equip.docPurchaseFileList || (equip.docPurchaseFileName ? [{
        id: "legacy-purchase",
        name: equip.docPurchaseFileName,
        size: equip.docPurchaseFileSize || 0,
        url: equip.docPurchaseFileUrl || "",
        aiData: equip.aiPurchaseData || null
      }] : []),
      docBidFileList: equip.docBidFileList || (equip.docBidFileName ? [{
        id: "legacy-bid",
        name: equip.docBidFileName,
        size: equip.docBidFileSize || 0,
        url: equip.docBidFileUrl || "",
        aiData: equip.aiBidData || null
      }] : []),
      docCheckFileList: equip.docCheckFileList || (equip.docCheckFileName ? [{
        id: "legacy-check",
        name: equip.docCheckFileName,
        size: equip.docCheckFileSize || 0,
        url: equip.docCheckFileUrl || "",
        aiData: equip.aiCheckData || null
      }] : []),
      docPlanFile: null,
      docPurchaseFile: null,
      docBidFile: null,
      docCheckFile: null,
      docPlanFileName: equip.docPlanFileName || "",
      docPurchaseFileName: equip.docPurchaseFileName || "",
      docBidFileName: equip.docBidFileName || "",
      docCheckFileName: equip.docCheckFileName || "",
      docPlanFileSize: equip.docPlanFileSize || 0,
      docPurchaseFileSize: equip.docPurchaseFileSize || 0,
      docBidFileSize: equip.docBidFileSize || 0,
      docCheckFileSize: equip.docCheckFileSize || 0,
      docPlanFileUrl: equip.docPlanFileUrl || "",
      docPurchaseFileUrl: equip.docPurchaseFileUrl || "",
      docBidFileUrl: equip.docBidFileUrl || "",
      docCheckFileUrl: equip.docCheckFileUrl || "",
      
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
      dateEs: equip.dateEs || "",
      dateC: equip.dateC || "",
      dateE: equip.dateE || ""
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
                앵커사업을 통한 대학 특화 공간 및 스마트 첨단 강의실 구축 진행 현황
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              {/* 학과 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary)" }} />
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
                <ListFilter size={16} style={{ color: "var(--text-secondary)" }} />
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
                <ListFilter size={16} style={{ color: "var(--text-secondary)" }} />
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
                  className="action-btn"
                  onClick={() => openAddModal("env")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "9999px",
                    background: "var(--accent-color)",
                    border: "none",
                    color: "white",
                    fontWeight: "700",
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

          {/* 💡 [교육용 한글 주석] 환경개선 절차(총 9단계)를 직관적인 가로 한 줄 스텝 프로세스 바 형태로 시각화하여 렌더링합니다. */}
          <div className="glass-card" style={{ padding: "1rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--accent-color)", fontWeight: "800" }}>🛠️</span>
              <h4 style={{ margin: 0, fontSize: "0.8rem", fontWeight: "800", color: "var(--text-primary)" }}>교육환경 개선 추진 절차 안내</h4>
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              overflowX: "auto", 
              gap: "0.5rem",
              paddingBottom: "0.25rem",
              // 스크롤바 스타일링
              scrollbarWidth: "thin",
              msOverflowStyle: "none"
            }}>
              {[
                { no: "01", name: "회의 및 예산협의", dept: "시설안전 · 앵커사업단" },
                { no: "02", name: "계획서 반영 및 승인", dept: "앵커사업단 · 울산앵커" },
                { no: "03", name: "환경개선 요청", dept: "앵커사업단 ➔ 시설안전" },
                { no: "04", name: "설계협의 및 확정", dept: "시설안전 · 앵커사업단" },
                { no: "05", name: "구매신청", dept: "시설안전 ➔ 총무팀" },
                { no: "06", name: "입찰 및 계약", dept: "총무팀 (평가절차)" },
                { no: "07", name: "시공 (공사)", dept: "계약업체 · 시설안전" },
                { no: "08", name: "검수", dept: "시설 / 총무 / 앵커" },
                { no: "09", name: "집행완료", dept: "재무회계팀" }
              ].map((step, idx, arr) => (
                <React.Fragment key={step.no}>
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    minWidth: "105px", 
                    textAlign: "center",
                    flex: 1
                  }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.25rem",
                      background: "var(--body-bg)", // 카드의 배경색과 확실한 구분을 주기 위해 body-bg 적용
                      border: "1.5px solid var(--border-color)", // 외각 테두리를 선명하게 1.5px 보더 지정
                      borderRadius: "6px",
                      padding: "0.35rem 0.5rem",
                      width: "100%",
                      justifyContent: "center"
                    }}>
                      <span style={{ 
                        fontSize: "0.65rem", 
                        fontWeight: "800", 
                        color: "var(--accent-color)", 
                        background: "rgba(16, 185, 129, 0.15)",
                        borderRadius: "50%",
                        width: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>{step.no}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{step.name}</span>
                    </div>
                    <span style={{ 
                      fontSize: "0.6rem", 
                      color: "var(--text-secondary)", 
                      marginTop: "0.25rem", 
                      whiteSpace: "nowrap" 
                    }}>{step.dept}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <span style={{ 
                      fontSize: "1rem", 
                      color: "var(--text-secondary)", // 라이트/다크 모드 전체 가시성 연동
                      fontWeight: "900",
                      userSelect: "none",
                      padding: "0 0.1rem"
                    }}>➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 환경개선 테이블 */}
          <div className="glass-card" style={{ padding: "0.25rem", borderRadius: "12px", overflowX: "auto", border: "1px solid var(--border-color)", background: "var(--panel-bg)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "var(--text-primary)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", background: "transparent" }}>
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
                      <span style={{ fontSize: "0.68rem", fontWeight: "400", color: "var(--text-secondary)", marginTop: "0.1rem" }}>(백만원)</span>
                    </div>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "384px", verticalAlign: "middle" }}>구축목적 및 활용계획</th>
                  <th colSpan={12} style={{ padding: "0.5rem", textAlign: "center", fontWeight: "800", borderBottom: "1px solid var(--border-color)", background: "rgba(255, 255, 255, 0.01)", lineHeight: "1.3" }}>
                    개선단계<br />
                    <span style={{ fontSize: "0.63rem", fontWeight: "normal", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>[기획∙승인(PA : 1∙2) ⇨ 요청∙설계(RD : 3∙4) ⇨ 구매∙입찰∙계약(PBC : 5∙6) ⇨ 시공(C : 7) ⇨ 검수(I : 8)]</span>
                  </th>
                  <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "80px", verticalAlign: "middle" }}>관련문서</th>
                  {currentRole.id !== "GUEST" && (
                    <th rowSpan={3} style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "65px", verticalAlign: "middle" }}>제어</th>
                  )}
                </tr>
                {/* 2행: 연도 분할 */}
                <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid var(--border-color)" }}>
                  <th colSpan={10} style={{ padding: "0.25rem 0.5rem", textAlign: "center", fontWeight: "750", fontSize: "0.75rem", color: "var(--accent-color)", borderRight: "1px solid var(--border-color)" }}>
                    '{String(2024 + (Number(selectedYear) || 1)).slice(-2)}년
                  </th>
                  <th colSpan={2} style={{ padding: "0.25rem 0.5rem", textAlign: "center", fontWeight: "750", fontSize: "0.75rem", color: "var(--accent-color)" }}>
                    '{String(2024 + (Number(selectedYear) || 1) + 1).slice(-2)}년
                  </th>
                </tr>
                {/* 3행: 월 리스트 */}
                <tr style={{ background: "rgba(255, 255, 255, 0.01)", borderBottom: "2px solid var(--border-color)" }}>
                  {monthsOrder.map((m, idx) => (
                    <th 
                      key={m} 
                      style={{ 
                        padding: "0.3rem 0.2rem", 
                        textAlign: "center", 
                        fontWeight: "800", 
                        fontSize: "0.75rem", 
                        color: "var(--text-secondary)",
                        width: "36px",
                        whiteSpace: "nowrap",
                        borderRight: idx < 11 ? "1px solid var(--border-color)" : "none"
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
                    const _total = price * qty;

                    const idxP = getMonthIndex(equip.dateP);
                    const idxA = getMonthIndex(equip.dateA);
                    const idxB = getMonthIndex(equip.dateB);
                    const idxPr = getMonthIndex(equip.datePr);
                    const idxI = getMonthIndex(equip.dateI);

                    const activePhases = [];
                    if (idxP !== null) activePhases.push({ phase: "PA", idx: idxP, weight: phaseWeight["P"], date: equip.dateP, label: "기획∙승인", color: "#f59e0b" });
                    if (idxA !== null) activePhases.push({ phase: "RD", idx: idxA, weight: phaseWeight["A"], date: equip.dateA, label: "요청∙설계", color: "#3b82f6" });
                    if (idxB !== null) activePhases.push({ phase: "PBC", idx: idxB, weight: phaseWeight["B"], date: equip.dateB, label: "구매∙입찰∙계약", color: "#06b6d4" });
                    if (idxPr !== null) activePhases.push({ phase: "C", idx: idxPr, weight: phaseWeight["Pr"], date: equip.datePr, label: "시공", color: "#a78bfa" });
                    if (idxI !== null) activePhases.push({ phase: "I", idx: idxI, weight: phaseWeight["I"], date: equip.dateI, label: "검수", color: "#10b981" });

                    let lastActivePhase = null;
                    if (activePhases.length > 0) {
                      const sortedActive = [...activePhases].sort((a, b) => {
                        if (a.idx !== b.idx) return b.idx - a.idx;
                        return b.weight - a.weight;
                      });
                      lastActivePhase = sortedActive[0];
                    }

                    const arrowsToRender: Array<{ cellIdx: number; leftPercent: string; color: string }> = [];
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
                        style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.15s ease" }}
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
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "700", color: "var(--text-primary)" }}>
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
                          const dynamicMilestones = getMilestonesFromDates(equip, selectedYear || 1);
                          const stepList = dynamicMilestones[m] || [];

                          const getSegmentColorForPos = (pos: number) => {
                            if (idxP !== null && idxA !== null && pos >= idxP && pos <= idxA) return "#f59e0b";
                            if (idxA !== null && idxB !== null && pos >= idxA && pos <= idxB) return "#3b82f6";
                            if (idxB !== null && idxPr !== null && pos >= idxB && pos <= idxPr) return "#06b6d4";
                            if (idxPr !== null && idxI !== null && pos >= idxPr && pos <= idxI) return "#a78bfa";
                            return "var(--border-color)";
                          };

                          const leftColor = getSegmentColorForPos(currIdx - 0.5);
                          const rightColor = getSegmentColorForPos(currIdx + 0.5);

                          const envPhaseMap: Record<string, { code: string; label: string; color: string }> = {
                            "P": { code: "PA", label: "기획∙승인", color: "#f59e0b" },
                            "A": { code: "RD", label: "요청∙설계", color: "#3b82f6" },
                            "B": { code: "PBC", label: "구매∙입찰∙계약", color: "#06b6d4" },
                            "Pr": { code: "C", label: "시공", color: "#a78bfa" },
                            "I": { code: "I", label: "검수", color: "#10b981" }
                          };

                          const hasMilestone = stepList.length > 0;
                          
                          const getEnvStatusText = (item: ProcurementItem) => {
                            if (item.dateI) return "검수 완료";
                            if (item.datePr) return "시공 중";
                            if (item.dateB) return "구매∙입찰∙계약 중";
                            if (item.dateA) return "요청∙설계 중";
                            if (item.dateP) return "기획∙승인 중";
                            return "준비 중";
                          };
                          const currentStatus = getEnvStatusText(equip);

                          const shouldShowBalloon = lastActivePhase && lastActivePhase.idx === currIdx;
                          let _phaseColor = "rgba(255, 255, 255, 0.2)";
                          let _phaseLabel = "";
                          let _phaseDate = "";
                          let _primaryCode = "";

                          if (hasMilestone) {
                            const rawCode = stepList[0];
                            const info = envPhaseMap[rawCode] || { code: rawCode, label: rawCode, color: "#38bdf8" };
                            _primaryCode = info.code;
                            _phaseLabel = info.label;
                            _phaseColor = info.color;
                            _phaseDate = rawCode === "P" ? (equip.dateP || "") :
                                        rawCode === "A" ? (equip.dateA || "") :
                                        rawCode === "B" ? (equip.dateB || "") :
                                        rawCode === "Pr" ? (equip.datePr || "") :
                                        equip.dateI || "";
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
                                borderRight: currIdx < 11 ? "1px solid var(--border-color)" : "none",
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
                                height: "1.5px",
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
                                      borderTop: "2px solid transparent",
                                      borderBottom: "2px solid transparent",
                                      borderLeft: `4.5px solid ${arr.color}`,
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
                                    style={({
                                      "--bg-color": colorSet.bg,
                                      "--shadow-color": colorSet.shadow,
                                      "--border-color": colorSet.border,
                                      bottom: "100%",
                                      marginBottom: "4px"
                                    } as React.CSSProperties)}
                                  >
                                    {currentStatus}
                                  </div>
                                )}
                                {hasMilestone && stepList.map((rawCode, sIdx) => {
                                  const info = envPhaseMap[rawCode] || { code: rawCode, label: rawCode, color: "#38bdf8" };
                                  const pCode = info.code;
                                  const pLabel = info.label;
                                  const pColor = info.color;
                                  const pDate = rawCode === "P" ? equip.dateP :
                                                rawCode === "A" ? equip.dateA :
                                                rawCode === "B" ? equip.dateB :
                                                rawCode === "Pr" ? equip.datePr :
                                                equip.dateI;
                                  return (
                                    <div 
                                      key={sIdx}
                                      className="milestone-tooltip-container"
                                      style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                                    >
                                      <div className="milestone-tooltip" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textAlign: "center" }}>
                                        <span style={{ color: pColor, fontWeight: "900" }}>{pLabel} ({pCode})</span>
                                        <span style={{ fontSize: "0.68rem", opacity: 0.85, fontWeight: "normal" }}>{pDate || "날짜 미정"}</span>
                                      </div>

                                      <svg width="24" height="32" viewBox="0 0 24 32" style={{ overflow: "visible" }}>
                                        <defs>
                                          <filter id={`glow-${pCode}`} x="-40%" y="-40%" width="180%" height="180%">
                                            <feGaussianBlur stdDeviation="2.2" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                          </filter>
                                        </defs>
                                        <path 
                                          d="M 4 7 L 12 11.5 L 20 7" 
                                          fill="none"
                                          stroke={pColor} 
                                          strokeWidth="1.5" 
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          opacity="0.9" 
                                        />
                                        <text x="12" y="4.5" textAnchor="middle" fontSize="9" fontWeight="950" fill="var(--text-primary)" style={{ fontFamily: "monospace", letterSpacing: "-0.5px" }}>
                                          {pCode}
                                        </text>
                                        <circle cx="12" cy="17.5" r="4.5" fill={pColor} stroke="#ffffff" strokeWidth="1.5" filter={`url(#glow-${pCode})`} style={{ transition: "all 0.2s ease" }} />
                                      </svg>
                                    </div>
                                  );
                                })}
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
                                background: "rgba(59, 130, 246, 0.15)",
                                color: "#2563EB",
                                border: "1px solid rgba(59, 130, 246, 0.5)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center",
                                fontWeight: "700"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
                                e.currentTarget.style.borderColor = "#1D4ED8";
                                e.currentTarget.style.color = "#1D4ED8";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                                e.currentTarget.style.color = "#2563EB";
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
                                background: "rgba(139, 92, 246, 0.15)",
                                color: "#7C3AED",
                                border: "1px solid rgba(139, 92, 246, 0.5)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center",
                                fontWeight: "700"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(139, 92, 246, 0.25)";
                                e.currentTarget.style.borderColor = "#6D28D9";
                                e.currentTarget.style.color = "#6D28D9";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
                                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
                                e.currentTarget.style.color = "#7C3AED";
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
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "#059669",
                                border: "1px solid rgba(16, 185, 129, 0.5)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center",
                                fontWeight: "700"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
                                e.currentTarget.style.borderColor = "#047857";
                                e.currentTarget.style.color = "#047857";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
                                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.5)";
                                e.currentTarget.style.color = "#059669";
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
                            {currentRole.id !== "GUEST" && (["ADMIN", "G_DIRECTOR", "HQ_HEAD", "TEAM_LEADER", "MANAGER"].includes(currentRole.id) || !equip.created_by || equip.created_by === currentUser?.uuid) && (
                              <>
                                <button 
                                  onClick={() => openEditModal(equip)}
                                  className="btn btn-secondary"
                                  style={{
                                    padding: "0.25rem 0.45rem",
                                    fontSize: "0.65rem",
                                    background: "rgba(107, 114, 128, 0.12)",
                                    border: "1px solid rgba(107, 114, 128, 0.4)",
                                    borderRadius: "4px",
                                    color: "var(--text-primary)",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    width: "36px",
                                    textAlign: "center",
                                    transition: "all 0.15s ease"
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                                    e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                                    e.currentTarget.style.color = "var(--accent-color, #2563EB)";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.background = "rgba(107, 114, 128, 0.12)";
                                    e.currentTarget.style.borderColor = "rgba(107, 114, 128, 0.4)";
                                    e.currentTarget.style.color = "var(--text-primary)";
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
                                    background: "rgba(239, 68, 68, 0.12)",
                                    border: "1px solid rgba(239, 68, 68, 0.45)",
                                    borderRadius: "4px",
                                    color: "#DC2626",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    width: "36px",
                                    textAlign: "center",
                                    transition: "all 0.15s ease"
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                                    e.currentTarget.style.borderColor = "#B91C1C";
                                    e.currentTarget.style.color = "#B91C1C";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
                                    e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.45)";
                                    e.currentTarget.style.color = "#DC2626";
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
                <ListFilter size={16} style={{ color: "var(--text-secondary)" }} />
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
                <ListFilter size={16} style={{ color: "var(--text-secondary)" }} />
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
                <ListFilter size={16} style={{ color: "var(--text-secondary)" }} />
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
                  className="action-btn"
                  onClick={() => openAddModal("equip")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "9999px",
                    background: "var(--accent-color)",
                    border: "none",
                    color: "white",
                    fontWeight: "700",
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

          {/* 💡 [교육용 한글 주석] 기자재 구입 및 운영 절차를 시각적으로 보여주는 가로 흐름 스텝바를 배치합니다. */}
          <div className="glass-card" style={{ padding: "1rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🔬</span>
              <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: "800", color: "var(--text-primary)" }}>기자재 구입 및 운영 절차 안내</h4>
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.35rem", 
              overflowX: "auto", 
              paddingBottom: "0.25rem",
              scrollbarWidth: "thin",
              msOverflowStyle: "none"
            }}>
              {[
                { no: "01", name: "수요조사", dept: "앵커사업단 · 학부(과)", desc: "행정용 / 학부(과)용", tooltip: "수요조사\n- 행정용\n- 학부(과)용" },
                { no: "02", name: "계획수립", dept: "앵커사업단", desc: "사업계획서 반영", tooltip: "사업계획 및 부서 필요 기자재 반영 수립" },
                { no: "03", name: "앵커기획위원회", dept: "앵커사업단", desc: "자체 심의", tooltip: "앵커기획위원회 자체 심의" },
                { no: "04", name: "금액별 심의/승인", dept: "앵커 ➔ 울산/중앙", desc: "금액별 분기 심의", tooltip: "💡 금액별 심의/승인 상세 절차:\n• 3천만원 미만: 자체심의\n• 3천만원 이상: 울산앵커센터 사전승인\n• 1억원 이상: 울산앵커센터 사전보고 & 중앙앵커센터 승인신청 및 사전승인" },
                { no: "05", name: "선정위원회 승인", dept: "앵커 ➔ 교무팀", desc: "기자재선정위 승인", tooltip: "학부(과) 기자재 대상: 앵커사업단 요청 ➔ 교무팀 개최" },
                { no: "06", name: "결재 및 구매신청", dept: "앵커사업단", desc: "시설팀 / 교무팀 경유", tooltip: "내부결재 및 구매신청\n- 행정용 : 시설팀 경유\n- 학부(과)용 : 교무팀 경유" },
                { no: "07", name: "입찰 / 수의계약", dept: "총무팀", desc: "계약 및 조달", tooltip: "총무팀을 경유한 입찰 또는 수의계약 체결" },
                { no: "08", name: "검수 및 입고", dept: "시설/교무/앵커/총무", desc: "현물 대조 검수", tooltip: "납품 기자재에 대한 실물 검수 및 입고 처리" },
                { no: "09", name: "집행완료", dept: "재무회계팀", desc: "최종 예산 지출", tooltip: "재무회계팀 최종 집행 및 지출 결의 완료" },
                { no: "10", name: "기자재 운영/관리", dept: "자산부서 · 앵커사업단", desc: "대장 등재 및 관리", tooltip: "각 자산관리부서 및 앵커사업단 자산 대장 등재 및 모니터링" }
              ].map((step, idx, arr) => (
                <React.Fragment key={step.no}>
                  <div 
                    title={step.tooltip}
                    style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center", 
                      minWidth: "120px", 
                      textAlign: "center",
                      flex: 1,
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.25rem",
                      background: step.no === "04" ? "rgba(16, 185, 129, 0.12)" : "var(--body-bg)", // 확실한 대비를 위해 body-bg 적용
                      border: step.no === "04" ? "1.5px solid var(--accent-color)" : "1.5px solid var(--border-color)", // 1.5px로 외곽선 보강
                      borderRadius: "6px",
                      padding: "0.35rem 0.5rem",
                      width: "100%",
                      justifyContent: "center",
                      transition: "all 0.2s ease"
                    }}>
                      <span style={{ 
                        fontSize: "0.65rem", 
                        fontWeight: "800", 
                        color: step.no === "04" ? "white" : "var(--accent-color)", 
                        background: step.no === "04" ? "var(--accent-color)" : "rgba(16, 185, 129, 0.15)",
                        borderRadius: "50%",
                        width: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>{step.no}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{step.name}</span>
                    </div>
                    <span style={{ 
                      fontSize: "0.6rem", 
                      color: "var(--text-secondary)", 
                      marginTop: "0.25rem", 
                      whiteSpace: "nowrap" 
                    }}>{step.dept}</span>
                    <span style={{ 
                      fontSize: "0.55rem", 
                      color: "var(--text-secondary)", // 라이트/다크 모드 전체 가시성 연동
                      marginTop: "0.05rem", 
                      whiteSpace: "nowrap" 
                    }}>{step.desc}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <span style={{ 
                      fontSize: "1rem", 
                      color: "var(--text-secondary)", // 라이트/다크 모드 전체 가시성 연동
                      fontWeight: "900",
                      userSelect: "none",
                      padding: "0 0.1rem"
                    }}>➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 기자재 리스트 (스프레드시트 스타일 표 뷰) */}
          <div className="glass-card" style={{ padding: "0.5rem", borderRadius: "10px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "var(--text-primary)", minWidth: "1200px" }}>
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border-color)" }}>
                  <th 
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
                    onClick={() => handleSort("unit")} 
                    style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "65px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="과제 기준 정렬"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                      과제
                      <ArrowUpDown size={12} style={{ opacity: sortField === "unit" ? 1 : 0.4 }} />
                    </div>
                  </th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "130px", verticalAlign: "middle" }}>학과 / 부서</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "200px", verticalAlign: "middle" }}>품명</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "160px", verticalAlign: "middle" }}>규격</th>
                  <th 
                    onClick={() => handleSort("unitPrice")} 
                    style={{ padding: "0.5rem 0.3rem", textAlign: "center", fontWeight: "800", width: "95px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="단가 기준 정렬"
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        단가
                        <ArrowUpDown size={12} style={{ opacity: sortField === "unitPrice" ? 1 : 0.4 }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: "400", color: "var(--text-secondary)", marginTop: "0.1rem" }}>(백만원)</span>
                    </div>
                  </th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "45px", verticalAlign: "middle" }}>단위</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "50px", verticalAlign: "middle" }}>수량</th>
                  <th 
                    onClick={() => handleSort("total")} 
                    style={{ padding: "0.5rem 0.3rem", textAlign: "center", fontWeight: "800", width: "105px", verticalAlign: "middle", cursor: "pointer", userSelect: "none" }}
                    title="금액 기준 정렬"
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        금액
                        <ArrowUpDown size={12} style={{ opacity: sortField === "total" ? 1 : 0.4 }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: "400", color: "var(--text-secondary)", marginTop: "0.1rem" }}>(백만원)</span>
                    </div>
                  </th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "720px", verticalAlign: "middle" }}>구입목적 및 활용계획</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "500px", whiteSpace: "nowrap" }}>
                    구매 절차
                    <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "500", marginTop: "0.15rem" }}>
                      [기획∙승인(PA : 1~5) ⇨ 구매신청(Pr : 6) ⇨ 입찰∙계약(BC : 7) ⇨ 검수(I : 8)]
                    </span>
                  </th>
                  <th style={{ padding: "0.5rem 0.3rem", textAlign: "center", fontWeight: "800", width: "48px", verticalAlign: "middle", lineHeight: "1.2" }}>관련<br />문서</th>
                  {currentRole.id !== "GUEST" && (
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "48px", verticalAlign: "middle" }}>제어</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const activeEquipList = equipData;
                  
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

                      const getEquipStatus = (eq: ProcurementItem) => {
                        if (!eq.dateP && !eq.datePr && !eq.dateB && !eq.dateI) {
                          return "준비중";
                        }
                        const todayStr = new Date().toISOString().substring(0, 10);
                        if (eq.dateI && todayStr >= eq.dateI) return "구매 완료";
                        if (eq.dateB && todayStr >= eq.dateB) return "입찰중";
                        if (eq.datePr && todayStr >= eq.datePr) return "구매중";
                        if (eq.dateP && todayStr >= eq.dateP) return "결재중";
                        if (eq.dateP && todayStr < eq.dateP) return "준비중";
                        
                        if (eq.dateI) return "구매 완료";
                        if (eq.dateB) return "입찰중";
                        if (eq.datePr) return "구매중";
                        if (eq.dateP) return "결재중";
                        return "준비중";
                      };

                      const _currentStatus = getEquipStatus(equip);

                      const monthsOrder = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2"];
                      const getMonthIndexLocal = (dateStr?: string) => {
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
                      const idxPr = getMonthIndexLocal(equip.datePr);
                      const idxB = getMonthIndexLocal(equip.dateB);
                      const idxI = getMonthIndexLocal(equip.dateI);

                      const _getPhaseColor = (code: string) => {
                        const colors: Record<string, string> = {
                          "PA": "#f59e0b",
                          "Pr": "#a78bfa",
                          "BC": "#06b6d4",
                          "I": "#10b981"
                        };
                        return colors[code] || "#38bdf8";
                      };

                      const _getPhaseLabel = (code: string) => {
                        const labels: Record<string, string> = {
                          "PA": "기획∙승인",
                          "Pr": "구매신청",
                          "BC": "입찰∙계약",
                          "I": "검수"
                        };
                        return labels[code] || "미정";
                      };

                      const activePhases = [];
                      const phaseWeightLocal = { "PA": 1, "Pr": 2, "BC": 3, "I": 4 };
                      if (idxP !== null) activePhases.push({ phase: "PA", idx: idxP, weight: phaseWeightLocal["PA"], date: equip.dateP, label: "기획∙승인", color: "#f59e0b" });
                      if (idxPr !== null) activePhases.push({ phase: "Pr", idx: idxPr, weight: phaseWeightLocal["Pr"], date: equip.datePr, label: "구매신청", color: "#a78bfa" });
                      if (idxB !== null) activePhases.push({ phase: "BC", idx: idxB, weight: phaseWeightLocal["BC"], date: equip.dateB, label: "입찰∙계약", color: "#06b6d4" });
                      if (idxI !== null) activePhases.push({ phase: "I", idx: idxI, weight: phaseWeightLocal["I"], date: equip.dateI, label: "검수", color: "#10b981" });

                      let _lastActivePhase = null;
                      if (activePhases.length > 0) {
                        const sortedActive = [...activePhases].sort((a, b) => {
                          if (a.idx !== b.idx) return b.idx - a.idx;
                          return b.weight - a.weight;
                        });
                        _lastActivePhase = sortedActive[0];
                      }

                      const arrowsToRender = [];
                      const segments = [
                        { start: idxP, end: idxPr, color: "#f59e0b" },
                        { start: idxPr, end: idxB, color: "#a78bfa" },
                        { start: idxB, end: idxI, color: "#06b6d4" }
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
                          style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.15s ease" }}
                        >
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)" }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "750", color: "var(--accent-color)" }}>
                            {equip.unit}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "600" }}>
                            {(() => {
                              const dName = equip.deptName || "";
                              const divName = equip.divisionName || "";
                              if (dName && divName) {
                                return `${dName} / ${divName}`;
                              }
                              return dName || divName || "-";
                            })()}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700", color: "var(--text-primary)", fontSize: "0.82rem" }}>
                            {equip.itemName || equip.name || "-"}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)", fontSize: "0.78rem" }} title={equip.spec}>
                            {equip.spec || "-"}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-primary)", fontWeight: "600" }}>
                            {formatToMillionWon(price)}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                            {equip.itemUnit || "-"}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-primary)", fontWeight: "600" }}>
                            {qty}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700", color: darkMode ? "#34d399" : "#059669" }}>
                            {formatToMillionWon(total)}
                          </td>
                          <td style={{ padding: "0.8rem 0.75rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)", width: "720px" }} title={equip.description || equip.opPlan}>
                            {(() => {
                              // 개행으로 구분된 데이터를 구입목적과 활용계획으로 쪼갭니다 (요구사항 3)
                              const text = equip.description || equip.opPlan || "";
                              const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean);
                              const purpose = lines[0] || "-";
                              const plan = lines[1] || "-";
                              return (
                                <div style={{
                                  display: "inline-flex",
                                  flexDirection: "column",
                                  gap: "0.35rem",
                                  lineHeight: "1.4",
                                  fontSize: "0.78rem",
                                  textAlign: "left"
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
                          
                          {/* 7. 구매 절차 가로 마일스톤 노드 (요청: 주요 용역과 같은 모양의 그림으로 변경) */}
                          <td style={{ padding: "0.8rem 0.5rem", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", width: "100%" }}>
                              {[
                                { dateKey: "dateP", label: "기획∙승인", code: "PA", colorLight: "#d97706", colorDark: "#f59e0b", bgLight: "#fef3c7", bgDark: "rgba(245, 158, 11, 0.2)" },
                                { dateKey: "datePr", label: "구매신청", code: "Pr", colorLight: "#1d4ed8", colorDark: "#60a5fa", bgLight: "#dbeafe", bgDark: "rgba(59, 130, 246, 0.2)" },
                                { dateKey: "dateB", label: "입찰∙계약", code: "BC", colorLight: "#7c3aed", colorDark: "#c084fc", bgLight: "#f3e8ff", bgDark: "rgba(167, 139, 250, 0.2)" },
                                { dateKey: "dateI", label: "검수", code: "I", colorLight: "#059669", colorDark: "#34d399", bgLight: "#d1fae5", bgDark: "rgba(16, 185, 129, 0.2)" }
                              ].map((step, sIdx) => {
                                const hasDate = !!equip[step.dateKey];
                                const rawDate = equip[step.dateKey]; // YYYY-MM-DD
                                let formattedDate = "";
                                if (hasDate && rawDate.includes("-")) {
                                  const parts = rawDate.split("-");
                                  formattedDate = `${parts[1]}.${parts[2]}`; // MM.DD 포맷
                                }

                                const activeColor = darkMode ? step.colorDark : step.colorLight;
                                const activeBg = darkMode ? step.bgDark : step.bgLight;

                                return (
                                  <React.Fragment key={step.code}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "46px" }}>
                                      <div 
                                        style={{
                                          padding: "0.22rem 0.45rem",
                                          borderRadius: "14px",
                                          fontSize: "0.68rem",
                                          fontWeight: "800",
                                          background: hasDate ? activeBg : (darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(113, 113, 122, 0.08)"),
                                          color: hasDate ? activeColor : "var(--text-secondary)",
                                          border: hasDate ? `1.5px solid ${activeColor}55` : "1.5px solid var(--border-color)",
                                          whiteSpace: "nowrap",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          boxShadow: hasDate ? `0 1px 3px ${activeColor}15` : "none",
                                          transition: "all 0.2s ease"
                                        }}
                                        title={`${step.label}(${step.code}) ${hasDate ? `: ${rawDate}` : "(미지정)"}`}
                                      >
                                        <span>{step.code}</span>
                                      </div>
                                      <span style={{ fontSize: "0.62rem", color: hasDate ? "var(--text-primary)" : "var(--text-secondary)", marginTop: "0.2rem", fontWeight: hasDate ? "800" : "normal" }}>
                                        {hasDate ? formattedDate : "-"}
                                      </span>
                                    </div>
                                    {sIdx < 3 && (
                                      <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: "900", opacity: 0.35 }}>➔</span>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </td>

                          <td style={{ padding: "0.8rem 0.2rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)", width: "48px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center", width: "100%" }}>
                              {/* 1. 기획문서 버튼 (파란색 테마) */}
                              <button
                                onClick={() => setProposalModalData(equip)}
                                style={{
                                  padding: "0.2rem 0",
                                  fontSize: "0.65rem",
                                  borderRadius: "4px",
                                  background: darkMode ? "rgba(59, 130, 246, 0.18)" : "#eff6ff",
                                  color: darkMode ? "#60a5fa" : "#1d4ed8",
                                  border: darkMode ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(37, 99, 235, 0.4)",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  width: "34px",
                                  fontWeight: "700"
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(59, 130, 246, 0.28)" : "#dbeafe";
                                  e.currentTarget.style.borderColor = darkMode ? "#60a5fa" : "#2563eb";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(59, 130, 246, 0.18)" : "#eff6ff";
                                  e.currentTarget.style.borderColor = darkMode ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.4)";
                                }}
                                title="기획 제안서 요약 보기"
                              >
                                기획
                              </button>

                              {/* 2. 구매문서 버튼 (보라색 테마) */}
                              <button
                                onClick={() => setPurchaseModalData(equip)}
                                style={{
                                  padding: "0.2rem 0",
                                  fontSize: "0.65rem",
                                  borderRadius: "4px",
                                  background: darkMode ? "rgba(167, 139, 250, 0.18)" : "#f5f3ff",
                                  color: darkMode ? "#c084fc" : "#6d28d9",
                                  border: darkMode ? "1px solid rgba(167, 139, 250, 0.4)" : "1px solid rgba(109, 40, 217, 0.4)",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  width: "34px",
                                  fontWeight: "700"
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(167, 139, 250, 0.28)" : "#ede9fe";
                                  e.currentTarget.style.borderColor = darkMode ? "#c084fc" : "#7c3aed";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(167, 139, 250, 0.18)" : "#f5f3ff";
                                  e.currentTarget.style.borderColor = darkMode ? "rgba(167, 139, 250, 0.4)" : "rgba(109, 40, 217, 0.4)";
                                }}
                                title="구매 발송문서 요약 보기"
                              >
                                구매
                              </button>

                              {/* 3. 입찰문서 버튼 (초록색 테마) */}
                              <button
                                onClick={() => setBidModalData(equip)}
                                style={{
                                  padding: "0.2rem 0",
                                  fontSize: "0.65rem",
                                  borderRadius: "4px",
                                  background: darkMode ? "rgba(16, 185, 129, 0.18)" : "#ecfdf5",
                                  color: darkMode ? "#34d399" : "#047857",
                                  border: darkMode ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(5, 150, 105, 0.4)",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  width: "34px",
                                  fontWeight: "700"
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(16, 185, 129, 0.28)" : "#d1fae5";
                                  e.currentTarget.style.borderColor = darkMode ? "#34d399" : "#059669";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = darkMode ? "rgba(16, 185, 129, 0.18)" : "#ecfdf5";
                                  e.currentTarget.style.borderColor = darkMode ? "rgba(16, 185, 129, 0.4)" : "rgba(5, 150, 105, 0.4)";
                                }}
                                title="입찰 규격 공고 보기"
                              >
                                입찰
                              </button>
                            </div>
                          </td>
                          {currentRole.id !== "GUEST" && (
                            <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap", width: "48px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center", width: "100%" }}>
                                {(["ADMIN", "G_DIRECTOR", "HQ_HEAD", "TEAM_LEADER", "MANAGER"].includes(currentRole.id) || !equip.created_by || equip.created_by === currentUser?.uuid) && (
                                  <button
                                    onClick={() => openEditModal(equip)}
                                    style={{
                                      background: darkMode ? "rgba(255, 255, 255, 0.08)" : "#f4f4f5",
                                      border: darkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #d4d4d8",
                                      borderRadius: "4px",
                                      color: darkMode ? "#e4e4e7" : "#27272a",
                                      padding: "0.2rem 0",
                                      fontSize: "0.65rem",
                                      fontWeight: "700",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                      textAlign: "center",
                                      whiteSpace: "nowrap",
                                      width: "34px"
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                                      e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)";
                                      e.currentTarget.style.color = darkMode ? "#60a5fa" : "#1d4ed8";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.background = darkMode ? "rgba(255, 255, 255, 0.08)" : "#f4f4f5";
                                      e.currentTarget.style.borderColor = darkMode ? "rgba(255, 255, 255, 0.15)" : "#d4d4d8";
                                      e.currentTarget.style.color = darkMode ? "#e4e4e7" : "#27272a";
                                    }}
                                    title="기자재 수정"
                                  >
                                    수정
                                  </button>
                                )}
                                {(["ADMIN", "G_DIRECTOR", "HQ_HEAD", "TEAM_LEADER", "MANAGER"].includes(currentRole.id) || !equip.created_by || equip.created_by === currentUser?.uuid) && (
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
                                      background: darkMode ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
                                      border: darkMode ? "1px solid rgba(239, 68, 68, 0.45)" : "1px solid rgba(239, 68, 68, 0.4)",
                                      borderRadius: "4px",
                                      color: darkMode ? "#f87171" : "#b91c1c",
                                      padding: "0.2rem 0",
                                      fontSize: "0.65rem",
                                      fontWeight: "700",
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                      textAlign: "center",
                                      whiteSpace: "nowrap",
                                      width: "34px"
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                                      e.currentTarget.style.borderColor = "#ef4444";
                                      e.currentTarget.style.color = "#ef4444";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.background = darkMode ? "rgba(239, 68, 68, 0.15)" : "#fef2f2";
                                      e.currentTarget.style.borderColor = darkMode ? "rgba(239, 68, 68, 0.45)" : "rgba(239, 68, 68, 0.4)";
                                      e.currentTarget.style.color = darkMode ? "#f87171" : "#b91c1c";
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
                        <td colSpan={13} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
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
                <ListFilter size={16} style={{ color: "var(--text-secondary)" }} />
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
                <ListFilter size={16} style={{ color: "var(--text-secondary)" }} />
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
                <ListFilter size={16} style={{ color: "var(--text-secondary)" }} />
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
                  className="action-btn"
                  onClick={() => openAddModal("service")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "9999px",
                    background: "var(--accent-color)",
                    border: "none",
                    color: "white",
                    fontWeight: "700",
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

          {/* 💡 [교육용 한글 주석] 주요 용역 처리 절차를 시각적으로 보여주는 가로 흐름 스텝바를 배치합니다. */}
          <div className="glass-card" style={{ padding: "1rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "1.1rem" }}>💼</span>
              <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: "800", color: "var(--text-primary)" }}>주요 용역 처리 절차 안내</h4>
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.35rem", 
              overflowX: "auto", 
              paddingBottom: "0.25rem",
              scrollbarWidth: "thin",
              msOverflowStyle: "none"
            }}>
              {[
                { no: "01", name: "기획", dept: "앵커사업단", desc: "사업계획서 반영분 구체화", tooltip: "사업계획서 상의 주요 용역 사업 구체화 및 상세 계획 수립" },
                { no: "02", name: "내부결재 승인", dept: "앵커사업단", desc: "과업지시서 작성", tooltip: "용역 제안서 요구사항이 명시된 과업지시서 작성 및 결재 승인" },
                { no: "03", name: "구매의뢰", dept: "앵커사업단 ➔ 총무팀", desc: "구매의뢰 요청", tooltip: "총무팀을 향한 공식 용역 조달/구매 의뢰 및 접수" },
                { no: "04", name: "업체선정 평가", dept: "총무팀 외", desc: "입찰 시 제안서 심사", tooltip: "💡 입찰 진행 시:\n제안서 심사 및 업체 선정을 위한 서류/프레젠테이션 평가위원회 구성 및 평가" },
                { no: "05", name: "업체 선정 및 계약", dept: "총무팀", desc: "낙찰 및 계약 체결", tooltip: "우수업체 최종 협상, 낙찰자 결정 및 정식 용역 계약 체결" },
                { no: "06", name: "용역 수행", dept: "선정 업체", desc: "과업수행 계획 이행", tooltip: "계약업체의 과업 이행 및 진행 진척도 관리" },
                { no: "07", name: "검수", dept: "총무팀 / 앵커사업단", desc: "산출물 최종 검수", tooltip: "완료 보고서 및 과업 결과물의 적합성 판정 및 검수" },
                { no: "08", name: "집행완료", dept: "재무회계팀", desc: "대금 지급 및 정산 완료", tooltip: "재무회계팀을 통한 용역 대금 최종 송금 및 예산 정산 완료" }
              ].map((step, idx, arr) => (
                <React.Fragment key={step.no}>
                  <div 
                    title={step.tooltip}
                    style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center", 
                      minWidth: "120px", 
                      textAlign: "center",
                      flex: 1,
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.25rem",
                      background: step.no === "04" ? "rgba(16, 185, 129, 0.12)" : "var(--body-bg)", // 확실한 대비를 위해 body-bg 적용
                      border: step.no === "04" ? "1.5px solid var(--accent-color)" : "1.5px solid var(--border-color)", // 1.5px로 외곽선 보강
                      borderRadius: "6px",
                      padding: "0.35rem 0.5rem",
                      width: "100%",
                      justifyContent: "center",
                      transition: "all 0.2s ease"
                    }}>
                      <span style={{ 
                        fontSize: "0.65rem", 
                        fontWeight: "800", 
                        color: step.no === "04" ? "white" : "var(--accent-color)", 
                        background: step.no === "04" ? "var(--accent-color)" : "rgba(16, 185, 129, 0.15)",
                        borderRadius: "50%",
                        width: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>{step.no}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{step.name}</span>
                    </div>
                    <span style={{ 
                      fontSize: "0.6rem", 
                      color: "var(--text-secondary)", 
                      marginTop: "0.25rem", 
                      whiteSpace: "nowrap" 
                    }}>{step.dept}</span>
                    <span style={{ 
                      fontSize: "0.55rem", 
                      color: "var(--text-secondary)", // 라이트/다크 모드 전체 가시성 연동
                      marginTop: "0.05rem", 
                      whiteSpace: "nowrap" 
                    }}>{step.desc}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <span style={{ 
                      fontSize: "1rem", 
                      color: "var(--text-secondary)", // 라이트/다크 모드 전체 가시성 연동
                      fontWeight: "900",
                      userSelect: "none",
                      padding: "0 0.1rem"
                    }}>➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 주요 용역 테이블 */}
          <div className="glass-card" style={{ padding: "0.25rem", borderRadius: "12px", overflowX: "auto", border: "1px solid var(--border-color)", background: "var(--panel-bg)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "var(--text-primary)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", background: "transparent" }}>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "55px", whiteSpace: "nowrap" }}>순번</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "150px", whiteSpace: "nowrap" }}>프로그램 ID</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "150px", whiteSpace: "nowrap" }}>운영부서</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "220px", whiteSpace: "nowrap" }}>용역명</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "160px", whiteSpace: "nowrap" }}>사업예산/집행액(천원)</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "340px", whiteSpace: "nowrap" }}>용역목적 및 수행결과</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "500px", whiteSpace: "nowrap" }}>
                    용역 절차
                    <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "500", marginTop: "0.15rem" }}>
                      [기획∙승인(PA : 1∙2) ⇨ 구매의뢰(RP : 3) ⇨ 평가∙선정∙계약(ESC : 4∙5) ⇨ 수행(E : 6) ⇨ 검수(I : 7)]
                    </span>
                  </th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "140px", whiteSpace: "nowrap" }}>관련문서</th>
                  <th style={{ padding: "0.85rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "800", width: "80px", whiteSpace: "nowrap" }}>제어</th>
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
                        style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.15s ease" }}
                      >
                        {/* 1. 순번 */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)" }}>
                          {idx + 1}
                        </td>

                        {/* 2. 프로그램 ID // (프로그램명) */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700" }}>
                          <div style={{ color: "var(--accent-color)", fontSize: "0.82rem" }}>
                            {equip.programId || `[${equip.unit}]`}
                          </div>
                          {equip.programName && (
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.72rem", marginTop: "0.15rem", fontWeight: "normal" }}>
                              ({equip.programName})
                            </div>
                          )}
                        </td>

                        {/* 3. 운영부서 */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "600", fontSize: "0.8rem" }}>
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
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", fontWeight: "700", color: "var(--text-primary)" }}>
                          {equip.title || "-"}
                        </td>

                        {/* 5. 사업예산 / 집행액(천원) */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#3b82f6" }}>
                            예산: {Math.round((equip.budgetPlan || 0) / 1000).toLocaleString()}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#10B981", marginTop: "0.15rem", fontWeight: "700" }}>
                            집행: {Math.round((equip.budgetSpent || 0) / 1000).toLocaleString()}
                          </div>
                        </td>

                        {/* 6. 용역목적 및 수행결과 */}
                        <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", verticalAlign: "middle", color: "var(--text-secondary)" }}>
                          <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.35rem", lineHeight: "1.4", fontSize: "0.78rem", textAlign: "left" }}>
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
                              { dateKey: "datePp", label: "기획∙승인", code: "PA", colorLight: "#d97706", colorDark: "#f59e0b", bgLight: "#fef3c7", bgDark: "rgba(245, 158, 11, 0.2)" },
                              { dateKey: "dateRfo", label: "구매의뢰", code: "RP", colorLight: "#1d4ed8", colorDark: "#60a5fa", bgLight: "#dbeafe", bgDark: "rgba(59, 130, 246, 0.2)" },
                              { dateKey: "dateB", label: "평가∙선정∙계약", code: "ESC", colorLight: "#7c3aed", colorDark: "#c084fc", bgLight: "#f3e8ff", bgDark: "rgba(167, 139, 250, 0.2)" },
                              { dateKey: "dateE", label: "수행", code: "E", colorLight: "#b45309", colorDark: "#facc15", bgLight: "#fef9c3", bgDark: "rgba(234, 179, 8, 0.2)" },
                              { dateKey: "dateI", label: "검수", code: "I", colorLight: "#059669", colorDark: "#34d399", bgLight: "#d1fae5", bgDark: "rgba(16, 185, 129, 0.2)" }
                            ].map((step, sIdx) => {
                              const hasDate = !!equip[step.dateKey];
                              const rawDate = equip[step.dateKey]; // YYYY-MM-DD
                              let formattedDate = "";
                              if (hasDate && rawDate.includes("-")) {
                                const parts = rawDate.split("-");
                                formattedDate = `${parts[1]}.${parts[2]}`; // MM.DD 포맷
                              }

                              const activeColor = darkMode ? step.colorDark : step.colorLight;
                              const activeBg = darkMode ? step.bgDark : step.bgLight;

                              return (
                                <React.Fragment key={step.code}>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "46px" }}>
                                    <div 
                                      style={{
                                        padding: "0.22rem 0.45rem",
                                        borderRadius: "14px",
                                        fontSize: "0.68rem",
                                        fontWeight: "800",
                                        background: hasDate ? activeBg : (darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(113, 113, 122, 0.08)"),
                                        color: hasDate ? activeColor : "var(--text-secondary)",
                                        border: hasDate ? `1.5px solid ${activeColor}55` : "1.5px solid var(--border-color)",
                                        whiteSpace: "nowrap",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        boxShadow: hasDate ? `0 1px 3px ${activeColor}15` : "none",
                                        transition: "all 0.2s ease"
                                      }}
                                      title={`${step.label}(${step.code}) ${hasDate ? `: ${rawDate}` : "(미지정)"}`}
                                    >
                                      <span>{step.code}</span>
                                    </div>
                                    <span style={{ fontSize: "0.62rem", color: hasDate ? "var(--text-primary)" : "var(--text-secondary)", marginTop: "0.2rem", fontWeight: hasDate ? "800" : "normal" }}>
                                      {hasDate ? formattedDate : "-"}
                                    </span>
                                  </div>
                                  {sIdx < 4 && (
                                    <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: "900", opacity: 0.35 }}>➔</span>
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
                                background: darkMode ? "rgba(59, 130, 246, 0.18)" : "#eff6ff",
                                color: darkMode ? "#60a5fa" : "#1d4ed8",
                                border: darkMode ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(37, 99, 235, 0.4)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center",
                                fontWeight: "700"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = darkMode ? "rgba(59, 130, 246, 0.28)" : "#dbeafe";
                                e.currentTarget.style.borderColor = darkMode ? "#60a5fa" : "#2563eb";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = darkMode ? "rgba(59, 130, 246, 0.18)" : "#eff6ff";
                                e.currentTarget.style.borderColor = darkMode ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.4)";
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
                                background: darkMode ? "rgba(139, 92, 246, 0.18)" : "#f5f3ff",
                                color: darkMode ? "#a78bfa" : "#6d28d9",
                                border: darkMode ? "1px solid rgba(139, 92, 246, 0.4)" : "1px solid rgba(109, 40, 217, 0.4)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center",
                                fontWeight: "700"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = darkMode ? "rgba(139, 92, 246, 0.28)" : "#ede9fe";
                                e.currentTarget.style.borderColor = darkMode ? "#a78bfa" : "#7c3aed";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = darkMode ? "rgba(139, 92, 246, 0.18)" : "#f5f3ff";
                                e.currentTarget.style.borderColor = darkMode ? "rgba(139, 92, 246, 0.4)" : "rgba(109, 40, 217, 0.4)";
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
                                background: darkMode ? "rgba(16, 185, 129, 0.18)" : "#ecfdf5",
                                color: darkMode ? "#34d399" : "#047857",
                                border: darkMode ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(5, 150, 105, 0.4)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                textAlign: "center",
                                fontWeight: "700"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = darkMode ? "rgba(16, 185, 129, 0.28)" : "#d1fae5";
                                e.currentTarget.style.borderColor = darkMode ? "#34d399" : "#059669";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = darkMode ? "rgba(16, 185, 129, 0.18)" : "#ecfdf5";
                                e.currentTarget.style.borderColor = darkMode ? "rgba(16, 185, 129, 0.4)" : "rgba(5, 150, 105, 0.4)";
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
                            {currentRole.id !== "GUEST" && (["ADMIN", "G_DIRECTOR", "HQ_HEAD", "TEAM_LEADER", "MANAGER"].includes(currentRole.id) || !equip.created_by || equip.created_by === currentUser?.uuid) && (
                              <>
                                <button 
                                  onClick={() => openEditModal(equip)}
                                  className="btn btn-secondary"
                                  style={{
                                    padding: "0.25rem 0.45rem",
                                    fontSize: "0.65rem",
                                    background: darkMode ? "rgba(255, 255, 255, 0.08)" : "#f4f4f5",
                                    border: darkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #d4d4d8",
                                    borderRadius: "4px",
                                    color: darkMode ? "#e4e4e7" : "#27272a",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    width: "38px",
                                    textAlign: "center",
                                    transition: "all 0.15s ease"
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
                                    e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)";
                                    e.currentTarget.style.color = darkMode ? "#60a5fa" : "#1d4ed8";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.background = darkMode ? "rgba(255, 255, 255, 0.08)" : "#f4f4f5";
                                    e.currentTarget.style.borderColor = darkMode ? "rgba(255, 255, 255, 0.15)" : "#d4d4d8";
                                    e.currentTarget.style.color = darkMode ? "#e4e4e7" : "#27272a";
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
                                    background: darkMode ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
                                    border: darkMode ? "1px solid rgba(239, 68, 68, 0.45)" : "1px solid rgba(239, 68, 68, 0.4)",
                                    borderRadius: "4px",
                                    color: darkMode ? "#f87171" : "#b91c1c",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    width: "38px",
                                    textAlign: "center",
                                    transition: "all 0.15s ease"
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                                    e.currentTarget.style.borderColor = "#ef4444";
                                    e.currentTarget.style.color = "#ef4444";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.background = darkMode ? "rgba(239, 68, 68, 0.15)" : "#fef2f2";
                                    e.currentTarget.style.borderColor = darkMode ? "rgba(239, 68, 68, 0.45)" : "rgba(239, 68, 68, 0.4)";
                                    e.currentTarget.style.color = darkMode ? "#f87171" : "#b91c1c";
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
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 1100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          padding: "2rem 1rem"
        }}>
          <div style={{
            background: "var(--modal-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "0.75rem",
            width: "100%",
            maxWidth: "780px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            color: "var(--text-primary)",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            margin: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ margin: 0, color: "var(--text-primary)", fontWeight: "800", fontSize: "1.1rem" }}>
                {modalType === "env" && "🛠️ 신규 교육환경 개선 사업 등록"}
                {modalType === "equip" && (isEditMode ? "🔬 핵심 기자재 도입 정보 수정" : "🔬 신규 핵심 기자재 도입 등록")}
                {modalType === "service" && "💼 신규 주요 용역 계약 등록"}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1, overflowY: "auto" }}>
              
              {/* 환경개선용 입력 필드들 */}
              {modalType === "env" && (
                <>
                  {/* 첫번째 줄: 단위과제, 사업연차 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>단위과제</label>
                      <select 
                        name="unit" 
                        value={formData.unit} 
                        onChange={handleInputChange} 
                        className="form-select" 
                      >
                        {Number(formData.year || selectedYear) === 1 
                          ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                          : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "X0", "Common"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                        }
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>사업연차</label>
                      <select 
                        name="year" 
                        value={formData.year || selectedYear} 
                        onChange={handleInputChange} 
                        className="form-select" 
                      >
                        <option value={1}>1차년도 (2025년)</option>
                        <option value={2}>2차년도 (2026년)</option>
                      </select>
                    </div>
                  </div>

                  {/* 두번째 줄: 학과 선택, 부서 선택 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.25rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>학과 선택</label>
                      <select 
                        name="deptName" 
                        value={formData.deptName} 
                        onChange={handleInputChange}
                        className="form-select"
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
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>부서 선택</label>
                      <select 
                        name="divisionName" 
                        value={formData.divisionName} 
                        onChange={handleInputChange}
                        className="form-select"
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
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>구축 공간명</label>
                      <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 3층 RISE 바이오 메디컬 실습실 구축" className="form-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>구축 위치 (지정 호실)</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="예: 대학 본관 302호" className="form-input" />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>사업비 (백만원)</label>
                      <input 
                        type="number" 
                        name="unitPrice" 
                        step="0.01" 
                        value={formData.unitPrice} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="예: 50.00" 
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>현재 실제 집행액 (백만원)</label>
                      <input 
                        type="number" 
                        name="budgetSpent" 
                        step="0.01" 
                        value={formData.budgetSpent} 
                        onChange={handleInputChange} 
                        placeholder="예: 10.50" 
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* 다섯번째 줄: 개선단계 일정 지정 (선택 입력) */}
                  <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.95rem", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "1rem" }}>
                    <span style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                      📅 개선단계 일정 지정 (선택 입력)
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>기획∙승인(PA) 일</label>
                        <input type="date" name="dateP" value={formData.dateP || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>요청∙설계(RD) 일</label>
                        <input type="date" name="dateA" min={formData.dateP || ""} value={formData.dateA || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>구매∙입찰∙계약(PBC) 일</label>
                        <input type="date" name="dateB" min={formData.dateA || formData.dateP || ""} value={formData.dateB || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>시공(C) 일</label>
                        <input type="date" name="datePr" min={formData.dateB || formData.dateA || formData.dateP || ""} value={formData.datePr || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.2rem", whiteSpace: "nowrap" }}>검수(I) 일</label>
                        <input type="date" name="dateI" min={formData.datePr || formData.dateB || formData.dateA || formData.dateP || ""} value={formData.dateI || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>구축 목적 (공간 용도)</label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} required placeholder="특화 인력 양성을 위한 핵심 시너지 공간 용도 상세 기술" className="form-textarea" style={{ height: "50px", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>향후 활용 계획</label>
                    <input type="text" name="utilization" value={formData.utilization} onChange={handleInputChange} required placeholder="예: 공간 연계 교육과정 활용 방식 및 융합 연구 활용" className="form-input" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>세부 공간 구축 설계 계획 (선택)</label>
                    <textarea name="plan" value={formData.plan} onChange={handleInputChange} placeholder="예: 바닥 전선 몰딩, 방음벽 흡음 패널 시공 및 스마트 미러링 보드 마운팅 작업" className="form-textarea" style={{ height: "50px", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>공사 진행 실적 현황 (선택)</label>
                    <textarea name="progress" value={formData.progress} onChange={handleInputChange} placeholder="현재 진행 실무 정보 기술" className="form-textarea" style={{ height: "50px", resize: "none" }} />
                  </div>
                </>
              )}

              {/* 기자재용 입력 필드들 */}
              {modalType === "equip" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>단위과제</label>
                      <select 
                        name="unit" 
                        value={formData.unit} 
                        onChange={handleInputChange} 
                        className="form-select" 
                      >
                        {Number(formData.year || selectedYear) === 1 
                          ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                          : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "X0", "Common"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                        }
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>사업연차 선택</label>
                      <select 
                        name="year" 
                        value={formData.year || selectedYear} 
                        onChange={handleInputChange} 
                        className="form-select" 
                      >
                        <option value={1}>1차년도 (2025년)</option>
                        <option value={2}>2차년도 (2026년)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>연계 프로그램</label>
                    <select 
                      name="operation" 
                      value={formData.operation} 
                      onChange={handleInputChange} 
                      className="form-select" 
                    >
                      {getDynamicPrograms(formData.unit).map((p: any) => (
                        <option key={p.id} value={p.name}>[{p.id}] {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>학과 선택</label>
                      <select 
                        name="deptName" 
                        value={formData.deptName} 
                        onChange={handleInputChange}
                        className="form-select"
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
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>부서 선택</label>
                      <select 
                        name="divisionName" 
                        value={formData.divisionName} 
                        onChange={handleInputChange}
                        className="form-select"
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
                  {/* 기자재 관리번호 입력란 (선택 항목으로 변경, 바코드 삭제) */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                      기자재 관리번호 <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "normal" }}>(선택 - 검수 완료 후 기재)</span>
                    </label>
                    <input 
                      type="text" 
                      name="asset_number" 
                      value={formData.asset_number || ""} 
                      onChange={handleInputChange} 
                      placeholder="예: AIDX-EQ-2026-004 (검수 완료 시점에 수동 입력)" 
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>품명</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="예: 임상 실습용 스마트 베드" className="form-input" />
                  </div>
                  {(modalType as string) !== "env" && (
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>규격</label>
                      <input type="text" name="spec" value={formData.spec || ""} onChange={handleInputChange} placeholder="예: 20자유도(DoF) 초정밀 관절 제어 메커니즘 탑재" className="form-input" />
                    </div>
                  )}
                  {(modalType as string) !== "env" && (() => {
                    const priceVal = parseFloat(formData.unitPrice || 0);
                    const qtyVal = parseFloat(formData.quantity || 0);
                    const totalInMillion = (priceVal * qtyVal).toFixed(2);
                    return (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", gap: "1rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>단가 (백만원)</label>
                            <input type="number" name="unitPrice" step="0.01" value={formData.unitPrice} onChange={handleInputChange} required placeholder="예: 120.00" className="form-input" />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>단위</label>
                            <input type="text" name="itemUnit" value={formData.itemUnit || ""} onChange={handleInputChange} placeholder="예: 대, 개, 세트" className="form-input" />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>수량</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required placeholder="예: 2" className="form-input" />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>금액 (백만원)</label>
                            <input type="text" value={`${parseFloat(totalInMillion).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 백만원`} readOnly style={{ width: "100%", padding: "0.55rem 0.9rem", background: "rgba(255,255,255,0.02)", border: "1.5px solid var(--border-color)", borderRadius: "8px", color: "#10B981", fontWeight: "bold" }} />
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>구입목적</label>
                            <textarea name="descriptionPurpose" value={formData.descriptionPurpose || ""} onChange={handleInputChange} required placeholder="기자재의 구입 목적 및 타당성 상세 기술" className="form-textarea" style={{ height: "60px", resize: "none" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>활용계획</label>
                            <textarea name="descriptionPlan" value={formData.descriptionPlan || ""} onChange={handleInputChange} required placeholder="핵심 활용 계획 및 예상 시너지 상세 기술" className="form-textarea" style={{ height: "60px", resize: "none" }} />
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {(modalType as string) === "env" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>구축목적</label>
                        <textarea name="descriptionPurpose" value={formData.descriptionPurpose || ""} onChange={handleInputChange} required placeholder="환경구축의 목적 및 타당성 상세 기술" className="form-textarea" style={{ height: "60px", resize: "none" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>활용계획</label>
                        <textarea name="descriptionPlan" value={formData.descriptionPlan || ""} onChange={handleInputChange} required placeholder="핵심 활용 계획 및 예상 시너지 상세 기술" className="form-textarea" style={{ height: "60px", resize: "none" }} />
                      </div>
                    </div>
                  )}
                  
                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <span style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.75rem" }}>
                      📅 단계별 이벤트 일자 입력 (선택 입력)
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: (modalType as string) === "env" ? "repeat(5, 1fr)" : "repeat(4, 1fr)", gap: "0.5rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                          기획∙승인(PA) 일자
                        </label>
                        <input type="date" name="dateP" value={formData.dateP || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                      {(modalType as string) === "env" && (
                        <>
                          <div>
                            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                              요청∙설계(RD) 일자
                            </label>
                            <input type="date" name="dateA" value={formData.dateA || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                              구매∙입찰∙계약(PBC) 일자
                            </label>
                            <input type="date" name="dateB" value={formData.dateB || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                              시공(C) 일자
                            </label>
                            <input type="date" name="datePr" value={formData.datePr || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                          </div>
                        </>
                      )}
                      {(modalType as string) !== "env" && (
                        <>
                          <div>
                            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                              구매신청(Pr) 일자
                            </label>
                            <input type="date" name="datePr" value={formData.datePr || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                              입찰∙계약(BC) 일자
                            </label>
                            <input type="date" name="dateB" value={formData.dateB || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                          </div>
                        </>
                      )}
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                          검수(I) 일자
                        </label>
                        <input type="date" name="dateI" value={formData.dateI || ""} onChange={handleInputChange} className="form-input" style={{ fontSize: "0.72rem", padding: "0.4rem 0.35rem" }} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {(modalType === "env" || modalType === "equip") && (
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)", marginTop: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#60A5FA" }}>
                      {modalType === "env" ? "🤖 AI 문서 분석 및 요약 등록 (기획, 구매, 결과)" : "🤖 AI 문서 분석 및 요약 등록 (기획, 구매, 입찰)"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "700" }}>AI 엔진:</span>
                      <select
                        value={aiEngine}
                        onChange={(e) => setAiEngine(e.target.value)}
                        style={{
                          background: "var(--input-bg)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "6px",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.72rem",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        <option value="gemini">Google Gemini API</option>
                        <option value="gpt">OpenAI GPT-4o API</option>
                        <option value="debate">AI 교차 토론 조합 (Gemini & GPT)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>


                      
                      {/* 1. 기획문서 업로드 및 AI 분석 (다중 파일 및 1대N 공유 연계 지원) */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#93C5FD" }}>
                            {modalType === "env" ? "1. 기획문서 (사업단 ➔ 시설안전관리팀)" : "1. 기획문서 (사업단 작성/결재)"}
                          </span>
                        </div>

                        {/* [교육용 주석] 하나의 기획문서가 여러 개의 구매(1대N)를 반영할 수 있도록 기존 결재 연계 드롭다운 신설 */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.75rem", background: "rgba(255,255,255,0.02)", padding: "0.5rem", borderRadius: "6px" }}>
                          <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "700" }}>
                            🔗 기존 등록된 기획 결재문서 가져오기 (1대N 공유 매칭)
                          </label>
                          <select
                            onChange={(e) => {
                              handleSelectLegacyProposal(e.target.value);
                              e.target.value = "";
                            }}
                            style={{
                              width: "100%",
                              background: "var(--input-bg)",
                              color: "var(--text-primary)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "4px",
                              padding: "0.25rem",
                              fontSize: "0.72rem",
                              cursor: "pointer"
                            }}
                          >
                            <option value="">-- 연계할 기존 기획결재번호 선택 --</option>
                            {getUniqueProposalDocs().map(doc => (
                              <option key={doc.docNo} value={doc.docNo}>
                                [{doc.docNo}] {doc.name.slice(0, 35)}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          {/* 파일 추가 인풋 */}
                          <input 
                            type="file" 
                            id="file-plan-upload" 
                            accept=".pdf,.doc,.docx,.hwp,.txt" 
                            onChange={(e) => handleFileChange("proposal", e)} 
                            style={{ display: "none" }} 
                          />

                          {/* 업로드된 다중 기획문서 목록 루프 */}
                          {(formData.docPlanFileList || []).map((fileItem: any) => (
                            <div key={fileItem.id} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", background: "rgba(0,0,0,0.3)", padding: "0.45rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.75rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }} title={fileItem.name}>
                                  📄 {fileItem.name} ({formatToThousandWon(fileItem.size)} KB)
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  {fileItem.aiData ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                      <span style={{ 
                                        fontSize: "0.7rem", 
                                        color: darkMode ? "#4ade80" : "#059669", 
                                        background: darkMode ? "rgba(74, 222, 128, 0.15)" : "rgba(5, 150, 105, 0.08)", 
                                        border: darkMode ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(5, 150, 105, 0.2)",
                                        borderRadius: "12px",
                                        padding: "0.15rem 0.5rem",
                                        fontWeight: "800",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem"
                                      }}>
                                        ✅ AI 분석완료 ({fileItem.aiData.docNo})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAnalyzeAndUpload("proposal", fileItem.id)}
                                        disabled={fileItem.isAnalyzing}
                                        style={{
                                          padding: "0.15rem 0.45rem",
                                          fontSize: "0.65rem",
                                          background: "rgba(255,255,255,0.06)",
                                          border: "1px solid var(--border-color)",
                                          color: "var(--text-secondary)",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          transition: "all 0.15s",
                                          fontWeight: "700"
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)";
                                          e.currentTarget.style.borderColor = "#3b82f6";
                                          e.currentTarget.style.color = "#3b82f6";
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                          e.currentTarget.style.borderColor = "var(--border-color)";
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                        title="현재 설정된 AI 모델로 문서 재분석 수행"
                                      >
                                        {fileItem.isAnalyzing ? "분석중..." : "재분석"}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAnalyzeAndUpload("proposal", fileItem.id)}
                                      disabled={fileItem.isAnalyzing}
                                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem", background: "#3b82f6", border: "none", color: "white", borderRadius: "4px", fontWeight: "700", cursor: "pointer" }}
                                    >
                                      {fileItem.isAnalyzing ? "분석중..." : "AI 분석"}
                                    </button>
                                  )}
                                  <button 
                                    type="button" 
                                    onClick={() => handleFileRemove("proposal", fileItem.id)} 
                                    style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.15rem" }}
                                    title="파일 제거"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                              {fileItem.uploadProgress > 0 && fileItem.uploadProgress < 100 && (
                                <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "1.5px", overflow: "hidden" }}>
                                  <div style={{ width: `${fileItem.uploadProgress}%`, height: "100%", background: "#3b82f6" }} />
                                </div>
                              )}
                            </div>
                          ))}
                          
                          <label 
                            htmlFor="file-plan-upload" 
                            style={{ display: "block", textAlign: "center", padding: "0.45rem", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.01)", fontSize: "0.72rem", color: "var(--text-secondary)" }}
                          >
                            ➕ 신규 기획문서 추가 업로드 (.pdf, .docx, .hwp)
                          </label>
                        </div>
                      </div>
 
                      {/* 2. 구매문서 업로드 및 AI 분석 (다중 파일 업로드 지원) */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#C084FC" }}>
                            {modalType === "env" ? "2. 구매문서 (시설안전관리팀)" : "2. 구매문서 (총무팀 발송)"}
                          </span>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          <input 
                            type="file" 
                            id="file-purchase-upload" 
                            accept=".pdf,.doc,.docx,.hwp,.txt" 
                            onChange={(e) => handleFileChange("purchase", e)} 
                            style={{ display: "none" }} 
                          />

                          {/* 업로드된 다중 구매문서 목록 루프 */}
                          {(formData.docPurchaseFileList || []).map((fileItem: any) => (
                            <div key={fileItem.id} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", background: "rgba(0,0,0,0.3)", padding: "0.45rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.75rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }} title={fileItem.name}>
                                  📄 {fileItem.name} ({formatToThousandWon(fileItem.size)} KB)
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  {fileItem.aiData ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                      <span style={{ 
                                        fontSize: "0.7rem", 
                                        color: darkMode ? "#4ade80" : "#059669", 
                                        background: darkMode ? "rgba(74, 222, 128, 0.15)" : "rgba(5, 150, 105, 0.08)", 
                                        border: darkMode ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(5, 150, 105, 0.2)",
                                        borderRadius: "12px",
                                        padding: "0.15rem 0.5rem",
                                        fontWeight: "800",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem"
                                      }}>
                                        ✅ AI 분석완료 ({fileItem.aiData.docNo})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAnalyzeAndUpload("purchase", fileItem.id)}
                                        disabled={fileItem.isAnalyzing}
                                        style={{
                                          padding: "0.15rem 0.45rem",
                                          fontSize: "0.65rem",
                                          background: "rgba(255,255,255,0.06)",
                                          border: "1px solid var(--border-color)",
                                          color: "var(--text-secondary)",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          transition: "all 0.15s",
                                          fontWeight: "700"
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.background = "rgba(167, 139, 250, 0.12)";
                                          e.currentTarget.style.borderColor = "#a78bfa";
                                          e.currentTarget.style.color = "#a78bfa";
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                          e.currentTarget.style.borderColor = "var(--border-color)";
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                        title="현재 설정된 AI 모델로 문서 재분석 수행"
                                      >
                                        {fileItem.isAnalyzing ? "분석중..." : "재분석"}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAnalyzeAndUpload("purchase", fileItem.id)}
                                      disabled={fileItem.isAnalyzing}
                                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem", background: "#a78bfa", border: "none", color: "white", borderRadius: "4px", fontWeight: "700", cursor: "pointer" }}
                                    >
                                      {fileItem.isAnalyzing ? "분석중..." : "AI 분석"}
                                    </button>
                                  )}
                                  <button 
                                    type="button" 
                                    onClick={() => handleFileRemove("purchase", fileItem.id)} 
                                    style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.15rem" }}
                                    title="파일 제거"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                              {fileItem.uploadProgress > 0 && fileItem.uploadProgress < 100 && (
                                <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "1.5px", overflow: "hidden" }}>
                                  <div style={{ width: `${fileItem.uploadProgress}%`, height: "100%", background: "#a78bfa" }} />
                                </div>
                              )}
                            </div>
                          ))}
                          
                          <label 
                            htmlFor="file-purchase-upload" 
                            style={{ display: "block", textAlign: "center", padding: "0.45rem", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.01)", fontSize: "0.72rem", color: "var(--text-secondary)" }}
                          >
                            ➕ 신규 구매문서 추가 업로드 (.pdf, .docx, .hwp)
                          </label>
                        </div>
                      </div>

                      {/* 3. 입찰/결과문서 업로드 및 AI 분석 (다중 파일 업로드 지원) */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#34D399" }}>
                            {modalType === "env" ? "3. 결과문서 (시설안전관리팀)" : "3. 입찰문서 (총무팀 작성)"}
                          </span>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          <input 
                            type="file" 
                            id="file-bid-upload" 
                            accept=".pdf,.doc,.docx,.hwp,.txt" 
                            onChange={(e) => handleFileChange("bid", e)} 
                            style={{ display: "none" }} 
                          />

                          {/* 업로드된 다중 입찰문서 목록 루프 */}
                          {(formData.docBidFileList || []).map((fileItem: any) => (
                            <div key={fileItem.id} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", background: "rgba(0,0,0,0.3)", padding: "0.45rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.75rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }} title={fileItem.name}>
                                  📄 {fileItem.name} ({formatToThousandWon(fileItem.size)} KB)
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  {fileItem.aiData ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                      <span style={{ 
                                        fontSize: "0.7rem", 
                                        color: darkMode ? "#4ade80" : "#059669", 
                                        background: darkMode ? "rgba(74, 222, 128, 0.15)" : "rgba(5, 150, 105, 0.08)", 
                                        border: darkMode ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(5, 150, 105, 0.2)",
                                        borderRadius: "12px",
                                        padding: "0.15rem 0.5rem",
                                        fontWeight: "800",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem"
                                      }}>
                                        ✅ AI 분석완료 ({fileItem.aiData.docNo})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAnalyzeAndUpload("bid", fileItem.id)}
                                        disabled={fileItem.isAnalyzing}
                                        style={{
                                          padding: "0.15rem 0.45rem",
                                          fontSize: "0.65rem",
                                          background: "rgba(255,255,255,0.06)",
                                          border: "1px solid var(--border-color)",
                                          color: "var(--text-secondary)",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          transition: "all 0.15s",
                                          fontWeight: "700"
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.background = "rgba(52, 211, 153, 0.12)";
                                          e.currentTarget.style.borderColor = "#34d399";
                                          e.currentTarget.style.color = "#34d399";
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                          e.currentTarget.style.borderColor = "var(--border-color)";
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                        title="현재 설정된 AI 모델로 문서 재분석 수행"
                                      >
                                        {fileItem.isAnalyzing ? "분석중..." : "재분석"}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAnalyzeAndUpload("bid", fileItem.id)}
                                      disabled={fileItem.isAnalyzing}
                                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem", background: "#34D399", border: "none", color: "white", borderRadius: "4px", fontWeight: "700", cursor: "pointer" }}
                                    >
                                      {fileItem.isAnalyzing ? "분석중..." : "AI 분석"}
                                    </button>
                                  )}
                                  <button 
                                    type="button" 
                                    onClick={() => handleFileRemove("bid", fileItem.id)} 
                                    style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.15rem" }}
                                    title="파일 제거"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                              {fileItem.uploadProgress > 0 && fileItem.uploadProgress < 100 && (
                                <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "1.5px", overflow: "hidden" }}>
                                  <div style={{ width: `${fileItem.uploadProgress}%`, height: "100%", background: "#34D399" }} />
                                </div>
                              )}
                            </div>
                          ))}
                          
                          <label 
                            htmlFor="file-bid-upload" 
                            style={{ display: "block", textAlign: "center", padding: "0.45rem", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.01)", fontSize: "0.72rem", color: "var(--text-secondary)" }}
                          >
                            {modalType === "env" ? "➕ 신규 결과문서 추가 업로드 (.pdf, .docx, .hwp)" : "➕ 신규 입찰문서 추가 업로드 (.pdf, .docx, .hwp)"}
                          </label>
                        </div>
                      </div>

                      {/* 4. 검수문서 업로드 및 AI 분석 (다중 파일 업로드 지원 - 요건 2 반영) */}
                      <div style={{ background: "rgba(255,255,255,0.01)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#FB7185" }}>
                            4. 검수문서 (사업단/총무팀 공동)
                          </span>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          <input 
                            type="file" 
                            id="file-check-upload" 
                            accept=".pdf,.doc,.docx,.hwp,.txt" 
                            onChange={(e) => handleFileChange("check", e)} 
                            style={{ display: "none" }} 
                          />

                          {/* 업로드된 다중 검수문서 목록 루프 */}
                          {(formData.docCheckFileList || []).map((fileItem: any) => (
                            <div key={fileItem.id} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", background: "rgba(0,0,0,0.3)", padding: "0.45rem 0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.75rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }} title={fileItem.name}>
                                  📄 {fileItem.name} ({formatToThousandWon(fileItem.size)} KB)
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  {fileItem.aiData ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                      <span style={{ 
                                        fontSize: "0.7rem", 
                                        color: darkMode ? "#4ade80" : "#059669", 
                                        background: darkMode ? "rgba(74, 222, 128, 0.15)" : "rgba(5, 150, 105, 0.08)", 
                                        border: darkMode ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(5, 150, 105, 0.2)",
                                        borderRadius: "12px",
                                        padding: "0.15rem 0.5rem",
                                        fontWeight: "800",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem"
                                      }}>
                                        ✅ AI 분석완료 ({fileItem.aiData.docNo})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAnalyzeAndUpload("check", fileItem.id)}
                                        disabled={fileItem.isAnalyzing}
                                        style={{
                                          padding: "0.15rem 0.45rem",
                                          fontSize: "0.65rem",
                                          background: "rgba(255,255,255,0.06)",
                                          border: "1px solid var(--border-color)",
                                          color: "var(--text-secondary)",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          transition: "all 0.15s",
                                          fontWeight: "700"
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.background = "rgba(251, 113, 133, 0.12)";
                                          e.currentTarget.style.borderColor = "#FB7185";
                                          e.currentTarget.style.color = "#FB7185";
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                          e.currentTarget.style.borderColor = "var(--border-color)";
                                          e.currentTarget.style.color = "var(--text-secondary)";
                                        }}
                                        title="현재 설정된 AI 모델로 문서 재분석 수행"
                                      >
                                        {fileItem.isAnalyzing ? "분석중..." : "재분석"}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAnalyzeAndUpload("check", fileItem.id)}
                                      disabled={fileItem.isAnalyzing}
                                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem", background: "#FB7185", border: "none", color: "white", borderRadius: "4px", fontWeight: "700", cursor: "pointer" }}
                                    >
                                      {fileItem.isAnalyzing ? "분석중..." : "AI 분석"}
                                    </button>
                                  )}
                                  <button 
                                    type="button" 
                                    onClick={() => handleFileRemove("check", fileItem.id)} 
                                    style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.15rem" }}
                                    title="파일 제거"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                              {fileItem.uploadProgress > 0 && fileItem.uploadProgress < 100 && (
                                <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "1.5px", overflow: "hidden" }}>
                                  <div style={{ width: `${fileItem.uploadProgress}%`, height: "100%", background: "#FB7185" }} />
                                </div>
                              )}
                            </div>
                          ))}
                          
                          <label 
                            htmlFor="file-check-upload" 
                            style={{ display: "block", textAlign: "center", padding: "0.45rem", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.01)", fontSize: "0.72rem", color: "var(--text-secondary)" }}
                          >
                            ➕ 신규 검수문서 추가 업로드 (.pdf, .docx, .hwp)
                          </label>
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
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>단위과제</label>
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
                        className="form-select" 
                      >
                        {Number(formData.year || selectedYear) === 1 
                          ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                          : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "X0", "Common"].map(u => (
                              <option key={u} value={u}>{u} 과제</option>
                            ))
                        }
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>연계 프로그램 (진행 상황)</label>
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
                        className="form-select" 
                      >
                        <option value="">(연계 프로그램 선택 안 함)</option>
                        {getDynamicPrograms(formData.unit).map((prog: any) => (
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
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련학과 (배정 학과) <span style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: "700" }}>(학과/부서 중 택1 필수)</span></label>
                      <select 
                        name="deptName" 
                        value={formData.deptName} 
                        onChange={handleInputChange} 
                        className="form-select" 
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
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>관련부서 (배정 행정부서) <span style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: "700" }}>(학과/부서 중 택1 필수)</span></label>
                      <select 
                        name="divisionName" 
                        value={formData.divisionName} 
                        onChange={handleInputChange} 
                        className="form-select" 
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
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>용역 명칭 (500만원 이상) <span style={{ color: "var(--danger-color)" }}>*</span></label>
                      <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="예: 앵커 산학 네트워크 포럼 기획 운영 대행 용역" 
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>용역목적 (추진 목적) <span style={{ color: "var(--danger-color)" }}>*</span></label>
                      <input 
                        type="text" 
                        name="purpose" 
                        value={formData.purpose} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="예: 해당 용역이 해결하고자 하는 문제 및 목표" 
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* 네번째 줄: 수행결과 (선택 입력) */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>수행결과 (선택)</label>
                    <textarea 
                      name="opResult" 
                      value={formData.opResult} 
                      onChange={handleInputChange} 
                      placeholder="예: 최종 용역 수행 결과 및 납품 결과 기술" 
                      className="form-textarea"
                      style={{ height: "50px", resize: "none" }}
                    />
                  </div>

                  {/* 다섯번째 줄: 사업예산(천원), 집행액(천원) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>사업예산 (천원)</label>
                      <input 
                        type="number" 
                        name="budgetPlan" 
                        value={formData.budgetPlan} 
                        onChange={handleInputChange} 
                        placeholder="예: 25000 (2천5백만원)" 
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>집행액 (천원)</label>
                      <input 
                        type="number" 
                        name="budgetSpent" 
                        value={formData.budgetSpent} 
                        onChange={handleInputChange} 
                        placeholder="예: 20000 (2천만원)" 
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* 5대 행정 절차 날짜 입력 필드 */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#60A5FA", display: "block", marginBottom: "0.5rem" }}>📅 5대 행정 절차 완료 일자 설정</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "#f59e0b", marginBottom: "0.15rem", whiteSpace: "nowrap" }}>기획∙승인(PA)</label>
                        <input type="date" name="datePp" value={formData.datePp || ""} onChange={handleInputChange} className="form-input" style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "#3b82f6", marginBottom: "0.15rem", whiteSpace: "nowrap" }}>구매의뢰(RP)</label>
                        <input type="date" name="dateRfo" min={formData.datePp || ""} value={formData.dateRfo || ""} onChange={handleInputChange} className="form-input" style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "#06b6d4", marginBottom: "0.15rem", whiteSpace: "nowrap" }}>평가∙선정∙계약(ESC)</label>
                        <input type="date" name="dateB" min={formData.dateRfo || formData.datePp || ""} value={formData.dateB || ""} onChange={handleInputChange} className="form-input" style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "#eab308", marginBottom: "0.15rem", whiteSpace: "nowrap" }}>수행(E)</label>
                        <input type="date" name="dateE" min={formData.dateB || formData.dateRfo || formData.datePp || ""} value={formData.dateE || ""} onChange={handleInputChange} className="form-input" style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.68rem", color: "#10b981", marginBottom: "0.15rem", whiteSpace: "nowrap" }}>검수(I)</label>
                        <input type="date" name="dateI" min={formData.dateE || formData.dateB || formData.dateRfo || formData.datePp || ""} value={formData.dateI || ""} onChange={handleInputChange} className="form-input" style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }} />
                      </div>
                    </div>
                  </div>

                  {/* 3종 관련 문서 파일 첨부 및 AI 자동분석 패널 */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#a78bfa", display: "block", marginBottom: "0.5rem" }}>📎 행정 서류 첨부 및 AI Debate 분석 연계</span>
                    
                    {/* 1. 기획문서 첨부 (다중 파일 및 1대N 연계 지원) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.75rem", background: "rgba(255,255,255,0.01)", padding: "0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700" }}>기획서 관련 문서 (사업단 작성 기안문)</label>
                      
                      {/* 1대N 공유 연계용 드롭다운 */}
                      <select
                        onChange={(e) => {
                          handleSelectLegacyProposal(e.target.value);
                          e.target.value = "";
                        }}
                        style={{
                          background: "var(--input-bg)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "4px",
                          padding: "0.2rem",
                          fontSize: "0.7rem",
                          cursor: "pointer",
                          marginBottom: "0.4rem"
                        }}
                      >
                        <option value="">-- 연계할 기존 기획결재번호 선택 (1대N) --</option>
                        {getUniqueProposalDocs().map(doc => (
                          <option key={doc.docNo} value={doc.docNo}>
                            [{doc.docNo}] {doc.name.slice(0, 30)}
                          </option>
                        ))}
                      </select>

                      <input type="file" id="file-plan-upload-serv" onChange={(e) => handleFileChange("proposal", e)} style={{ display: "none" }} />
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {(formData.docPlanFileList || []).map((fileItem: any) => (
                          <div key={fileItem.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", background: "rgba(0,0,0,0.2)", padding: "0.35rem 0.5rem", borderRadius: "4px" }}>
                            <span style={{ fontSize: "0.72rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
                              📄 {fileItem.name} ({formatToThousandWon(fileItem.size)} KB)
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              {fileItem.aiData ? (
                                <span style={{ fontSize: "0.68rem", color: "#10B981", fontWeight: "800" }}>
                                  ✅ Debate 완료 ({fileItem.aiData.docNo})
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAnalyzeAndUpload("proposal", fileItem.id)}
                                  disabled={fileItem.isAnalyzing}
                                  style={{ padding: "0.15rem 0.4rem", fontSize: "0.65rem", background: "#3b82f6", border: "none", color: "white", borderRadius: "3px", fontWeight: "700" }}
                                >
                                  {fileItem.isAnalyzing ? "토론중..." : "Debate 분석"}
                                </button>
                              )}
                              <button type="button" onClick={() => handleFileRemove("proposal", fileItem.id)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.1rem" }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        <label htmlFor="file-plan-upload-serv" style={{ display: "block", textAlign: "center", padding: "0.35rem", border: "1px dashed var(--border-color)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.01)", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                          ➕ 기획문서 추가 선택 (.pdf, .docx, .hwp)
                        </label>
                      </div>
                    </div>

                    {/* 2. 구매문서 첨부 (다중 파일 지원) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.75rem", background: "rgba(255,255,255,0.01)", padding: "0.6rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700" }}>구매의뢰 관련 문서 (위탁 의뢰 이송 공문)</label>
                      <input type="file" id="file-purchase-upload-serv" onChange={(e) => handleFileChange("purchase", e)} style={{ display: "none" }} />
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {(formData.docPurchaseFileList || []).map((fileItem: any) => (
                          <div key={fileItem.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", background: "rgba(0,0,0,0.2)", padding: "0.35rem 0.5rem", borderRadius: "4px" }}>
                            <span style={{ fontSize: "0.72rem", color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
                              📄 {fileItem.name} ({formatToThousandWon(fileItem.size)} KB)
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              {fileItem.aiData ? (
                                <span style={{ fontSize: "0.68rem", color: "#10B981", fontWeight: "800" }}>
                                  ✅ Debate 완료 ({fileItem.aiData.docNo})
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAnalyzeAndUpload("purchase", fileItem.id)}
                                  disabled={fileItem.isAnalyzing}
                                  style={{ padding: "0.15rem 0.4rem", fontSize: "0.65rem", background: "#a78bfa", border: "none", color: "white", borderRadius: "3px", fontWeight: "700" }}
                                >
                                  {fileItem.isAnalyzing ? "토론중..." : "Debate 분석"}
                                </button>
                              )}
                              <button type="button" onClick={() => handleFileRemove("purchase", fileItem.id)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.1rem" }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        <label htmlFor="file-purchase-upload-serv" style={{ display: "block", textAlign: "center", padding: "0.35rem", border: "1px dashed var(--border-color)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.01)", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                          ➕ 구매문서 추가 선택 (.pdf, .docx, .hwp)
                        </label>
                      </div>
                    </div>

                    {/* 3. 결과문서 첨부 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>검수조서 관련 문서 (최종 준공/검수 보고서)</label>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input type="file" id="file-bid-upload-serv" onChange={(e) => handleFileChange("bid", e)} style={{ display: "none" }} />
                        <label htmlFor="file-bid-upload-serv" style={{ display: "block", flex: 1, textAlign: "center", padding: "0.45rem", border: "1px dashed var(--border-color)", borderRadius: "6px", cursor: "pointer", background: "rgba(255,255,255,0.02)", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
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
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "0.5rem", flexShrink: 0 }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem" }}
                >
                  {isEditMode ? "수정하기" : "새 항목 등록하기"}
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
                const activeEquipList = equipData;
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
      {proposalModalData && (() => {
        // 다중 기획 파일 리스트 빌드
        const planList = proposalModalData.docPlanFileList && Array.isArray(proposalModalData.docPlanFileList) && proposalModalData.docPlanFileList.length > 0
          ? proposalModalData.docPlanFileList
          : (proposalModalData.docPlanFileName ? [{
              id: "legacy-plan",
              name: proposalModalData.docPlanFileName,
              size: proposalModalData.docPlanFileSize || 0,
              url: proposalModalData.docPlanFileUrl || "",
              aiData: proposalModalData.aiProposalData || null
            }] : []);

        const activeFile = planList[selectedProposalIdx] || planList[0];
        const activeAi = activeFile?.aiData || null;

        return (
          <div style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.6)",
            zIndex: 1300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",
            padding: "2rem 1rem"
          }}>
            <div style={{
              background: "var(--modal-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "0.75rem",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              color: "var(--text-primary)",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
              margin: "auto",
              padding: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem", flexShrink: 0 }}>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#60A5FA", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  📄 기획문서 상세 조회 <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "var(--text-secondary)" }}>(사업단 작성)</span>
                </h4>
                <button 
                  onClick={() => {
                    setProposalModalData(null);
                    setSelectedProposalIdx(0);
                  }}
                  style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* 다중 파일이 존재할 경우 문서 선택기 콤보박스 노출 */}
              {planList.length > 1 && (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "#93C5FD", fontWeight: "700", marginBottom: "0.25rem" }}>
                    📚 첨부된 기획 결재문서 선택 ({planList.length}건)
                  </label>
                  <select
                    value={selectedProposalIdx}
                    onChange={(e) => setSelectedProposalIdx(Number(e.target.value))}
                    style={{
                      width: "100%",
                      background: "rgba(0,0,0,0.3)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      padding: "0.35rem",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    {planList.map((f: any, idx: number) => (
                      <option key={f.id || idx} value={idx}>
                        {idx + 1}. {f.name.slice(0, 45)} {f.aiData ? `(${f.aiData.docNo})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {activeAi ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                  <div style={{ background: "rgba(96, 165, 250, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(96, 165, 250, 0.25)" }}>
                    <span style={{ fontSize: "0.72rem", color: "#93C5FD", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>📝 기획문서 결재번호 (AI 분석 완료)</span>
                    <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                      {activeAi.docNo}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>단위과제</span>
                    <strong style={{ fontSize: "0.9rem" }}>{activeAi.unit}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>주관 부서</span>
                    <span>{activeAi.dept}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>과제 배정 예산 (단위: 천원)</span>
                    <strong style={{ color: "#3b82f6" }}>{activeAi.budget}</strong>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>주요 추진 전략 목표</span>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {(activeAi.goals || []).map((goal: string, idx: number) => (
                        <li key={idx} style={{ color: "rgba(255,255,255,0.85)" }}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (() => {
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
                        {activeFile?.name ? activeFile.name.replace(/\.[^/.]+$/, "") : (proposalModalData.docPlan || `UC-EQ-${proposalModalData.unit}-${String(proposalModalData.seq || proposalModalData.id).slice(-3).padStart(3, "0")}`)}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>단위과제</span>
                      <strong style={{ fontSize: "0.9rem" }}>{proposalModalData.unit} : {summary.title}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>주관 부서</span>
                      <span>{summary.dept}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>과제 배정 예산</span>
                      <strong style={{ color: "#3b82f6" }}>{convertMillionWonToThousandWon(summary.budget)}</strong>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>주요 추진 전략 목표</span>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {summary.goals.map((goal: string, idx: number) => (
                          <li key={idx} style={{ color: "rgba(255,255,255,0.85)" }}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", flexShrink: 0 }}>
                {activeFile?.url ? (
                  <a 
                    href={activeFile.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#60A5FA", textDecoration: "none", fontWeight: "700" }}
                  >
                    📎 첨부문서 다운로드
                  </a>
                ) : (
                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>첨부파일 없음</span>
                )}
                <button 
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setProposalModalData(null);
                    setSelectedProposalIdx(0);
                  }}
                  style={{ padding: "0.4rem 1.25rem", fontSize: "0.75rem" }}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 구매문서 팝업 모달 */}
      {purchaseModalData && (() => {
        // 다중 구매 파일 리스트 빌드
        const purchaseList = purchaseModalData.docPurchaseFileList && Array.isArray(purchaseModalData.docPurchaseFileList) && purchaseModalData.docPurchaseFileList.length > 0
          ? purchaseModalData.docPurchaseFileList
          : (purchaseModalData.docPurchaseFileName ? [{
              id: "legacy-purchase",
              name: purchaseModalData.docPurchaseFileName,
              size: purchaseModalData.docPurchaseFileSize || 0,
              url: purchaseModalData.docPurchaseFileUrl || "",
              aiData: purchaseModalData.aiPurchaseData || null
            }] : []);

        const activeFile = purchaseList[selectedPurchaseIdx] || purchaseList[0];
        const activeAi = activeFile?.aiData || null;

        const price = Number(purchaseModalData.unitPrice) || 0;
        const qty = Number(purchaseModalData.quantity) || 0;
        const total = price * qty;

        return (
          <div style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.6)",
            zIndex: 1300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto",
            padding: "2rem 1rem"
          }}>
            <div style={{
              background: "var(--modal-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "0.75rem",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              color: "var(--text-primary)",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
              margin: "auto",
              padding: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem", flexShrink: 0 }}>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#C084FC", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  📦 구매문서 상세 조회 <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "var(--text-secondary)" }}>(총무팀 발송)</span>
                </h4>
                <button 
                  onClick={() => {
                    setPurchaseModalData(null);
                    setSelectedPurchaseIdx(0);
                  }}
                  style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* 다중 파일이 존재할 경우 문서 선택기 콤보박스 노출 */}
              {purchaseList.length > 1 && (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "#D8B4FE", fontWeight: "700", marginBottom: "0.25rem" }}>
                    📚 첨부된 구매의뢰문서 선택 ({purchaseList.length}건)
                  </label>
                  <select
                    value={selectedPurchaseIdx}
                    onChange={(e) => setSelectedPurchaseIdx(Number(e.target.value))}
                    style={{
                      width: "100%",
                      background: "rgba(0,0,0,0.3)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      padding: "0.35rem",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    {purchaseList.map((f: any, idx: number) => (
                      <option key={f.id || idx} value={idx}>
                        {idx + 1}. {f.name.slice(0, 45)} {f.aiData ? `(${f.aiData.docNo})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {activeAi ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                  <div style={{ background: "rgba(167, 139, 250, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(167, 139, 250, 0.25)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "#D8B4FE", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>📦 구매문서 결재번호 (AI 분석 완료)</span>
                        <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                          {activeAi.docNo}
                        </strong>
                      </div>
                      {activeAi.mgmtNo && (
                        <div style={{ borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: "0.4rem" }}>
                          <span style={{ fontSize: "0.72rem", color: "#D8B4FE", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>⚙️ 기자재 관리번호</span>
                          <strong style={{ fontFamily: "monospace", color: "#34D399", fontSize: "1.15rem", letterSpacing: "0.5px" }}>
                            {activeAi.mgmtNo}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>품명 및 수량</span>
                    <strong style={{ fontSize: "0.9rem" }}>{purchaseModalData.itemName || purchaseModalData.name || "-"} / {qty}대 (세트)</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>발신 부서 / 발송처</span>
                    <span>{activeAi.fromDept} / <strong>{activeAi.toDept}</strong></span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>도입 소요예산 (단위: 천원)</span>
                    <strong style={{ color: "#a78bfa" }}>{activeAi.budget}</strong>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.4rem" }}>조달 위탁 요청 기술 사양</span>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: "1.5", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {(activeAi.specs || []).map((spec: string, idx: number) => (
                        <li key={idx} style={{ color: "rgba(255,255,255,0.85)" }}>{spec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.85rem" }}>
                  <div style={{ background: "rgba(167, 139, 250, 0.08)", padding: "0.85rem", borderRadius: "8px", border: "1px solid rgba(167, 139, 250, 0.25)" }}>
                    <span style={{ fontSize: "0.72rem", color: "#D8B4FE", display: "block", marginBottom: "0.2rem", fontWeight: "700" }}>📦 구매문서 결재번호 (총무팀 수신부서 이송공문)</span>
                    <strong style={{ fontFamily: "monospace", color: "#FBBF24", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
                      {activeFile?.name ? activeFile.name.replace(/\.[^/.]+$/, "") : (purchaseModalData.docPurchase || `UC-PR-${purchaseModalData.unit}-${String(purchaseModalData.seq || purchaseModalData.id).slice(-3).padStart(3, "0")}`)}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>품명 및 수량</span>
                    <strong style={{ fontSize: "0.9rem" }}>{purchaseModalData.itemName || purchaseModalData.name || "-"} / {qty}대 (세트)</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>발신 부서 / 발송처</span>
                    <span>{purchaseModalData.divisionName || purchaseModalData.deptName || "앵커사업단"} / <strong>총무팀 (구매 위탁 요청)</strong></span>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>도입 소요예산</span>
                    <strong style={{ color: "#a78bfa" }}>{(total / 1000).toLocaleString()}천원 (VAT 포함)</strong>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>발송 공문 비고</span>
                    <span style={{ color: "rgba(255,255,255,0.8)" }}>
                      본 문서는 사업단 내부 기획/결재가 완료되어, 조달 진행 및 위탁 발주를 위해 총무팀으로 발송 처리된 행정 이송 결재 연계 상태 문서입니다.
                    </span>
                  </div>
                </div>
              )}
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", flexShrink: 0 }}>
                {activeFile?.url ? (
                  <a 
                    href={activeFile.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#C084FC", textDecoration: "none", fontWeight: "700" }}
                  >
                    📎 첨부문서 다운로드
                  </a>
                ) : (
                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>첨부파일 없음</span>
                )}
                <button 
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setPurchaseModalData(null);
                    setSelectedPurchaseIdx(0);
                  }}
                  style={{ padding: "0.4rem 1.25rem", fontSize: "0.75rem" }}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 입찰/결과문서 팝업 모달 */}
      {bidModalData && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)",
          zIndex: 1300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          padding: "2rem 1rem"
        }}>
          <div style={{
            background: "var(--modal-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "0.75rem",
            width: "100%",
            maxWidth: "550px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            color: "var(--text-primary)",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            margin: "auto",
            padding: "1.5rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem", flexShrink: 0 }}>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#10B981", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {subTab === "env_improvement" ? (
                  <>📜 결과문서 <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "var(--text-secondary)" }}>(시설안전관리팀 시공/준공 결과)</span></>
                ) : (
                  <>📜 입찰문서 <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "var(--text-secondary)" }}>(총무팀 작성 문서)</span></>
                )}
              </h4>
              <button 
                onClick={() => setBidModalData(null)}
                style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
              >
                <X size={18} />
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
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>
                          {isEnv ? "준공 및 검수 부서" : "공고 및 낙찰 부서"}
                        </span>
                        <strong style={{ color: "#34D399" }}>
                          {isEnv ? "시설안전관리팀" : "대학본부 총무팀"}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>
                          {isEnv ? "준공 시공 상태" : "입찰 계약 방식"}
                        </span>
                        <span style={{ fontWeight: "700", color: "#10b981" }}>{ai.method}</span>
                      </div>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700", width: "140px" }}>
                            {isEnv ? "구축 공간명" : "품명"}
                          </td>
                          <td style={{ padding: "0.5rem", color: "var(--text-primary)", fontWeight: "700" }}>{bidModalData.itemName || bidModalData.name || "-"}</td>
                        </tr>
                        {isEnv ? (
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>지정 호실/위치</td>
                            <td style={{ padding: "0.5rem" }}>{bidModalData.location || "지정 안 됨"}</td>
                          </tr>
                        ) : (
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>도입 단가 / 수량</td>
                            <td style={{ padding: "0.5rem" }}>{(price / 1000).toLocaleString()}천원 / {qty}대</td>
                          </tr>
                        )}
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>
                            {isEnv ? "총 집행 공사비" : "배정 예산 규모"}
                          </td>
                          <td style={{ padding: "0.5rem", fontWeight: "800", color: "#10B981" }}>{ai.budget}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>
                            {isEnv ? "최종 시공 완료일" : "입찰 등록 마감"}
                          </td>
                          <td style={{ padding: "0.5rem", color: "#FBBF24", fontWeight: "700" }}>{ai.deadline}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>
                            {isEnv ? "시공 범위 및 실적" : "참가 자격 및 규격"}
                          </td>
                          <td style={{ padding: "0.5rem", color: "rgba(255,255,255,0.85)", lineHeight: "1.4" }}>
                            {(ai.qualifications || []).map((qual: string, idx: number) => (
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
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>작성 부서</span>
                      <strong style={{ color: "#34D399" }}>
                        {isEnv ? "시설안전관리팀" : "대학본부 총무팀"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>
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
                        <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700", width: "120px" }}>
                          {isEnv ? "구축 공간명" : "품명"}
                        </td>
                        <td style={{ padding: "0.5rem", color: "var(--text-primary)", fontWeight: "700" }}>{bidModalData.itemName || bidModalData.name || "-"}</td>
                      </tr>
                      {isEnv ? (
                        <>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>구축 위치</td>
                            <td style={{ padding: "0.5rem" }}>{bidModalData.location || "지정 안 됨"}</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>최종 집행액</td>
                            <td style={{ padding: "0.5rem", fontWeight: "800", color: "#10B981" }}>{(Number(bidModalData.budgetSpent || 0) / 1000).toLocaleString()}천원</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>구매 수량</td>
                            <td style={{ padding: "0.5rem" }}>{qty} 대(세트)</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>도입 단가</td>
                            <td style={{ padding: "0.5rem", fontWeight: "700", color: "#60A5FA" }}>{(price / 1000).toLocaleString()}천원</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>소요 예산</td>
                            <td style={{ padding: "0.5rem", fontWeight: "800", color: "#10B981" }}>{(total / 1000).toLocaleString()}천원 (부가가치세 포함)</td>
                          </tr>
                        </>
                      )}
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>
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
                        <td style={{ padding: "0.5rem", background: "var(--input-bg)", fontWeight: "700" }}>
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
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", flexShrink: 0 }}>
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
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>첨부파일 없음</span>
              )}
              <button 
                type="button"
                className="btn-primary"
                onClick={() => setBidModalData(null)}
                style={{ padding: "0.4rem 1.25rem", fontSize: "0.75rem" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모던 토스트 팝업 알림창 */}
      {toast && (
        <div 
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: toast.type === "success" 
              ? "rgba(16, 185, 129, 0.95)" 
              : toast.type === "error" 
                ? "rgba(239, 68, 68, 0.95)" 
                : "rgba(59, 130, 246, 0.95)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            padding: "0.85rem 1.6rem",
            borderRadius: "10px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            fontSize: "0.85rem",
            fontWeight: "700",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            animation: "toastFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            pointerEvents: "none"
          }}
        >
          <span style={{ fontSize: "1.1rem" }}>
            {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
          </span>
          <span>{toast.message}</span>
          <style>{`
            @keyframes toastFadeIn {
              from {
                opacity: 0;
                transform: translateY(1.5rem) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}
