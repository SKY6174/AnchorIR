import React, { useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent as ReactMouseEvent } from "react";
import { supabase } from "../supabaseClient"; // Supabase 클라이언트 연동 (요건 3 반영)
import * as pdfjsLib from "pdfjs-dist";
import { ProcurementEnvironmentPanel } from "../features/procurement/components/procurement-environment-panel";
import { ProcurementEquipmentPanel } from "../features/procurement/components/procurement-equipment-panel";
import { ProcurementServicesPanel } from "../features/procurement/components/procurement-services-panel";
import { ProcurementProposalModal } from "../features/procurement/components/procurement-proposal-modal";
import { ProcurementPurchaseModal } from "../features/procurement/components/procurement-purchase-modal";
import { ProcurementBidResultModal } from "../features/procurement/components/procurement-bid-result-modal";
import { ProcurementFormModal } from "../features/procurement/components/procurement-form-modal";

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
        <ProcurementEnvironmentPanel
          currentRole={currentRole}
          currentUser={currentUser}
          deptFilter={deptFilter}
          divisionFilter={divisionFilter}
          envData={envData}
          getMilestonesFromDates={getMilestonesFromDates}
          getMonthIndex={getMonthIndex}
          handleSort={handleSort}
          monthsOrder={monthsOrder}
          openAddModal={openAddModal}
          openEditModal={openEditModal}
          phaseWeight={phaseWeight}
          selectedEquipUnit={selectedEquipUnit}
          selectedYear={selectedYear}
          setBidModalData={setBidModalData}
          setDeptFilter={setDeptFilter}
          setDivisionFilter={setDivisionFilter}
          setEnvData={setEnvData}
          setProposalModalData={setProposalModalData}
          setPurchaseModalData={setPurchaseModalData}
          setSelectedEquipUnit={setSelectedEquipUnit}
          sortDirection={sortDirection}
          sortField={sortField}
        />
      )}


      {/* 2. 기자재 구입·운영 탭 본문 */}
      {subTab === "equipment_purchase" && (
        <ProcurementEquipmentPanel
          currentRole={currentRole}
          currentUser={currentUser}
          darkMode={darkMode}
          deptFilter={deptFilter}
          divisionFilter={divisionFilter}
          equipData={equipData}
          formatToMillionWon={formatToMillionWon}
          handleSort={handleSort}
          openAddModal={openAddModal}
          openEditModal={openEditModal}
          selectedEquipUnit={selectedEquipUnit}
          selectedYear={selectedYear}
          setBidModalData={setBidModalData}
          setDeptFilter={setDeptFilter}
          setDivisionFilter={setDivisionFilter}
          setEquipData={setEquipData}
          setProposalModalData={setProposalModalData}
          setPurchaseModalData={setPurchaseModalData}
          setSelectedEquipUnit={setSelectedEquipUnit}
          sortDirection={sortDirection}
          sortField={sortField}
        />
      )}

      {/* 3. 주요 용역 탭 본문 */}
      {subTab === "major_services" && (
        <ProcurementServicesPanel
          currentRole={currentRole}
          currentUser={currentUser}
          darkMode={darkMode}
          deptFilter={deptFilter}
          divisionFilter={divisionFilter}
          openAddModal={openAddModal}
          openEditModal={openEditModal}
          selectedEquipUnit={selectedEquipUnit}
          selectedYear={selectedYear}
          serviceData={serviceData}
          setBidModalData={setBidModalData}
          setDeptFilter={setDeptFilter}
          setDivisionFilter={setDivisionFilter}
          setProposalModalData={setProposalModalData}
          setPurchaseModalData={setPurchaseModalData}
          setSelectedEquipUnit={setSelectedEquipUnit}
          setServiceData={setServiceData}
        />
      )}

      {/* 추가 모달창 팝업 */}
      {isAddModalOpen && (
        <ProcurementFormModal
          aiEngine={aiEngine}
          darkMode={darkMode}
          formData={formData}
          formatToThousandWon={formatToThousandWon}
          getDynamicPrograms={getDynamicPrograms}
          getUniqueProposalDocs={getUniqueProposalDocs}
          handleAnalyzeAndUpload={handleAnalyzeAndUpload}
          handleFileChange={handleFileChange}
          handleFileRemove={handleFileRemove}
          handleFormSubmit={handleFormSubmit}
          handleInputChange={handleInputChange}
          handleSelectLegacyProposal={handleSelectLegacyProposal}
          isAnalyzingBid={isAnalyzingBid}
          isEditMode={isEditMode}
          modalType={modalType}
          selectedYear={selectedYear}
          setAiEngine={setAiEngine}
          setFormData={setFormData}
          setIsAddModalOpen={setIsAddModalOpen}
        />
      )}

      {/* 월별 Gantt 단계 다중 선택 플로팅 팝오버 컴포넌트 */}
      {activePopover && (
        <>
          <div
            onClick={() => setActivePopover(null)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200, background: "transparent" }}
            role="button"
            tabIndex={0}
            aria-label="팝오버 닫기"
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}
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
                // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- 체크박스 라벨 전체의 기존 hover 강조를 유지하며 실제 조작은 내부 input이 담당합니다.
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
                  <input id="a11y-procurement-manager-58"
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
        <ProcurementProposalModal
          PROPOSAL_SUMMARIES={PROPOSAL_SUMMARIES}
          convertMillionWonToThousandWon={convertMillionWonToThousandWon}
          proposalModalData={proposalModalData}
          selectedProposalIdx={selectedProposalIdx}
          setProposalModalData={setProposalModalData}
          setSelectedProposalIdx={setSelectedProposalIdx}
        />
      )}

      {/* 구매문서 팝업 모달 */}
      {purchaseModalData && (
        <ProcurementPurchaseModal
          purchaseModalData={purchaseModalData}
          selectedPurchaseIdx={selectedPurchaseIdx}
          setPurchaseModalData={setPurchaseModalData}
          setSelectedPurchaseIdx={setSelectedPurchaseIdx}
        />
      )}

      {/* 입찰/결과문서 팝업 모달 */}
      {bidModalData && (
        <ProcurementBidResultModal
          bidModalData={bidModalData}
          setBidModalData={setBidModalData}
          subTab={subTab}
        />
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
