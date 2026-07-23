import React, { useState, useEffect } from "react";
import { Info, Award, Layout, GitFork, ArrowRight, List } from "lucide-react";
import STRATEGY_TASK_MAPPING_Y1 from "../data/extracted_1st_year.json";
import {
  initialProjectsData,
  type ProgramData,
  type UnitData
} from "../data/mockData";


// 1. 프로젝트 및 단위과제 매핑 정보 정의 (2차년도 기준)
const PROJECTS_DATA = [
  {
    id: "A",
    title: "프로젝트 A : 울산에 뿌리내리는 정주형 실전 인재 양성(Dynamic TALENT)",
    units: [
      { id: "A1가", title: "지역과 미래를 만드는 UC-HYPER 전문기술인재양성" },
      { id: "A1나", title: "스마트·친환경선박 직업교육의 글로벌 스탠더드" },
      { id: "A2", title: "지역 창업 생태계 혁신을 위한 글로컬 창업 문화 조성" },
      { id: "A3", title: "지역 창업 생태계 혁신을 위한 글로컬 창업 문화 조성" }
    ]
  },
  {
    id: "B",
    title: "프로젝트 B : 기업과 하나되는 지⋅산⋅학⋅연 초연결 생태계 조성(Dynamic BRIDGE)",
    units: [
      { id: "B1", title: "울산지역 주력·신산업 분야 산학협력 체계 구축" },
      { id: "B2", title: "AID 역량강화 기반 지역산업 전환 지원" },
      { id: "B3", title: "지･산･학 협력 탄소중립 실천 플랫폼 구축" },
      { id: "B4", title: "복합재난 대응 산업안전·보건 통합 운영체계 구축" }
    ]
  },
  {
    id: "C",
    title: "프로젝트 C : 다시 뛰게 만드는 생애 ‘직무 도약’ 체계 구축(Dynamic JUMP)",
    units: [
      { id: "C1", title: "U-LIFE 평생직업교육 기반 취∙창업 연계모델 구축" },
      { id: "C2", title: "동남권과 함께 성장하는 돌봄생태계, 울산愛 구현" }
    ]
  },
  {
    id: "D",
    title: "프로젝트 D : 지역생활 안전⋅의료⋅정주 협력체계 구축(DynamicCARE)",
    units: [
      { id: "D1", title: "지역문제해결을 위한 울산형 혁신 솔루션 구축" },
      { id: "D2", title: "지속가능한 보건복지 특성화 및 인재양성 체계 구축" },
      { id: "D3", title: "에코 컬처로 만드는 꿀잼도시 울산" }
    ]
  }
];

// 1차년도 프로젝트 및 단위과제 매핑 정보 정의
const PROJECTS_DATA_Y1 = [
  {
    id: "A",
    title: "A. 지역 혁신 인재를 양성하는 Brain 대학",
    units: [
      { id: "A1", title: "지역과 미래를 만드는 UC-HYPER 전문기술 인재 양성" },
      { id: "A2", title: "지역 창업 생태계 혁신을 위한 글로컬 창업 문화 조성" }
    ]
  },
  {
    id: "B",
    title: "B. 지역과 상생하는 Bridge 대학",
    units: [
      { id: "B1", title: "중소·중견기업 맞춤형 기술지원·공동연구 활성화" },
      { id: "B2", title: "U-LIFE 평생직업교육 플랫폼 구축" },
      { id: "B3", title: "지역을 키우는 지역문제 해결 협력 체계 구축" }
    ]
  },
  {
    id: "C",
    title: "C. 혁신 모델을 확산하는 국가 대표 Brand 대학",
    units: [
      { id: "C1", title: "복합재난 대응 산업안전·보건 관리시스템 개발" },
      { id: "C2", title: "AID 역량강화 기반 지역산업 전환 지원" },
      { id: "C3", title: "교육·산업·복지가 조화로운 지속가능한 탄소중립" }
    ]
  },
  {
    id: "D",
    title: "D. 매력적인 도시로의 변화를 촉진하는 Booster 대학",
    units: [
      { id: "D1", title: "통합형 인재양성 기반 포용적 보건복지서비스 구현" },
      { id: "D2", title: "내일을 밝히는 ‘위드아이’ 늘봄 생태계 조성" },
      { id: "D3", title: "에코 컬처로 만드는 꿀잼도시 울산" },
      { id: "D4", title: "지역산업 연계 글로벌 협력 거점 대학 육성" }
    ]
  }
];

// 한글 조사의 은/는, 이/가, 을/를, 와/과를 문자열 끝자리 숫자의 받침 유무에 따라 자동 결정해주는 도우미 함수
const getJosa = (id: string): string => {
  if (!id) return "과";
  const lastChar = id.slice(-1);
  // 1(일), 3(삼), 6(육), 7(칠), 8(팔), 0(영) 은 받침이 있어 '과'가 적절함.
  if (["1", "3", "6", "7", "8", "0"].includes(lastChar)) {
    return "과";
  }
  return "와";
};

