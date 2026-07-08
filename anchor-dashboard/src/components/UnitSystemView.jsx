import React, { useState, useEffect } from "react";
import { Info, Award, Layout, GitFork, ArrowRight, List } from "lucide-react";
import STRATEGY_TASK_MAPPING_Y1 from "../data/extracted_1st_year.json";
import { initialProjectsData } from "../data/mockData";


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
const getJosa = (id) => {
  if (!id) return "과";
  const lastChar = id.slice(-1);
  // 1(일), 3(삼), 6(육), 7(칠), 8(팔), 0(영) 은 받침이 있어 '과'가 적절함.
  if (["1", "3", "6", "7", "8", "0"].includes(lastChar)) {
    return "과";
  }
  return "와";
};

// 2. proposal 실재 데이터 기반 전략(S) 및 추진과제(T) & 프로그램(PG) 연동 맵핑 테이블
const STRATEGY_TASK_MAPPING = {
  "A1가": {
    strategies: [
      { id: "S1", title: "지역인력 수요분석 기반 UC-HYPER 실무인재 양성" },
      { id: "S2", title: "교육과정 모니터링 체계 구축 및 성과 확산" },
      { id: "S3", title: "지역정주 지산학 맞춤형 고급 기술인재 양성" },
      { id: "S4", title: "하이퍼(Hyper-connected) 캠퍼스 구축 및 운영" },
      { id: "S5", title: "지역혁신 선도 인재양성 거버넌스 체계 구축 및 확산" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "UC-HYPER 기반 주문식 교육과정 및 혁신 교수법 개발" },
      { strat: "S1", id: "2", title: "미래 핵심 산업 맞춤형 정규 주문식 교과정 개편 및 운영" },
      { strat: "S1", id: "3", title: "특화 분야 비교과 자격증 과정 및 학점교류 운영" },
      { strat: "S2", id: "4", title: "전주기 이력 추적형 진로개발 시스템 운영" },
      { strat: "S2", id: "5", title: "산학 성과 공유를 위한 경진대회 및 대외 워크숍 개최" },
      { strat: "S3", id: "6", title: "개방형 설계센터 전문가 연계 재직자 실무 교육" },
      { strat: "S3", id: "7", title: "울산형 데이터센터 기술인재 양성을 위한 자격증/마이크로디그리 과정" },
      { strat: "S3", id: "8", title: "표준형 현장실습 교과목 운영" },
      { strat: "S3", id: "9", title: "전문기술석사 과정 활용 기업 PBL 공동연구 지원" },
      { strat: "S4", id: "10", title: "설계센터 및 생성형 AI / 양방향 수업 전산 환경 시공 및 로봇 공학 기자재 도입" },
      { strat: "S4", id: "11", title: "ECC플랫폼 공유협업 인프라 구축" },
      { strat: "S4", id: "12", title: "온라인 콘텐츠 및 실시간 수업을 위한 플랫폼 구축" },
      { strat: "S5", id: "13", title: "지산학 거버넌스 협의체 운영 및 학술 정보 공유" },
      { strat: "S5", id: "14", title: "벤치마킹 분석 보고서 작성 및 거버넌스 환류" }
    ],
    programs: [
      { strat: "S1", id: "A1가-S1T1-1", title: "UC-HYPER 교수학습 모델 및 혁신 교수법 개발 운영" },
      { strat: "S1", id: "A1가-S1T1-2", title: "미래 핵심 산업 맞춤형 정규 주문식 교과정 개편 및 운영" },
      { strat: "S1", id: "A1가-S1T1-3", title: "특화 분야 비교과 자격증 과정 및 학점교류 운영" },
      { strat: "S2", id: "A1가-S2T2-1", title: "전주기 이력 추적형 진로개발 시스템 운영" },
      { strat: "S2", id: "A1가-S2T2-2", title: "산학 성과 공유를 위한 경진대회 및 대외 워크숍 개최" },
      { strat: "S3", id: "A1가-S3T3-1", title: "지역 산업체 연계 고숙련 기술 교육 및 인턴십" },
      { strat: "S4", id: "A1가-S4T4-1", title: "하이퍼 캠퍼스 온라인 실습 시스템 구축" },
      { strat: "S5", id: "A1가-S5T5-1", title: "울산 앵커 사업단 거버넌스 활성화 성과 세미나" }
    ]
  },
  "A1나": {
    strategies: [
      { id: "S1", title: "지역인력 수요분석 기반 UC-HYPER 실무인재 양성" },
      { id: "S2", title: "교육과정 모니터링 체계 구축 및 성과 확산" },
      { id: "S3", title: "지역정주 지산학 맞춤형 고급 기술인재 양성" },
      { id: "S4", title: "하이퍼(Hyper-connected) 캠퍼스 구축 및 운영" },
      { id: "S5", title: "지역혁신 선도 인재양성 거버넌스 체계 구축 및 확산" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "신산업 특화 스마트·친환경선박 직업교육체계 고도화" },
      { strat: "S2", id: "2", title: "신산업 이관 과제 모니터링 및 교육 품질 관리" },
      { strat: "S3", id: "3", title: "글로벌 친환경선박 신기술 정주 인력 교육" },
      { strat: "S4", id: "4", title: "미래 친환경선박 가상 교육 기자재 인프라 확충" },
      { strat: "S5", id: "5", title: "스마트·친환경선박 산학관 거버넌스 네트워크 강화" }
    ],
    programs: [
      { strat: "S1", id: "A1나-S1T1-1", title: "친환경선박 직업교육 글로벌 표준 표준 교과 개편" },
      { strat: "S2", id: "A1나-S2T2-1", title: "신산업 이관 전담 실무 교육장비 가동" },
      { strat: "S3", id: "A1나-S3T3-1", title: "선도 조선소 연계 맞춤형 글로벌 인턴십 프로그램" }
    ]
  },
  "A2": {
    strategies: [
      { id: "S1", title: "대학 구성원 창업 역량 강화 및 창업 인프라 구축" },
      { id: "S2", title: "예비창업자 발굴 및 기술/일반 창업 지원 강화" },
      { id: "S3", title: "지역 연계창업 네트워크 활성화 및 글로컬 창업 생태계 확장" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "대학 구성원 창업 마인드 확산 및 교육" },
      { strat: "S1", id: "2", title: "창업 지원 제도 개선 및 F.A.B. Lab. 인프라 구축" },
      { strat: "S2", id: "3", title: "예비창업자 모집·선발 및 투자 연계 지원" },
      { strat: "S2", id: "4", title: "창업 기업 사업화 후속 지원 및 마케팅 연계" },
      { strat: "S3", id: "5", title: "초중고/지역민 창업 교육 생태계 구축" },
      { strat: "S3", id: "6", title: "글로벌/초광역 창업 네트워크 구축 및 경진대회 참가" }
    ],
    programs: [
      { strat: "S1", id: "A2-S1T1-1", title: "대학 구성원 창업 마인드 확산 세미나" },
      { strat: "S1", id: "A2-S1T2-1", title: "창업 지원 제도 개선 및 FAB Lab 구축" },
      { strat: "S2", id: "A2-S2T3-1", title: "예비창업자 엑셀러레이팅 패키지 지원" },
      { strat: "S2", id: "A2-S2T4-1", title: "창업 기업 홍보·마케팅 및 해외 바이어 매칭" },
      { strat: "S3", id: "A2-S3T5-1", title: "초중고 리더십 창업 캠프 개설" },
      { strat: "S3", id: "A2-S3T6-1", title: "글로벌 창업 네트워크 데이 워크숍 참관" }
    ]
  },
  "A3": {
    strategies: [
      { id: "S1", title: "글로벌 인재 유치·정착 중심 통합지원 생태계 구축" },
      { id: "S2", title: "지역 산업 연계 실무교육 및 취업·정주 연계 강화" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "해외 대학 및 글로벌 산업체 협력 네트워크 강화" },
      { strat: "S1", id: "2", title: "유학생 통합관리 플랫폼 구축 및 상담 지원" },
      { strat: "S2", id: "3", title: "글로벌 실무 교육과정 및 현장실습 운영" },
      { strat: "S2", id: "4", title: "외국인 유학생 및 근로자 정착 지원 프로그램 운영" }
    ],
    programs: [
      { strat: "S1", id: "A3-S1T1-1", title: "글로벌 산업체 협력 거버넌스 및 네트워킹 구축" },
      { strat: "S1", id: "A3-S1T2-1", title: "다국어 스마트 유학생 케어 앱 론칭 및 상담소 운영" },
      { strat: "S2", id: "A3-S2T3-1", title: "외국인 전용 특화 직무 단기 아카데미 개편" },
      { strat: "S2", id: "A3-S2T4-1", title: "유학생 정주 촉진을 위한 법률 및 취업 설명회" }
    ]
  },
  "B1": {
    strategies: [
      { id: "S1", title: "종합 공동 연구 협업지원 체계 강화" },
      { id: "S2", title: "대학-기업-연구기관(출연연) 연계 울산 주력/신사업 분야 기술개발 지원" },
      { id: "S3", title: "중소·중견기업 기술 혁신 및 사업 경쟁력 강화 지원" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "산학협력 연계 기업협업센터(ICC) 고도화 및 교원 역량 강화" },
      { strat: "S1", id: "2", title: "주력/신산업 분야 산학협력 거버넌스 및 기술교류 활성화" },
      { strat: "S2", id: "3", title: "ICC 연계 초광역 공동연구 및 전문기술석사 프로젝트 활성화" },
      { strat: "S3", id: "4", title: "중소·중견기업 애로기술 지도 및 공용장비 활용 활성화" }
    ],
    programs: [
      { strat: "S1", id: "B1-S1T1-1", title: "기업협업센터(ICC) 실무 간담회 및 성과 분석" },
      { strat: "S1", id: "B1-S1T2-1", title: "주력 신산업 분야 지산학 융합 컨퍼런스 세미나" },
      { strat: "S2", id: "B1-S2T3-1", title: "전문기술석사 연계 연구실(Lab) 활성화 지원" },
      { strat: "S3", id: "B1-S3T4-1", title: "공용 고가 정밀 분석 장비 실무 교육 및 지원" }
    ]
  },
  "B2": {
    strategies: [
      { id: "S1", title: "AID-X지원센터 구축 및 운영" },
      { id: "S2", title: "AI·DX 분야 기술중심 교육과정 운영" },
      { id: "S3", title: "AI·DX 정착을 위한 첨단 기술 확보" },
      { id: "S4", title: "MANI 초광역 협력 기반 인재양성 및 확산체계 구축" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "AID-X지원센터 운영 고도화 및 AWS C3 인증센터 구축" },
      { strat: "S2", id: "2", title: "AI·DX 분야 교원 역량 강화 프로그램 운영" },
      { strat: "S2", id: "3", title: "전 학부(과) 참여형 AI·DX 교육과정 개편 및 운영" },
      { strat: "S3", id: "4", title: "AI·DX 분야 산학공동기술개발 및 현장 실증 지원" },
      { strat: "S4", id: "5", title: "MANI 초광역 협력체계 확립 및 AI·DX 성과 확산" }
    ],
    programs: [
      { strat: "S1", id: "B2-S1T1-1", title: "AID-X 지원실 구축 및 정밀 서버 장비 도입" },
      { strat: "S2", id: "B2-S2T2-1", title: "교원 대상 파이썬/딥러닝 역량강화 연수 코스" },
      { strat: "S2", id: "B2-S2T3-1", title: "AI 기본 리터러시 융합 연계 전공 마이크로디그리" },
      { strat: "S3", id: "B2-S3T4-1", title: "중소기업 현장 실증형 AI 알고리즘 적용 프로젝트" },
      { strat: "S4", id: "B2-S4T5-1", title: "초광역 MANI 워크숍 공동 개최 및 연구성과 배포" }
    ]
  },
  "B3": {
    strategies: [
      { id: "S1", title: "지산학 협력 기반 탄소중립 실무 인재 양성" },
      { id: "S2", title: "디지털 전환 기반 중소기업 탄소 대응체계 구축" },
      { id: "S3", title: "지역 사회 상생 및 탄소중립 실천문화 확산" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "AI 기반 탄소중립 및 ESG 교육과정 개발 운영" },
      { strat: "S2", id: "2", title: "중소기업 탄소배출 진단 및 저탄소 플랫폼 지원" },
      { strat: "S3", id: "3", title: "캠퍼스 에코-리빙랩 탄소감축 실증 및 업사이클링 강화" }
    ],
    programs: [
      { strat: "S1", id: "B3-S1T1-1", title: "ESG 등급 분석 전문가 연계 대학 특강 개설" },
      { strat: "S2", id: "B3-S2T2-1", title: "중소 제조 사업장 온실가스 배출 정밀 실태 진단" },
      { strat: "S3", id: "B3-S3T3-1", title: "에코 캠퍼스 리빙랩 프로젝트 및 친환경 일회용품 저감" }
    ]
  },
  "B4": {
    strategies: [
      { id: "S1", title: "복합재난 대응 역량 강화를 위한 인재 양성" },
      { id: "S2", title: "재난 단계별 복합재난 대응 체계 구축" },
      { id: "S3", title: "지·산·학·연 복합재난 협력 네트워크 구축 및 운영" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "재난 대응 안전보건 인재 양성 및 AI 다국어 콘텐츠 실증" },
      { strat: "S2", id: "2", title: "산업군별 맞춤형 재난 기술지원 및 매뉴얼 안전 진단" },
      { strat: "S3", id: "3", title: "간호시뮬레이션 연계 재난 교육장 운영 및 거버넌스 활성화" }
    ],
    programs: [
      { strat: "S1", id: "B4-S1T1-1", title: "VR 활용 복합 가상 대피/화재 재난 안전훈련 체험" },
      { strat: "S2", id: "B4-S2T2-1", title: "화학 공장 폭발 위험요소 진단 가이드북 배포" },
      { strat: "S3", id: "B4-S3T3-1", title: "재난 긴급 의료 구호 지산학 세미나 개최" }
    ]
  },
  "C1": {
    strategies: [
      { id: "S1", title: "울산 특화형 평생·직업교육 거점센터 기능 고도화 및 다양화" },
      { id: "S2", title: "지역산업 연계형 자격기반 평생직업교육 모델 개발 및 운영" },
      { id: "S3", title: "지역산업 수요기반 취·창업 평생학습 프로그램 운영" },
      { id: "S4", title: "지역산업의 인력수요 대응형 평생직업교육 운영 및 협력체계 확장" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "울산 평생직업교육 거점센터 운영 및 통합 플랫폼 고도화" },
      { strat: "S2", id: "2", title: "생애주기 맞춤형 학습트랙 개설 및 성인학습자 학과 운영" },
      { strat: "S3", id: "3", title: "취약계층 취·창업 연계 직무교육 및 평생학습 교육과정 확대" },
      { strat: "S4", id: "4", title: "평생직업교육 거버넌스 및 협력형 맞춤 평생직업교육 확대" }
    ],
    programs: [
      { strat: "S1", id: "C1-S1T1-1", title: "평생직업 교육 정보 포털 시스템 유지보수 고도화" },
      { strat: "S2", id: "C1-S2T2-1", title: "성인학습자 친화형 유연 학사 제도 설계 연구" },
      { strat: "S3", id: "C1-S3T3-1", title: "소외 계층 취업 연계 제과제빵 및 용접 등 단기 자격" },
      { strat: "S4", id: "C1-S4T4-1", title: "지역사회 취약계층 재취업 평생교육 추진단 출범" }
    ]
  },
  "C2": {
    strategies: [
      { id: "S1", title: "수요 기반 운영 모델 표준화" },
      { id: "S2", title: "산·학·연·관 네트워크 통합 운영" },
      { id: "S3", title: "데이터 기반 품질관리·성과확산 선순환" },
      { id: "S4", title: "동남권 지역자원·대학역량 결합 특화 패키지 확산" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "방과후/방학 늘봄 프로그램 표준모델 개발 및 시범운영" },
      { strat: "S2", id: "2", title: "동남권 유관기관 돌봄 거버넌스 및 파트너십 구축" },
      { strat: "S3", id: "3", title: "늘봄학교 모니터링 품질관리 체계 및 브랜딩 홍보 구축" },
      { strat: "S4", id: "4", title: "K-pop/브리지게임 등 특화 패키지 확산 및 돌봄교사 양성" }
    ],
    programs: [
      { strat: "S1", id: "C2-S1T1-1", title: "초등학생 맞춤형 방학 체험 프로그램 개발" },
      { strat: "S2", id: "C2-S2T2-1", title: "동남권 아동 복지 보육 연대 파트너십 회의" },
      { strat: "S3", id: "C2-S3T3-1", title: "늘봄 교강사 품질 모니터링 결과 보고서" },
      { strat: "S4", id: "C2-S4T4-1", title: "돌봄 자격 연수 교재 제작 및 아동 교육과정 론칭" }
    ]
  },
  "D1": {
    strategies: [
      { id: "S1", title: "지역기반 문제해결형 프로젝트 추진" },
      { id: "S2", title: "울산형 2주기 RISE 모델 설계 및 지역연계 실행체계 구축" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "지역전문가 연계 공동 설계 및 대학 연계 문제해결 프로젝트" },
      { strat: "S2", id: "2", title: "주민 참여형 생활밀착 에코-리빙랩 운영 및 현장 코디네이터" },
      { strat: "S2", id: "3", title: "울산형 2주기 RISE 모델 연구 및 지역연계 정책 연구" }
    ],
    programs: [
      { strat: "S1", id: "D1-S1T1-1", title: "대학 교수 및 연구원 참여 리빙랩 과제 3개년 설계" },
      { strat: "S2", id: "D1-S2T2-1", title: "주민 참여형 에코 리빙랩 활성화 캠프" },
      { strat: "S2", id: "D1-S2T3-1", title: "2차년도 지자체 요구 RISE 정책 연구 포럼 개최" }
    ]
  },
  "D2": {
    strategies: [
      { id: "S1", title: "지역 의료·돌봄 연계 강화를 통한 협력 운영 체계 정착" },
      { id: "S2", title: "지역 인재 순환과 성과관리를 통한 지속 가능 운영 확립" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "지역사회 기반 보건복지 거버넌스 구축 및 융합 모델 고도화" },
      { strat: "S1", id: "2", title: "맞춤형 보건복지 인재 양성 및 복지케어 모니터링 체계 구축" },
      { strat: "S2", id: "3", title: "지역 맞춤형 보건의료 정주인력 양성 및 실버산업 인력 지원" }
    ],
    programs: [
      { strat: "S1", id: "D2-S1T1-1", title: "울산 의료/간호 지산학 상생 교류 포럼" },
      { strat: "S1", id: "D2-S1T2-1", title: "지역사회 독거노인 맞춤 케어 실무 학생 인력 파견" },
      { strat: "S2", id: "D2-S2T3-1", title: "실버산업 맞춤형 요양 보호 기술 교육 강좌" }
    ]
  },
  "D3": {
    strategies: [
      { id: "S1", title: "지역과 문화 연계 협력 네트워크 구축" },
      { id: "S2", title: "지역사회 환경·문화 꿀잼 역량 강화" }
    ],
    tasks: [
      { strat: "S1", id: "1", title: "도시재생 및 에코컬처 문화예술 교육 및 체험의 다변화" },
      { strat: "S1", id: "2", title: "크리에이터 양성 및 공유 인프라 기반의 리빙랩 재생" },
      { strat: "S1", id: "3", title: "대학/지역사회 연계 커뮤니티 공유 공간 구축 및 인프라 재생" },
      { strat: "S1", id: "4", title: "주민 밀착형 거버넌스 및 도시재생 참여 서포터즈 운영" },
      { strat: "S2", id: "5", title: "지역사회 밀착형 에코컬처 및 문화예술 체험 활성화" },
      { strat: "S2", id: "6", title: "축제 연계 청년문화체험 및 지산학 예술 프로젝트 협업" },
      { strat: "S2", id: "7", title: "지산학 실내 부스 지원 및 성과확산 전통문화 체험 교류" },
      { strat: "S2", id: "8", title: "지역 연계협업 문화 콘텐츠 발굴 및 실무 개발 프로젝트" }
    ],
    programs: [
      { strat: "S1", id: "D3-S1T1-1", title: "문화 콘텐츠 개발 우수 사례 및 벤치마킹" },
      { strat: "S1", id: "D3-S1T1-2", title: "국중박 벤치마킹" },
      { strat: "S1", id: "D3-S1T1-3", title: "(이월사업)(문화/도시재생 체험 프로그램)북구 이화정 벤치마킹" },
      { strat: "S1", id: "D3-S1T1-4", title: "K-컬처 글로벌 교류 프로젝트: 대만 충유대 교류 프로그램" },
      { strat: "S1", id: "D3-S1T1-5", title: "(이월사업)(문화/도시재생 체험 프로그램)울리단길 런케이션" },
      { strat: "S1", id: "D3-S1T2-1", title: "콘텐츠 크리에이터 연계 프로젝트(실무 프로젝트)" },
      { strat: "S1", id: "D3-S1T2-2", title: "(이월사업)(콘텐츠 크리에이터 양성프로그램 심화과정)세계유산 도시 울산, 첫 페이지를 열다" },
      { strat: "S1", id: "D3-S1T3-1", title: "도시재생 체험 프로젝트" },
      { strat: "S1", id: "D3-S1T3-2", title: "대학내 커뮤니티 공간 구축(북카페조성)" },
      { strat: "S1", id: "D3-S1T3-3", title: "(이월사업)지역 커뮤니티 공간 기자재 구입" },
      { strat: "S1", id: "D3-S1T4-1", title: "도시공간 재생 프로젝트 거버넌스 운영" },
      { strat: "S1", id: "D3-S1T4-2", title: "서포터즈 활동비" },
      { strat: "S2", id: "D3-S2T5-1", title: "문화 예술 체험 프로젝트" },
      { strat: "S2", id: "D3-S2T6-1", title: "지역 연계 협업 예술 프로젝트(중구 배움의 뜰, 평생교육학습 축제예정)" },
      { strat: "S2", id: "D3-S2T6-2", title: "①힙합라운지-청년문화체험" },
      { strat: "S2", id: "D3-S2T6-3", title: "②대학이 여는 도시재생-그래피티 운영" },
      { strat: "S2", id: "D3-S2T6-4", title: "③지산학 페스티벌-그래피티 부스 운영" },
      { strat: "S2", id: "D3-S2T6-5", title: "④문화-도시 재생 네트워킹 라운드 테이블" },
      { strat: "S2", id: "D3-S2T6-6", title: "⑤3개대학 연합 문화관광 서포터즈 발대식" },
      { strat: "S2", id: "D3-S2T7-1", title: "지역사회 연계 및 교류 홍보" },
      { strat: "S2", id: "D3-S2T7-2", title: "지산학 실내 부스 센터별 지원금" },
      { strat: "S2", id: "D3-S2T7-3", title: "(이월사업)(성과활용확산)세계인의 날 연계 전통문화체험 부스 운영" },
      { strat: "S2", id: "D3-S2T7-4", title: "(이월사업)(성과활용확산)도시재생 거버넌스 운영" },
      { strat: "S2", id: "D3-S2T8-1", title: "지역 연계협업 문화 콘텐츠 개발 프로젝트" }
    ]
  }
};