// 2. proposal 실재 데이터 기반 전략(S) 및 전략과제(T) & 프로그램(PG) 연동 맵핑 테이블
const STRATEGY_TASK_MAPPING = {
  "A1가": {
    "strategies": [
      {
        "id": "S1",
        "title": "지역인력 수요분석 기반 UC-HYPER 실무인재 양성"
      },
      {
        "id": "S2",
        "title": "교육과정 모니터링 체계 구축 및 성과 확산"
      },
      {
        "id": "S3",
        "title": "지역정주 지산학 맞춤형 고급 기술인재 양성"
      },
      {
        "id": "S4",
        "title": "하이퍼(Hyper-connected) 캠퍼스 구축 및 운영"
      },
      {
        "id": "S5",
        "title": "지역혁신 선도 인재양성 거버넌스 체계 구축 및 확산"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "UC-HYPER 교수학습모델 시범 적용"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "지역 맞춤형 주문식 교육과정 개편 및 확대 운영"
      },
      {
        "strat": "S1",
        "id": "3",
        "title": "지역 맞춤형 비교과 프로그램 개발 및 운영"
      },
      {
        "strat": "S2",
        "id": "4",
        "title": "ECC 성과확산 프로그램 운영"
      },
      {
        "strat": "S3",
        "id": "5",
        "title": "개방형 설계센터 전문가 활용 교육 지원"
      },
      {
        "strat": "S3",
        "id": "6",
        "title": "울산형 데이터 기술인재 양성 교육지원"
      },
      {
        "strat": "S3",
        "id": "7",
        "title": "표준형 현장실습 운영"
      },
      {
        "strat": "S3",
        "id": "8",
        "title": "기업 PBL 문제해결지원과제 운영, 산학 PBL 과제 운영"
      },
      {
        "strat": "S4",
        "id": "9",
        "title": "UC-HYPER 교육환경 구축(Udx-Lab 포함)"
      },
      {
        "strat": "S4",
        "id": "10",
        "title": "ECC 공유·협업 체계를 위한 인프라 구축"
      },
      {
        "strat": "S4",
        "id": "11",
        "title": "Udx 기반 AI 리터러시 정규/비정규 교육과정 개발/운영"
      },
      {
        "strat": "S5",
        "id": "13",
        "title": "울산 맞춤형 인재양성 거버넌스 구축"
      },
      {
        "strat": "S5",
        "id": "14",
        "title": "글로벌 지산학 혁신 거버넌스 구축"
      },
      {
        "strat": "S5",
        "id": "15",
        "title": "교직원 역량강화 프로그램 운영"
      }
    ],
    "programs": []
  },
  "A1나": {
    "strategies": [
      {
        "id": "S1",
        "title": "스마트친환경선박 학과 운영 지원"
      },
      {
        "id": "S2",
        "title": "참여교원의 역량 강화"
      },
      {
        "id": "S3",
        "title": "산학연 연계 교육과정 운영 및 개선"
      },
      {
        "id": "S4",
        "title": "교육과정의 대내외 확산"
      },
      {
        "id": "S5",
        "title": "산업친화형 진로/취업 학생지원 체계 운영"
      },
      {
        "id": "S6",
        "title": "신산업분야 교육과정 연계 교육환경 개선"
      },
      {
        "id": "S7",
        "title": "산학연관거버넌스 구축/운영"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "학과 개편 및 인재 육성 정착 체계 고도화"
      },
      {
        "strat": "S2",
        "id": "1",
        "title": "스마트 선박 교수 역량 강화 지원"
      },
      {
        "strat": "S3",
        "id": "1",
        "title": "현장 미러형 교육과정 및 학교 밖 수업 운영"
      },
      {
        "strat": "S4",
        "id": "1",
        "title": "산업체 현대중공업(HMC) 디지털 전환 교육 지원"
      },
      {
        "strat": "S5",
        "id": "1",
        "title": "비교과 전문가 과정 및 취업 아카데미 캠프 운영"
      },
      {
        "strat": "S6",
        "id": "1",
        "title": "현장 미러형 실습실 4-Station 환경 개선 및 기자재 조달"
      },
      {
        "strat": "S7",
        "id": "1",
        "title": "거버넌스 연계 협력 및 성과 공유"
      }
    ],
    "programs": []
  },
  "A2": {
    "strategies": [
      {
        "id": "S1",
        "title": "대학 구성원 창업 역량 강화 및 창업 인프라 구축"
      },
      {
        "id": "S2",
        "title": "예비창업자 발굴 및 기술/일반 창업 지원 강화"
      },
      {
        "id": "S3",
        "title": "지역 연계창업 네트워크 활성화 및 글로컬 창업 생태계 확장"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "대학 구성원 창업 마인드 확산 및 교육"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "창업 지원 제도 개선 및 F.A.B. Lab. 인프라 구축"
      },
      {
        "strat": "S2",
        "id": "1",
        "title": "예비창업자 발굴 및 창업 교육과정 운영"
      },
      {
        "strat": "S2",
        "id": "2",
        "title": "예비 창업자 실전 창업 성공 도약 지원"
      },
      {
        "strat": "S3",
        "id": "1",
        "title": "초중고/지역민 창업 교육 생태계 구축"
      },
      {
        "strat": "S3",
        "id": "2",
        "title": "초광역/글로벌 창업 네트워크 구축 및 경진대회 참가"
      }
    ],
    "programs": []
  },
  "A3": {
    "strategies": [
      {
        "id": "S1",
        "title": "글로벌 인재 유치·정착 중심 통합지원 생태계 구축"
      },
      {
        "id": "S2",
        "title": "지역 산업 연계 실무교육 및 취업·정주 연계 강화"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "해외 대학 및 글로벌 산업체 협력 네트워크 강화"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "해외 대학 국제공동 연구를 위한 네트워크 조성"
      },
      {
        "strat": "S1",
        "id": "3",
        "title": "유학생 대상 취업 및 정주 상담, 연계 DB 구축"
      },
      {
        "strat": "S2",
        "id": "4",
        "title": "유학생 대상 주문식 교육과정 및 역량 강화 비교과 과정 운영"
      },
      {
        "strat": "S2",
        "id": "5",
        "title": "유학생 대상 산업체 현장실습 프로그램 운영"
      },
      {
        "strat": "S2",
        "id": "6",
        "title": "유학생 대상 정착 지원 프로그램(컨설팅, 행정지원) 운영"
      },
      {
        "strat": "S2",
        "id": "7",
        "title": "외국인 근로자 대상 정착 지원 프로그램 운영"
      },
      {
        "strat": "S2",
        "id": "8",
        "title": "유학생 정착 지원 프로그램 운영"
      }
    ],
    "programs": []
  },
  "B1": {
    "strategies": [
      {
        "id": "S1",
        "title": "종합 공동 연구 협업지원 체계 강화"
      },
      {
        "id": "S2",
        "title": "대학-기업-연구기관(출연연) 연계 울산 주력/신산업 분야 기술개발 지원"
      },
      {
        "id": "S3",
        "title": "중소·중견기업 기술 혁신 및 사업 경쟁력 강화 지원"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "ICC 기반 초광역 산학협력 지원 체계 구축"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "ICC 분야별 교원 역량 강화 프로그램 개발"
      },
      {
        "strat": "S1",
        "id": "3",
        "title": "산학연 협의체 확대 및 기술 교류 방안 마련"
      },
      {
        "strat": "S1",
        "id": "8",
        "title": "전문인력 공동연구 성과 공유를 위한 포럼 개최"
      },
      {
        "strat": "S2",
        "id": "5",
        "title": "울산지역 7대 핵심 분야 공동연구 과제 공모 및 운영"
      },
      {
        "strat": "S2",
        "id": "6",
        "title": "지-산-학-연 초광역 공동연구 지원 체계 구축"
      },
      {
        "strat": "S2",
        "id": "7",
        "title": "전문기술석사 연계 산학프로젝트 발굴 및 수행"
      },
      {
        "strat": "S3",
        "id": "9",
        "title": "중소·중견기업 경영 컨설팅 지원 방안 마련"
      },
      {
        "strat": "S3",
        "id": "10",
        "title": "애로기술 해결을 기술개발 및 실증화 지원"
      },
      {
        "strat": "S3",
        "id": "11",
        "title": "대학 보유 장비 공동 활용 지원체계 개선 (0원)"
      },
      {
        "strat": "S3",
        "id": "12",
        "title": "개방형설계센터 공간 및 장비의 공동활용 활성화 (0원)"
      }
    ],
    "programs": []
  },
  "B2": {
    "strategies": [
      {
        "id": "S1",
        "title": "AID-X지원센터 구축"
      },
      {
        "id": "S2",
        "title": "분야 기술중심 교육과정 운영"
      },
      {
        "id": "S3",
        "title": "AI·DX 정착을 위한 첨단기술 확보"
      },
      {
        "id": "S4",
        "title": "MANI 초광역 협력 기반 인재양성 및 확산체계 구축"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "AID-X 지원센터 운영체계 고도화 및 AWS 공인인증 교육센터(C3) 구축"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "AWS 클라우드 인프라 기반 AI·DX 실습/개발 환경 운영"
      },
      {
        "strat": "S1",
        "id": "3",
        "title": "AI·DX 교원 역량 강화 프로그램 운영"
      },
      {
        "strat": "S1",
        "id": "4",
        "title": "AWS 기반 클라우드 AI 실습 중심 프로그램"
      },
      {
        "strat": "S2",
        "id": "5",
        "title": "AI·DX 교과/비교과 시범 운영 결과 반영 교육 과정 개선"
      },
      {
        "strat": "S2",
        "id": "6",
        "title": "AI·DX 인재 양성 교육과정 운영 및 확산"
      },
      {
        "strat": "S2",
        "id": "7",
        "title": "산업/지역 연동형 AI·DX 인재 양성 교육과정 개발"
      },
      {
        "strat": "S2",
        "id": "8",
        "title": "기업 맞춤형 교육과정 및 실무형 인재 양성 프로그램 운영"
      },
      {
        "strat": "S3",
        "id": "9",
        "title": "AI·DX 분야 산학공동기술 고도화 과제 운영"
      },
      {
        "strat": "S3",
        "id": "10",
        "title": "지역 산업체 대상 Physical AI 기반 교육과정 운영"
      },
      {
        "strat": "S3",
        "id": "11",
        "title": "Physical AI 기반 산학 공동 기술 개발과제 운영"
      },
      {
        "strat": "S3",
        "id": "12",
        "title": "Physical AI 기반 설비 공정 DX 기술 시범 적용"
      },
      {
        "strat": "S4",
        "id": "13",
        "title": "산업 수요 기반 공동 교과 및 프로젝트 성과 공유 운영"
      },
      {
        "strat": "S4",
        "id": "14",
        "title": "재학생·재직자 통합형 Re-Up-Skill 프로그램 확대"
      },
      {
        "strat": "S4",
        "id": "15",
        "title": "AI DX 인재 성과 연계 취업·창업 지원 체계 구축"
      },
      {
        "strat": "S4",
        "id": "17",
        "title": "제조AI 스마트공장 실습 인프라 공동활용 고도화"
      },
      {
        "strat": "S4",
        "id": "18",
        "title": "AWS C3 기반 초광역 공동 클라우드 실습 거점 운영"
      },
      {
        "strat": "S4",
        "id": "19",
        "title": "초광역 확산 체계 구축"
      }
    ],
    "programs": []
  },
  "B3": {
    "strategies": [
      {
        "id": "S1",
        "title": "지산학 협력 기반 탄소중립 실무 인재 양성"
      },
      {
        "id": "S2",
        "title": "디지털 전환 기반 중소기업 탄소 대응체계 구축"
      },
      {
        "id": "S3",
        "title": "지역 사회 상생 및 탄소중립 실천문화 확산"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "탄소중립 ESG 캠퍼스 아카데미 교양 교육과정 운영"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "AI 기반 탄소인증 실무과정 운영"
      },
      {
        "strat": "S1",
        "id": "3",
        "title": "온실가스관리 전문가 양성 비교과과정 운영"
      },
      {
        "strat": "S1",
        "id": "4",
        "title": "ESG 경영 전문가 양성 비교과과정 운영"
      },
      {
        "strat": "S2",
        "id": "5",
        "title": "중소기업용 AI 기반 탄소배출 및 저탄소인증 지원 플랫폼 구축"
      },
      {
        "strat": "S2",
        "id": "6",
        "title": "지역 산업체 대상 탄소중립 기술개발 및 컨설팅"
      },
      {
        "strat": "S2",
        "id": "7",
        "title": "국내외 탄소중립 기술 박람회 벤치마킹"
      },
      {
        "strat": "S2",
        "id": "8",
        "title": "저탄소 및 녹색성장 관련 우수기업 벤치마킹"
      },
      {
        "strat": "S3",
        "id": "9",
        "title": "친환경 에너지 순환형 리빙랩 인프라 구축 및 운영"
      },
      {
        "strat": "S3",
        "id": "10",
        "title": "데이터 기반 탄소 감축량 모니터링 및 성과 검증"
      },
      {
        "strat": "S3",
        "id": "11",
        "title": "업사이클링 체험 및 지역사회 연계 실천문화 확산"
      },
      {
        "strat": "S3",
        "id": "12",
        "title": "탄소중립 서포터즈 기반 교내 탄소중립 문화 확산"
      }
    ],
    "programs": []
  },
  "B4": {
    "strategies": [
      {
        "id": "S1",
        "title": "복합재난 대응 역량 강화를 위한 인재 양성"
      },
      {
        "id": "S2",
        "title": "재난 단계별 복합재난 대응 체계 구축"
      },
      {
        "id": "S3",
        "title": "지·산·학·연 복합재난 협력 네트워크 구축 및 운영"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "재난 대응 안전보건 인재 양성 및 교육과정 개발 운영"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "산업안전·보건 교육 교재 및 온라인 학습 콘텐츠 개발"
      },
      {
        "strat": "S1",
        "id": "3",
        "title": "AI 기반 취약계층 중심 재난 대응 콘텐츠 적용 및 고도화"
      },
      {
        "strat": "S1",
        "id": "4",
        "title": "취약계층 대상 위급상황 응급처치 교육 확대"
      },
      {
        "strat": "S2",
        "id": "5",
        "title": "산업군별 맞춤형 재난 대응 기술지원 운영"
      },
      {
        "strat": "S2",
        "id": "6",
        "title": "기업의 응급 대응 매뉴얼 컨설팅 및 기술지원"
      },
      {
        "strat": "S2",
        "id": "7",
        "title": "단계별 재난 대응 교육 훈련 프로그램 체계 개발"
      },
      {
        "strat": "S2",
        "id": "8",
        "title": "산업 맞춤형 안전·보건 자격 인증 과정 개설 및 운영"
      },
      {
        "strat": "S3",
        "id": "9",
        "title": "재난 대응 산업 안전·보건 교육장 구축 및 프로그램 개설"
      },
      {
        "strat": "S3",
        "id": "11",
        "title": "재난 대응 네트워크 구축을 위한 지역사회 협력 확대"
      },
      {
        "strat": "S3",
        "id": "12",
        "title": "복합재난 공동 대응을 위한 정기적 협의체 구축 및 활성화"
      }
    ],
    "programs": []
  },
  "C1": {
    "strategies": [
      {
        "id": "S1",
        "title": "울산 특화형 평생·직업교육 거점센터 기능 고도화 및 다양화"
      },
      {
        "id": "S2",
        "title": "지역산업 연계형 자격기반 평생직업교육 모델 개발 및 운영"
      },
      {
        "id": "S3",
        "title": "지역산업 수요기반 취·창업 평생학습 프로그램 운영"
      },
      {
        "id": "S4",
        "title": "지역산업의 인력수요 대응형 평생직업교육 운영 및 협력체계 확장"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "지역 평생직업교육 거점센터 기능 확대"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "지자체·산업체·유관기관 협력 기반 교육·자격·취업 연계 실질화"
      },
      {
        "strat": "S1",
        "id": "3",
        "title": "평생교육통합 플랫폼 활용 확산 및 학습이력 관리 체계 구축"
      },
      {
        "strat": "S1",
        "id": "4",
        "title": "울산형 교육통합 플랫폼 참여 확대 및 기관 간 데이터 연계 강화"
      },
      {
        "strat": "S2",
        "id": "5",
        "title": "자격연계 모듈·단기·집중 직무과정 확대 개발 및 운영"
      },
      {
        "strat": "S2",
        "id": "6",
        "title": "성인학습자를 위한 맞춤형 학과 개설 지원 확대"
      },
      {
        "strat": "S2",
        "id": "7",
        "title": "모듈-학점-학위 연계형 성인학습자 유입 확대 및 학사지원 강화"
      },
      {
        "strat": "S3",
        "id": "8",
        "title": "생애주기별 직무역량 강화 프로그램 체계화"
      },
      {
        "strat": "S3",
        "id": "9",
        "title": "교육-자격-취업 연계 로드맵 운영 및 성과 모니터링"
      },
      {
        "strat": "S3",
        "id": "10",
        "title": "산업체와의 실무중심의 교육 프로그램 개발 및 운영"
      },
      {
        "strat": "S3",
        "id": "11",
        "title": "성인학습자 대상 지원 프로그램 운영"
      },
      {
        "strat": "S4",
        "id": "12",
        "title": "지역산업 연계 맞춤형 직업교육 과정 운영"
      },
      {
        "strat": "S4",
        "id": "13",
        "title": "지역 산업 맞춤형 교육 콘텐츠 개발"
      },
      {
        "strat": "S4",
        "id": "14",
        "title": "지자체·중소기업 협력 기반 현장밀착형 맞춤 직업교육 운영 확대"
      }
    ],
    "programs": []
  },
  "C2": {
    "strategies": [
      {
        "id": "S1",
        "title": "수요 기반 운영 모델 표준화"
      },
      {
        "id": "S2",
        "title": "산·학·연·관 네트워크 통합 운영"
      },
      {
        "id": "S3",
        "title": "데이터 기반 품질관리·성과확산 선순환"
      },
      {
        "id": "S4",
        "title": "동남권 지역자원·대학역량 결합 특화 패키지 확산"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "방과후 늘봄 프로그램 개발 및 시범운영"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "방학 늘봄 서비스 모델 다양화"
      },
      {
        "strat": "S2",
        "id": "3",
        "title": "동남권협력 체계 구축 및 네트워크 형성"
      },
      {
        "strat": "S2",
        "id": "4",
        "title": "동남권 유관기관 및 산업체 협력 네트워크 구축"
      },
      {
        "strat": "S3",
        "id": "5",
        "title": "품질관리·성과관리 체계 구축(운영 내실화)"
      },
      {
        "strat": "S3",
        "id": "6",
        "title": "성과확산·브랜딩 체계 구축(대외 확산)"
      },
      {
        "strat": "S4",
        "id": "7",
        "title": "동남권 지역기반 특화 프로그램 패키지 개발·적용(현장 확산형)"
      },
      {
        "strat": "S4",
        "id": "8",
        "title": "대학 기반 특성화 프로그램 개발·운영(전문역량형)"
      }
    ],
    "programs": []
  },
  "D1": {
    "strategies": [
      {
        "id": "S1",
        "title": "지역기반 문제해결형 프로젝트 추진"
      },
      {
        "id": "S2",
        "title": "울산형 2주기 RISE 모델 설계 및 지역연계 실행체계 구축"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "지역문제해결 프로젝트(캡스톤 디자인 등) 운영"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "분야별 지역전문가 풀(Pool) 구축 및 매칭 운영"
      },
      {
        "strat": "S1",
        "id": "3",
        "title": "생활밀착형 주민 제안 리빙랩 운영"
      },
      {
        "strat": "S1",
        "id": "4",
        "title": "리빙랩 현장 코디네이터 지정 및 반복 개선 체계 구축"
      },
      {
        "strat": "S2",
        "id": "5",
        "title": "지역 주체별 과제 수요조사 및 타당성 검토 워크숍 운영"
      },
      {
        "strat": "S2",
        "id": "6",
        "title": "시범과제 기획서 작성 및 추진 로드맵 수립"
      },
      {
        "strat": "S2",
        "id": "7",
        "title": "학과기반의 지역사회공헌활동 프로그램 운영"
      },
      {
        "strat": "S2",
        "id": "8",
        "title": "대학의 역량을 활용한 지역사회협력 연계"
      }
    ],
    "programs": []
  },
  "D2": {
    "strategies": [
      {
        "id": "S1",
        "title": "지역 의료·돌봄 연계 강화를 통한 협력 운영 체계 정착"
      },
      {
        "id": "S2",
        "title": "지역 인재 순환과 성과관리를 통한 지속 가능 운영 확립"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "지역사회 중심 보건복지 거버넌스 및 협력 확대"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "대학 인프라 연계 융합형 지역보건복지 서비스 및 모델 확대"
      },
      {
        "strat": "S1",
        "id": "3",
        "title": "지역사회 기반 보건복지관리 전문인력 양성 및 주민참여형 건강증진 프로그램 운영"
      },
      {
        "strat": "S1",
        "id": "4",
        "title": "산업체·의료기관 연계 맞춤형 보건복지 서비스 교육 프로그램 개발 및 운영"
      },
      {
        "strat": "S1",
        "id": "5",
        "title": "사회적 약자 대상 보건복지케어 수요조사 및 모니터링 기반 보건서비스 기획·운영"
      },
      {
        "strat": "S1",
        "id": "6",
        "title": "사회적 약자 보건복지케어 전문인력 양성 및 맞춤형 현장 보건서비스 운영 확대"
      },
      {
        "strat": "S2",
        "id": "7",
        "title": "지역 특화 보건의료 전문인력 양성 체계 강화"
      },
      {
        "strat": "S2",
        "id": "8",
        "title": "지속 가능한 지역 정주 유도 및 제도적 기반 마련"
      },
      {
        "strat": "S2",
        "id": "9",
        "title": "보건복지 특성화 인력 지원 프로그램"
      },
      {
        "strat": "S2",
        "id": "10",
        "title": "신규학과 및 통합보건인력양성 지원 프로그램 확대"
      }
    ],
    "programs": []
  },
  "D3": {
    "strategies": [
      {
        "id": "S1",
        "title": "지역과 문화 연계 협력 네트워크 구축"
      },
      {
        "id": "S2",
        "title": "지역사회 환경·문화 꿀잼 역량 강화"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "시민참여형 에코 컬처 체험 프로그램 개발 및 운영"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "에코컬처 인재양성을 위한 다양한 프로그램 운영"
      },
      {
        "strat": "S1",
        "id": "3",
        "title": "대학 내 문화커뮤니티 공간 구축"
      },
      {
        "strat": "S1",
        "id": "4",
        "title": "학생들의 프로젝트 수업을 통한 도시재생 프로젝트"
      },
      {
        "strat": "S2",
        "id": "5",
        "title": "시민체험형 문화-예술 체험 프로그램 운영"
      },
      {
        "strat": "S2",
        "id": "6",
        "title": "학생들을 활용한 지역의 브랜드 디자인 활동"
      },
      {
        "strat": "S2",
        "id": "7",
        "title": "지역과 함께하는 축제 프로그램 연계 운영"
      },
      {
        "strat": "S2",
        "id": "8",
        "title": "지역주민과 함께하는 학과 기반 체험형 프로그램 운영"
      }
    ],
    "programs": []
  },
  "X0": {
    "strategies": [
      {
        "id": "S1",
        "title": "사업단 공동 인프라 고도화 및 안정적 운영체계 확립"
      }
    ],
    "tasks": [
      {
        "strat": "S1",
        "id": "1",
        "title": "사업단 운영 전담 연구인력 역량 강화 및 인건비 지원"
      },
      {
        "strat": "S1",
        "id": "2",
        "title": "통합 운영 시스템 및 행정 정보화 인프라 구축"
      },
      {
        "strat": "S1",
        "id": "3",
        "title": "성과 관리 시스템 및 지산학 협업 성과 확산"
      },
      {
        "strat": "S1",
        "id": "4",
        "title": "사업단 기본 활동비 및 필수 경비 지원"
      },
      {
        "strat": "S1",
        "id": "5",
        "title": "대학 본부 행정 대행 간접비 지원"
      }
    ],
    "programs": []
  }
};

export interface UnitSystemViewProps {
  selectedYear?: number;
  darkMode?: boolean;
  currentUser?: any;
  currentRole?: any;
}

interface StrategyItem {
  id: string;
  title: string;
}

interface StrategyTaskItem {
  strat: string;
  id: string;
  title: string;
}

interface UnitStrategyData {
  strategies: StrategyItem[];
  tasks: StrategyTaskItem[];
  programs: ProgramData[];
}

export default function UnitSystemView({ selectedYear = 2 }: UnitSystemViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("A");
  
  const currentProjectsData = selectedYear === 1 ? PROJECTS_DATA_Y1 : PROJECTS_DATA;
  const currentStrategyMapping = (
    selectedYear === 1 ? STRATEGY_TASK_MAPPING_Y1 : STRATEGY_TASK_MAPPING
  ) as unknown as Record<string, UnitStrategyData>;

  // 선택한 프로젝트 소속 단위과제들 중 첫 번째 과제를 기본값으로 설정
  const currentProject = currentProjectsData.find(p => p.id === selectedProjectId);
  const defaultUnitId = currentProject && currentProject.units.length > 0 ? currentProject.units[0].id : "";
  const [selectedUnitId, setSelectedUnitId] = useState<string>(defaultUnitId);

  // 선택한 단위과제 소속 전략 정보 로드
  const selectedUnitData = currentStrategyMapping[selectedUnitId] || {
    strategies: [],
    tasks: [],
    programs: []
  };

  // 선택한 추진전략(S)의 ID 상태
  const defaultStratId = selectedUnitData.strategies.length > 0 ? selectedUnitData.strategies[0].id : "";
  const [selectedStratId, setSelectedStratId] = useState<string>(defaultStratId);

  // 선택한 전략과제(T)의 ID 상태
  const [selectedTaskId, setSelectedTaskId] = useState("");

  // 선택된 추진전략에 부속되는 전략과제(T) 필터링
  const filteredTasks = selectedUnitData.tasks ? selectedUnitData.tasks.filter(t => t.strat === selectedStratId) : [];

  // 연도(selectedYear)나 프로젝트가 변경될 때 현재 유닛 목록의 유효성 검사 및 리셋 처리
  useEffect(() => {
    const currentProj = currentProjectsData.find(p => p.id === selectedProjectId);
    if (currentProj && currentProj.units.length > 0) {
      const exists = currentProj.units.some(u => u.id === selectedUnitId);
      if (!exists) {
        setSelectedUnitId(currentProj.units[0].id);
      }
    } else {
      setSelectedUnitId("");
    }
  }, [selectedYear, selectedProjectId, currentProjectsData]);

  // 단위과제 변경 시 추진전략 드롭다운도 첫 번째로 자동 연동
  useEffect(() => {
    if (selectedUnitData.strategies.length > 0) {
      setSelectedStratId(selectedUnitData.strategies[0].id);
    } else {
      setSelectedStratId("");
    }
  }, [selectedUnitId, selectedUnitData]);

  // 추진전략(S) 변경 시 전략과제(T) 드롭다운 첫 번째로 자동 연동
  useEffect(() => {
    if (filteredTasks.length > 0) {
      const exists = filteredTasks.some(t => t.id === selectedTaskId);
      if (!exists) {
        setSelectedTaskId(filteredTasks[0].id);
      }
    } else {
      setSelectedTaskId("");
    }
  }, [selectedStratId, selectedUnitId, filteredTasks, selectedTaskId]);

  // 프로젝트 변경 시 단위과제 및 추진전략 자동 갱신
  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    const targetProj = currentProjectsData.find(p => p.id === projId);
    if (targetProj && targetProj.units.length > 0) {
      const nextUnitId = targetProj.units[0].id;
      setSelectedUnitId(nextUnitId);
      const nextUnitData = currentStrategyMapping[nextUnitId];
      if (nextUnitData && nextUnitData.strategies.length > 0) {
        setSelectedStratId(nextUnitData.strategies[0].id);
      } else {
        setSelectedStratId("");
      }
    }
  };

  // 선택한 단위과제의 프로그램 목록 동적 로드 (1차년도는 JSON, 2차년도는 mockData.js의 initialProjectsData에서 실시간 추출)
  const getRawPrograms = (): ProgramData[] => {
    if (selectedYear === 1) {
      return selectedUnitData.programs || [];
    } else {
      let foundUnit: UnitData | null = null;
      for (const proj of initialProjectsData) {
        const u = proj.units.find(unit => unit.id === selectedUnitId);
        if (u) {
          foundUnit = u;
          break;
        }
      }
      return foundUnit ? foundUnit.programs : [];
    }
  };

  const rawPrograms = getRawPrograms();

  // 선택된 추진전략(S) 및 전략과제(T)에 부속되는 프로그램(PG) 필터링
  const filteredPrograms = rawPrograms.filter(p => {
    const match = p.id.match(/-S(\d+)T(\d+)-/);
    if (match) {
      const stratNum = match[1];
      const taskNum = match[2];
      const stratId = `S${stratNum}`;
      const taskId = taskNum;
      return stratId === selectedStratId && taskId === selectedTaskId;
    }
    if (p.strat) {
      return p.strat === selectedStratId;
    }
    return false;
  });

  return (
    <div className="unit-system-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      
      {/* 🚀 상단 블록: 단위과제 기획 체계 설명 카드 */}
      <div className="glass-card" style={{ padding: "1.8rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Info size={20} />
          울산과학대학교 앵커사업 체계
        </h3>
        
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "1.2rem" }}>
          앵커 사업의 효율적인 기획 및 성과관리를 위해 본 대시보드는 <strong>프로젝트 - 단위과제 - 추진전략 - 전략과제 - 프로그램</strong>의 5단계 고유 연계 체계를 도입하여 관리하고 있습니다.
        </p>

        {/* 5단계 체계 카드 리스트 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.8rem", marginBottom: "1.5rem" }}>
          <div style={{ background: "rgba(120,120,120,0.05)", border: "1px solid var(--border-color)", padding: "0.8rem 1rem", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--accent-color)", fontWeight: "900", marginBottom: "0.2rem" }}>1단계: PJ</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)" }}>프로젝트 (Project)</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>울산시가 제시한 4대 핵심 사업 분야</div>
          </div>
          <div style={{ background: "rgba(120,120,120,0.05)", border: "1px solid var(--border-color)", padding: "0.8rem 1rem", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.68rem", color: "#10b981", fontWeight: "900", marginBottom: "0.2rem" }}>2단계: UP</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)" }}>단위과제 (Unit Project)</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              {selectedYear === 1 ? "목표 달성을 위한 12대 단위 사업 (A1~D4)" : "목표 달성을 위한 12대 단위 사업 (A1가~D3)"}
            </div>
          </div>
          <div style={{ background: "rgba(120,120,120,0.05)", border: "1px solid var(--border-color)", padding: "0.8rem 1rem", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.68rem", color: "#ec4899", fontWeight: "900", marginBottom: "0.2rem" }}>3단계: S</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)" }}>추진전략 (Strategy)</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>단위과제 달성을 위한 거시적 사업 비전</div>
          </div>
          <div style={{ background: "rgba(120,120,120,0.05)", border: "1px solid var(--border-color)", padding: "0.8rem 1rem", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.68rem", color: "#f59e0b", fontWeight: "900", marginBottom: "0.2rem" }}>4단계: T</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)" }}>전략과제 (Strategic Task)</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>전략 실현을 위한 고유 중점 분야</div>
          </div>
          <div style={{ background: "rgba(120,120,120,0.05)", border: "1px solid var(--border-color)", padding: "0.8rem 1rem", borderRadius: "0.4rem" }}>
            <div style={{ fontSize: "0.68rem", color: "#8b5cf6", fontWeight: "900", marginBottom: "0.2rem" }}>5단계: PG</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)" }}>프로그램 (Program)</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>실질적 예산 및 KPI가 매핑되는 행동 단위</div>
          </div>
        </div>

        {/* 💡 프로그램 ID 작명 규칙 및 액션플랜 설명 */}
        <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.25)", padding: "1rem 1.2rem", borderRadius: "0.4rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
            <GitFork size={15} style={{ color: "var(--accent-color)" }} />
            <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>프로그램 ID 규칙 (Rule)</strong>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4", margin: 0 }}>
            <code style={{ 
              background: "rgba(59, 130, 246, 0.1)", 
              border: "1px solid rgba(59, 130, 246, 0.2)",
              padding: "0.15rem 0.4rem", 
              borderRadius: "0.3rem", 
              color: "var(--accent-color)", 
              fontFamily: "monospace",
              fontWeight: "700"
            }}>
              단위과제번호-(추진전략번호+전략과제번호)-프로그램번호
            </code>
            <span style={{ margin: "0 0.5rem", color: "var(--border-color)" }}>|</span>
            예시: <strong style={{ color: "var(--text-primary)" }}>{selectedYear === 1 ? "A1-S1T1-1" : "A1가-S1T1-1"}</strong> ➔ 단위과제 <strong style={{ color: "#10b981" }}>{selectedYear === 1 ? "A1" : "A1가"}</strong>, 추진전략 <strong style={{ color: "#ec4899" }}>S1</strong>, 전략과제 <strong style={{ color: "#f59e0b" }}>T1</strong>에 매핑된 <strong style={{ color: "#8b5cf6" }}>1번 프로그램</strong>을 의미함.
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.4rem", fontStyle: "italic" }}>
            * 액션플랜(Action Plan; AP): 각 프로그램 수행을 위해 예산(본사업비/이월비), 담당자, 추진 단계, 마일스톤 기한 등을 상세히 테이블로 명시한 최하위 실천 명세입니다.
          </p>
        </div>
      </div>

      {/* 🛠️ 하단 블록: 3단 드롭다운 연동 레이아웃 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", minHeight: "450px" }}>
        
        {/* 좌측: PJ -> WS -> S 3단 드롭다운 선택 패널 */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <h4 style={{ fontSize: "0.9rem", fontWeight: "900", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.6rem" }}>
            <Layout size={16} />
            과제&전략 내비게이터
          </h4>

          {/* 1. 프로젝트 드롭다운 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700" }}>
              1단계: 프로젝트 선택 (4 PJ)
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="user-selector"
              style={{
                width: "100%",
                fontSize: "0.8rem",
                padding: "0.6rem 0.8rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                borderRadius: "0.4rem"
              }}
            >
              {currentProjectsData.map(p => (
                <option key={p.id} value={p.id} style={{ background: "var(--background-card, #1e1e1e)", color: "var(--text-primary)" }}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* 2. 단위과제 드롭다운 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700" }}>
              2단계: 단위과제 선택 (12 UP)
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="user-selector"
              style={{
                width: "100%",
                fontSize: "0.8rem",
                padding: "0.6rem 0.8rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                borderRadius: "0.4rem"
              }}
            >
              {currentProjectsData.find(p => p.id === selectedProjectId)?.units.map(u => (
                <option key={u.id} value={u.id} style={{ background: "var(--background-card, #1e1e1e)", color: "var(--text-primary)" }}>
                  {u.id} : {u.title}
                </option>
              ))}
            </select>
          </div>

          {/* 3. 추진전략 드롭다운 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700" }}>
              3단계: 추진전략 선택 (S)
            </label>
            <select
              value={selectedStratId}
              onChange={(e) => setSelectedStratId(e.target.value)}
              className="user-selector"
              style={{
                width: "100%",
                fontSize: "0.8rem",
                padding: "0.6rem 0.8rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                borderRadius: "0.4rem"
              }}
            >
              {selectedUnitData.strategies.map(s => (
                <option key={s.id} value={s.id} style={{ background: "var(--background-card, #1e1e1e)", color: "var(--text-primary)" }}>
                  {s.id} : {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* 4. 전략과제 드롭다운 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700" }}>
              4단계: 전략과제 선택 (T)
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="user-selector"
              style={{
                width: "100%",
                fontSize: "0.8rem",
                padding: "0.6rem 0.8rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                borderRadius: "0.4rem"
              }}
            >
              {filteredTasks.map(t => (
                <option key={t.id} value={t.id} style={{ background: "var(--background-card, #1e1e1e)", color: "var(--text-primary)" }}>
                  T{t.id} : {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 우측: 선택한 전략에 연동된 전략과제(T) 및 프로그램(PG) 출력 영역 */}
        <div className="glass-card" style={{ padding: "1.8rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 상단: 현재 선택된 추진전략 상세 */}
          <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
            <span style={{
              fontSize: "0.8rem",
              background: "rgba(236,72,153,0.12)",
              border: "1px solid rgba(236,72,153,0.25)",
              color: "#ec4899",
              padding: "0.2rem 0.5rem",
              borderRadius: "0.2rem",
              fontWeight: "900",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "0.5rem"
            }}>
              추진전략 (Strategy)
            </span>
            <h4 style={{ fontSize: "1.05rem", color: "var(--text-primary)", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.6rem", lineHeight: "1.4" }}>
              <div style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "rgba(236,72,153,0.1)",
                color: "#ec4899",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
                fontWeight: "900",
                border: "1px solid rgba(236,72,153,0.25)",
                flexShrink: 0
              }}>
                {selectedStratId}
              </div>
              {selectedUnitData.strategies.find(s => s.id === selectedStratId)?.title || "선택된 전략이 없습니다."}
            </h4>
          </div>

          {/* 중단: 선택된 전략과제 (T) 상세 */}
          <div>
            <span style={{
              fontSize: "0.8rem",
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#f59e0b",
              padding: "0.2rem 0.5rem",
              borderRadius: "0.2rem",
              fontWeight: "900",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "0.7rem"
            }}>
              선택된 전략과제 (Strategic Task)
            </span>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {!selectedTaskId ? (
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", textAlign: "center", padding: "2rem", border: "1px dashed var(--border-color)" }}>
                  본 전략에 매핑된 세부 전략과제가 아직 존재하지 않습니다.
                </div>
              ) : (
                <div style={{
                  background: "rgba(255,255,255,0.01)",
                  border: "1px solid var(--border-color)",
                  padding: "0.8rem 1rem",
                  borderRadius: "0.4rem",
                  fontSize: "0.8rem",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem"
                }}>
                  <div style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "rgba(245,158,11,0.1)",
                    color: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: "900",
                    border: "1px solid rgba(245,158,11,0.25)",
                    flexShrink: 0
                  }}>
                    T{selectedTaskId}
                  </div>
                  <span style={{ fontWeight: "700" }}>{filteredTasks.find(t => t.id === selectedTaskId)?.title || "선택된 전략과제가 없습니다."}</span>
                </div>
              )}
            </div>
          </div>

          {/* 하단: 필터링된 연계 프로그램 (PG) 리스트 */}
          <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "1.2rem", flex: 1 }}>
            <span style={{
              fontSize: "0.8rem",
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "#8b5cf6",
              padding: "0.2rem 0.5rem",
              borderRadius: "0.2rem",
              fontWeight: "900",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "0.7rem"
            }}>
              {selectedTaskId ? `T${selectedTaskId}${getJosa(selectedTaskId)} 연계한 프로그램 내역 (PROGRAMS)` : "소속 프로그램 내역 (PROGRAMS)"}
            </span>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.6rem" }}>
              {filteredPrograms.length === 0 ? (
                <div style={{ gridColumn: "1/-1", fontSize: "0.78rem", color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>
                  본 전략에 매핑되어 작동 중인 실무 프로그램이 아직 존재하지 않습니다.
                </div>
              ) : (
                filteredPrograms.map((prog) => (
                  <div key={prog.id} style={{
                    background: "rgba(120,120,120,0.03)",
                    padding: "0.7rem 0.9rem",
                    borderRadius: "0.4rem",
                    fontSize: "0.76rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid var(--border-color)"
                  }}>
                    <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <ArrowRight size={12} style={{ color: "#8b5cf6" }} />
                      {prog.title}
                    </span>
                    <code style={{
                      color: "#8b5cf6",
                      fontWeight: "700",
                      background: "rgba(139,92,246,0.08)",
                      padding: "0.15rem 0.4rem",
                      borderRadius: "0.25rem",
                      fontFamily: "monospace",
                      fontSize: "0.68rem",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      marginLeft: "1rem"
                    }}>
                      {prog.id}
                    </code>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