export default function UnitSystemView({ selectedYear = 2 }) {
  const [selectedProjectId, setSelectedProjectId] = useState("A");
  
  const currentProjectsData = selectedYear === 1 ? PROJECTS_DATA_Y1 : PROJECTS_DATA;
  const currentStrategyMapping = selectedYear === 1 ? STRATEGY_TASK_MAPPING_Y1 : STRATEGY_TASK_MAPPING;

  // 선택한 프로젝트 소속 단위과제들 중 첫 번째 과제를 기본값으로 설정
  const currentProject = currentProjectsData.find(p => p.id === selectedProjectId);
  const defaultUnitId = currentProject && currentProject.units.length > 0 ? currentProject.units[0].id : "";
  const [selectedUnitId, setSelectedUnitId] = useState(defaultUnitId);

  // 선택한 단위과제 소속 전략 정보 로드
  const selectedUnitData = currentStrategyMapping[selectedUnitId] || {
    strategies: [],
    tasks: [],
    programs: []
  };

  // 선택한 추진전략(S)의 ID 상태
  const defaultStratId = selectedUnitData.strategies.length > 0 ? selectedUnitData.strategies[0].id : "";
  const [selectedStratId, setSelectedStratId] = useState(defaultStratId);

  // 선택한 추진과제(T)의 ID 상태
  const [selectedTaskId, setSelectedTaskId] = useState("");

  // 선택된 추진전략에 부속되는 추진과제(T) 필터링
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

  // 추진전략(S) 변경 시 추진과제(T) 드롭다운 첫 번째로 자동 연동
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
  const handleProjectChange = (projId) => {
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
  const getRawPrograms = () => {
    if (selectedYear === 1) {
      return selectedUnitData.programs || [];
    } else {
      let foundUnit = null;
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

  // 선택된 추진전략(S) 및 추진과제(T)에 부속되는 프로그램(PG) 필터링
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
          울산과학대학교 RISE(앵커) 사업 기획 위계 체계
        </h3>
        
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "1.2rem" }}>
          RISE 사업의 효율적인 기획 및 성과관리를 위해 본 대시보드는 <strong>프로젝트 - 단위과제 - 추진전략 - 추진과제 - 프로그램</strong>의 5단계 고유 연계 체계를 도입하여 관리하고 있습니다.
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
            <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-primary)" }}>추진과제 (Strategic Task)</div>
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
            <strong style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>프로그램 고유 ID 작명 룰 (ID Rule)</strong>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4", margin: 0 }}>
            <code style={{ background: "var(--border-color)", padding: "0.1rem 0.3rem", borderRadius: "0.2rem", color: "var(--accent-color)", fontFamily: "monospace" }}>
              단위과제번호-(추진전략번호+추진과제번호)-프로그램번호
            </code>
            <span style={{ margin: "0 0.5rem", color: "var(--border-color)" }}>|</span>
            예시: <strong style={{ color: "var(--text-primary)" }}>{selectedYear === 1 ? "A1-S1T1-1" : "A1가-S1T1-1"}</strong> ➔ 단위과제 <strong style={{ color: "#10b981" }}>{selectedYear === 1 ? "A1" : "A1가"}</strong>, 추진전략 <strong style={{ color: "#ec4899" }}>S1</strong>, 추진과제 <strong style={{ color: "#f59e0b" }}>T1</strong>에 매핑된 <strong style={{ color: "#8b5cf6" }}>1번 프로그램</strong>을 의미함.
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
              3단계: 추진전략 선택(S)
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

          {/* 4. 추진과제 드롭다운 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700" }}>
              4단계: 추진과제 선택(T)
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

        {/* 우측: 선택한 전략에 연동된 추진과제(T) 및 프로그램(PG) 출력 영역 */}
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

          {/* 중단: 선택된 추진과제 (T) 상세 */}
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
              선택된 추진과제 (Strategic Task)
            </span>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {!selectedTaskId ? (
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", textAlign: "center", padding: "2rem", border: "1px dashed var(--border-color)" }}>
                  본 전략에 매핑된 세부 추진과제가 아직 존재하지 않습니다.
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
                  <span style={{ fontWeight: "700" }}>{filteredTasks.find(t => t.id === selectedTaskId)?.title || "선택된 추진과제가 없습니다."}</span>
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
