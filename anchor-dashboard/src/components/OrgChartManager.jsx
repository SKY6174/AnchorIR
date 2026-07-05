import React, { useState } from "react";
import { Network, ChevronRight, ChevronDown, Award, Phone, MapPin, Layers, BookOpen } from "lucide-react";

// 대학조직도 데이터 셋트
const universityOrgData = {
  university: {
    title: "대학본부",
    desc: "대학의 행정 및 교육 지원 전반을 관장하는 본부 부서",
    departments: [
      {
        name: "교무처",
        subTeams: [
          { name: "교무팀", tel: "052-230-0114", loc: "대학본부 2층", task: "학사 행정 총괄 및 교원 인사", rise: "학사 구조 개편 및 학칙 개정 연계" },
          { name: "서부행정실", tel: "052-230-0118", loc: "서부캠퍼스 본관 1층", task: "서부캠퍼스 행정 업무 및 학사 지원 총괄" },
          { name: "교수학습지원센터", tel: "052-230-0117", loc: "대학본부 3층", task: "교수법 및 학습법 개발 지도, 원격 교육 지원", rise: "앵커 교수법 혁신 모델 연구 연계" },
          { name: "직업교육혁신센터", tel: "052-230-0115", loc: "대학본부 2층", task: "NCS 및 직업교육과정 개발/운영", rise: "A1 (주문식 교육과정 연계)" },
          { name: "교양교육혁신센터", tel: "052-230-0116", loc: "대학본부 3층", task: "융합형 교양 교육과정 개발 및 교재 편찬" },
          { name: "공학기술교육센터", tel: "052-230-0119", loc: "공학관 B동 1층", task: "공학계열 공학교육인증(ABEEK) 및 비교과 프로그램 운영" },
          { name: "원격교육지원센터", tel: "052-230-0108", loc: "도서관 3층", task: "온라인 동영상 강의 녹화 및 LMS 원격수업 관리" },
          { name: "성인학습자행정지원실", tel: "052-230-0109", loc: "본관 1층", task: "성인 및 야간 학습자 학사 장학 상담 및 행정 편의 지원", rise: "B2 (성인학습자 플랫폼 연계)" }
        ]
      },
      {
        name: "기획처",
        subTeams: [
          { name: "기획팀", tel: "052-230-0120", loc: "대학본부 3층", task: "대학 중장기 발전계획 및 앵커 사업 기획/조율", rise: "앵커 사업단 총괄 연계" },
          { name: "대외협력실", tel: "052-230-0121", loc: "대학본부 1층", task: "언론 홍보, SNS 채널 관리 및 대외 기관 네트워킹", rise: "앵커 사업 대외 브랜딩 연계" }
        ]
      },
      {
        name: "입학처",
        subTeams: [
          { name: "입학팀", tel: "052-230-0140", loc: "대학본부 1층", task: "신입생 수시/정시 모집 요강 수립 및 입학 전형 관리" },
          { name: "진로진학지원센터", tel: "052-230-0141", loc: "대학본부 1층", task: "고교 방문 입시설명회 및 청소년 진로 체험단 운영" }
        ]
      },
      {
        name: "학생취업처",
        subTeams: [
          { name: "진로취업팀", tel: "052-230-0130", loc: "학생회관 2층", task: "학생 맞춤형 진로지도 및 일자리 연계", rise: "A2 (글로컬 창업인재 연계)" },
          { name: "학생복지팀", tel: "052-230-0131", loc: "학생회관 1층", task: "장학금 지급, 학생 자치 기구 및 동아리 지원" },
          { name: "미래혁신기술교육센터", tel: "052-230-0132", loc: "창의관 2층", task: "첨단 신기술 분야 비교과 훈련 및 교육 인프라 조성", rise: "A1 (미래혁신 직업교육 연계)" },
          { name: "사회봉사지원센터", tel: "052-230-0133", loc: "학생회관 2층", task: "지역 사회 봉사 프로그램 기획 및 학점 연계 봉사" },
          { name: "학생상담센터", tel: "052-230-0134", loc: "학생회관 2층", task: "재학생 심리 검사, 진로 상담 및 대학 생활 적응 클리닉 운영" }
        ]
      },
      {
        name: "총무처",
        subTeams: [
          { name: "총무팀", tel: "052-230-0150", loc: "대학본부 1층", task: "자산 관리, 보안 및 의전 행정 총괄", rise: "앵커 사업단 행정 자산 및 물품 관리 협업" },
          { name: "시설안전관리팀", tel: "052-230-0152", loc: "공학관 B동 1층", task: "교내 시설물 소방 안전 진단 및 환경 개선용역 관리", rise: "구매용역 환경개선 연계" },
          { name: "재무회계팀", tel: "052-230-0151", loc: "대학본부 1층", task: "대학 예결산 관리 및 자금 집행 검증", rise: "앵커 사업비 대학 자금 매칭 및 예산 감사" }
        ]
      }
    ]
  },
  industry: {
    title: "산학협력단",
    desc: "지·산·학 협력 네트워크 활성화 및 기술 이전을 추진하는 특수법인 조직",
    departments: [
      {
        name: "산학기획팀",
        subTeams: [
          { name: "산학기획팀", tel: "052-230-0200", loc: "산학협력관 3층", task: "산학 연구 과제 기획 및 가족회사 네트워킹 기획 운영", rise: "지산학 기획 및 가족회사 네트워킹 연계" }
        ]
      },
      {
        name: "산학지원팀",
        subTeams: [
          { name: "산학지원팀", tel: "052-230-0201", loc: "산학협력관 3층", task: "산학 연구비 집행 정산 및 지식재산권 기술이전 관리", rise: "연구비 정산 및 지식재산권 매칭 연계" }
        ]
      },
      {
        name: "부속기관",
        subTeams: [
          { name: "창업창직교육센터", tel: "052-230-0203", loc: "산학협력관 2층", task: "창업보육센터 지원 및 학생 스타트업 교육", rise: "A2 (앵커 스타트업 연계)" },
          { name: "현장실습지원센터", tel: "052-230-0202", loc: "산학협력관 2층", task: "재학생 하계/동계 기업 인턴십 및 현장 실습 매칭", rise: "A1 (주문식 현장실습 연계)" },
          { name: "울산광역시 탄소중립 지원센터", tel: "052-230-0204", loc: "연구관 4층", task: "울산형 탄소중립 실행계획 및 정책 제안 수립", rise: "1차년도 ESG/탄소중립 연계" },
          { name: "울산늘봄누리센터", tel: "052-230-0505", loc: "보건관 1층", task: "울산 지역 늘봄 교육 프로그램 개발, 연계 및 강사 풀(Pool) 매칭 관리", rise: "B2 (늘봄 누리 플랫폼 연계)" },
          { name: "AID-X지원센터", tel: "052-230-0504", loc: "산학협력관 4.5층", task: "AID-X 디지털 전환 특화 직업교육과정 개발 및 AI 융합 교육 모델 실증", rise: "A1 (AIDX 교육 매핑)" }
        ]
      },
      {
        name: "학교기업",
        subTeams: [
          { name: "종합환경분석센터", tel: "052-230-0206", loc: "연구관 1층", task: "지역 토양 및 수질 환경 검사 대행 업무" },
          { name: "영상콘텐츠제작센터", tel: "052-230-0207", loc: "창의관 2층", task: "앵커 홍보 영상 및 온라인 콘텐츠 제작", rise: "홍보영상 Shorts 스케치 연계" },
          { name: "스포츠재활운동센터", tel: "052-230-0208", loc: "체육관 1층", task: "스포츠재활 트레이닝 및 시민 개방형 재활 프로그램" }
        ]
      },
      {
        name: "부설연구소",
        subTeams: [
          { name: "이차전지연구소", tel: "052-230-0211", loc: "연구관 2층", task: "이차전지 핵심 소재 분석 및 기업 연계 R&D R&D 과제 공동 개발", rise: "A1 (신산업 트랙 연계)" },
          { name: "지산학혁신연구소", tel: "052-230-0212", loc: "산학협력관 3층", task: "지산학관 혁신 모델 기획 및 성과 분석 지표 관리", rise: "앵커 성과분석 연계" }
        ]
      },
      {
        name: "사업단",
        subTeams: [
          { name: "어린이급식관리사업단", tel: "052-230-0213", loc: "자연과학관 1층", task: "울산 관내 어린이 급식 위생 및 영양 관리 지도 사업" },
          { name: "기업인재교육본부", tel: "052-230-0209", loc: "산학협력관 1층", task: "일학습병행 공동훈련센터 및 지역·산업 맞춤형 전문 인력양성 훈련 운영", rise: "일학습병행 공동훈련 및 전문인력 양성 협업" },
          { name: "울산형유아교육·보육혁신지원사업단", tel: "052-230-0215", loc: "인문관 2층", task: "유아 보육 모델 혁신 연구 및 교사 연수 지원" },
          { name: "간호학부실습교육지원사업단", tel: "052-230-0214", loc: "간호관 3층", task: "간호 시뮬레이션 및 현장 임상 가상 실습 교육 지원", rise: "자연과학 보건 인재 양성" },
          { name: "울산동구 근골격 건강지원센터", tel: "052-230-0216", loc: "체육관 1층", task: "동구 지역 주민 근골격 노화 예방 및 헬스 케어 교실 운영" }
        ]
      }
    ]
  },
  lifelong: {
    title: "평생교육원",
    desc: "성인학습자 및 지역 주민을 위한 열린 평생직업교육 전담 기구",
    departments: [
      {
        name: "평생교육원운영팀",
        subTeams: [
          { name: "평생교육원운영팀", tel: "052-230-0300", loc: "평생교육원관 2층", task: "성인 평생 교육과정 개설, 강사 관리 및 평생교육원 행정 총괄", rise: "B2/B3 (성인평생학습 플랫폼 연계)" }
        ]
      }
    ]
  },
  subsidiary: {
    title: "부속기관",
    desc: "학술 정보, 취업 지원, 국제 교류 및 국책 사업단을 포함하여 대학의 주요 특수 교육/행정 업무를 서포트하는 부속 기관",
    departments: [
      {
        name: "학술정보원",
        subTeams: [
          { name: "학술정보원운영팀", tel: "052-230-0160", loc: "도서관 1층", task: "도서 확충 및 학술 연구 정보 검색 제공" },
          { name: "정보통신운영팀", tel: "052-230-0162", loc: "도서관 2층", task: "교내 정보 네트워크 인프라 구축 및 시스템 보안 솔루션 관리" }
        ]
      },
      {
        name: "국제교류원",
        subTeams: [
          { name: "국제교류원운영팀", tel: "052-230-0170", loc: "대학본부 4층", task: "해외 자매결연 대학 학술교류 및 교환학생 파견", rise: "A1 (글로벌 융합 교류)" },
          { name: "글로컬비즈니스센터", tel: "052-230-0172", loc: "대학본부 4층", task: "외국인 유학생 유치 및 글로벌 한국어 단기 과정 가동" }
        ]
      },
      {
        name: "울산국제개발협력센터",
        subTeams: [
          { name: "울산국제개발협력센터", tel: "052-230-0185", loc: "산학협력관 2층", task: "울산 지자체 ODA(국제개발원조) 사업 지원 및 교육 설명회" }
        ]
      },
      {
        name: "대학일자리플러스센터",
        subTeams: [
          { name: "재학생맞춤형고용서비스사업단", tel: "052-230-0190", loc: "학생회관 2층", task: "재학생 학년별 포트폴리오 설계 및 일경험 매칭" },
          { name: "고교생맞춤형고용서비스사업단", tel: "052-230-0191", loc: "학생회관 2층", task: "울산 지역 특성화고 대상 맞춤형 취업 진로 지도" },
          { name: "졸업생특화프로그램사업단", tel: "052-230-0192", loc: "학생회관 2층", task: "미취업 졸업생 집중 모니터링 및 기업 연계 채용 매칭" }
        ]
      },
      {
        name: "학생생활관",
        subTeams: [
          { name: "학생생활관 운영팀", tel: "052-230-0195", loc: "기숙사 행정실", task: "관생 선발, 기숙사 입·퇴사 절차 및 편의 시설물 위생 소방 안전 점검" }
        ]
      },
      {
        name: "영유아보육지원센터",
        subTeams: [
          { name: "영유아보육지원센터", tel: "052-230-0198", loc: "인문관 1층", task: "울산형 어린이 보육 프로그램 위탁 개발 및 보육교사 힐링 연수" }
        ]
      },
      {
        name: "인권센터",
        subTeams: [
          { name: "인권센터", tel: "052-230-0102", loc: "대학본부 1층", task: "학내 구성원 성희롱·성폭력 고충 접수 해결 및 직장 내 인권 교육" }
        ]
      },
      {
        name: "IR센터",
        subTeams: [
          { name: "IR센터", tel: "052-230-0105", loc: "대학본부 3층", task: "대학 학사 성과 데이터 통합 분석 및 핵심 지표 관리 모델링" }
        ]
      },
      {
        name: "대학언론부",
        subTeams: [
          { name: "대학언론부", tel: "052-230-0106", loc: "학생회관 3층", task: "교지 및 교내 신문 발간, UC 방송국 송출 시스템 기획 관리" }
        ]
      },
      {
        name: "예비군대대",
        subTeams: [
          { name: "예비군대대", tel: "052-230-0107", loc: "학생회관 1층", task: "교직원 및 학생 예비군 편성, 소집 훈련 대상자 통보 관리" }
        ]
      },
      {
        name: "장애학생지원센터",
        subTeams: [
          { name: "장애학생지원센터 운영실", tel: "052-230-0133", loc: "학생회관 1층", task: "장애학생 전용 기자재 대여 및 학습 도우미 연계 서비스" }
        ]
      },
      {
        name: "사업단",
        subTeams: [
          { name: "전문대학혁신지원사업단", tel: "052-230-0250", loc: "연구관 2층", task: "전문대학 혁신 지원 사업 예산 및 교육 프로그램 기획" },
          { name: "기술사관육성사업단", tel: "052-230-0251", loc: "공학관 A동", task: "특성화고-대학-산업체 연계 3단계 직업 기술 연수 코스 운영" },
          { name: "창업교육혁신선도대학사업단", tel: "052-230-0252", loc: "산학협력관 2층", task: "경남·울산권 연합 대학 창업 인재 기지 구축 사업" },
          { name: "첨단산업인재양성부트캠프사업단", tel: "052-230-0253", loc: "공학관 B동", task: "반도체 및 신소재 첨단 기술 초단기 부트캠프 직무 교육" },
          { name: "차세대통신혁신융합대학사업단", tel: "052-230-0254", loc: "창의관 3층", task: "전국 거점 대학 공동 차세대 5G/6G 통신 융합 전공 학점 교육" },
          { name: "앵커 사업단", tel: "052-230-0255", loc: "산학협력관 4층", task: "지자체-대학-산업 연계 앵커 예산 기획 및 성과 지표 고도화 총괄", rise: "앵커 사업 총괄 연계" },
          { name: "국제협력선도대학육성지원사업단", tel: "052-230-0257", loc: "대학본부 4층", task: "해외 개발도상국 대학 간호·보건 학부 개설 원조 지원" }
        ]
      },
      {
        name: "AID-X지원센터",
        subTeams: [
          { name: "AID-X지원센터", tel: "052-230-0504", loc: "산학협력관 4.5층", task: "인공지능 및 디지털 전환 교육 과정 실증 프로그램 운영", rise: "A1 (AID-X 트랙 매핑)" }
        ]
      }
    ]
  },
  academic: {
    title: "학부(과)",
    desc: "공학, 자연과학, 인문사회 및 전문 석사과정 교육 부서",
    departments: [
      {
        name: "공학계열",
        subTeams: [
          { name: "컴퓨터공학과", tel: "052-230-1140", loc: "창의관 3층", task: "소프트웨어 코딩, 웹/앱 개발 및 AI 플랫폼 교육" },
          { name: "게임영상학과", tel: "052-230-1150", loc: "창의관 4층", task: "실시간 게임 그래픽, 3D 애니메이션 및 엔진 코딩" },
          { name: "실내건축디자인과", tel: "052-230-1160", loc: "조형관 2층", task: "실내 인테리어 공간 디자인 및 3D CAD/BIM 실무" },
          {
            name: "기계공학부",
            isFaculty: true,
            majors: [
              { name: "기계시스템전공", tel: "052-230-1110", loc: "공학관 B동 1층", task: "선박/자동차 제조 및 정밀 기계 부품 설계 실무", rise: "A1 (HD현대이앤티 공동 교육 연계)" },
              { name: "기계설비전공", tel: "052-230-1111", loc: "공학관 B동 2층", task: "플랜트 및 빌딩 에너지 기계설비 운용 및 자동제어 실습", rise: "A1 (에너지 기계설비 트랙 연계)" }
            ]
          },
          {
            name: "전기전자공학부",
            isFaculty: true,
            majors: [
              { name: "전기전공", tel: "052-230-1100", loc: "공학관 A동 1층", task: "전력 수배전 설비, 스마트 그리드 및 산업용 모터 제어 실무" },
              { name: "스마트전자전공", tel: "052-230-1101", loc: "공학관 A동 2층", task: "반도체 임베디드 제어, IoT 및 펌웨어 설계 융합 교육" }
            ]
          },
          { name: "조선해양시스템공학과", tel: "052-230-1112", loc: "공학관 B동 2층", task: "조선해양 설계 엔지니어링 및 선박 건조 의장 실무", rise: "A1 (현대중공업 채용연계 트랙)" },
          { name: "화학공학과", tel: "052-230-1120", loc: "공학관 C동", task: "정밀 석유화학 및 바이오 화공 신기술 배양" },
          { name: "융합안전공학과", tel: "052-230-1130", loc: "공학관 A동", task: "산업 현장 유해 위험 진단 및 예방 안전 교육" },
          { name: "인테리어시공학과", tel: "052-230-1170", loc: "조형관 1층", task: "친환경 내장재 시공, 목공 실습 및 견적 실무" }
        ]
      },
      {
        name: "자연과학계열",
        subTeams: [
          { name: "간호학부", tel: "052-230-1200", loc: "간호관", task: "전문 보건의료 간호사 육성 및 임상 시뮬레이션 훈련" },
          { name: "물리치료학과", tel: "052-230-1220", loc: "보건관 3층", task: "도수 치료, 신경계 재활 및 체형 교정 임상 기술" },
          { name: "치위생학과", tel: "052-230-1210", loc: "보건관 2층", task: "구강 예방 치위생 지식 및 치과 임상 실무 교육" },
          { name: "식품영양학과", tel: "052-230-1230", loc: "자연과학관 1층", task: "단체 급식 식단 설계 및 영양 분석 상담 실습" },
          { name: "호텔조리제빵과", tel: "052-230-1250", loc: "자연과학관 3층", task: "이탈리안/양식 조리 및 디저트 베이킹 특화 과정" },
          { name: "스포츠재활학부", tel: "052-230-1260", loc: "체육관 2층", task: "선수 트레이닝 코칭 및 체력 진단 분석법", rise: "지역사회 시니어 헬스케어 평생교육" },
          { name: "스포츠건강재활학과", tel: "052-230-1262", loc: "체육관 2층", task: "근골격 건강 관리, 운동 처방 및 시민 피트니스 가이드" },
          { name: "푸드케어학과", tel: "052-230-1240", loc: "자연과학관 2층", task: "맞춤형 케어푸드 처방 및 영양 관리 실무" },
          { name: "골프산업과", tel: "052-230-1270", loc: "체육관 1층", task: "골프 레슨 피팅 실무, 시설 운영 매니지먼트" },
          { name: "반려동물보건과", tel: "052-230-1280", loc: "자연과학관 4층", task: "반려동물 간호보건 교육 및 행동교정 임상 실무" }
        ]
      },
      {
        name: "인문사회계열",
        subTeams: [
          { name: "사회복지학과", tel: "052-230-1320", loc: "인문관 3층", task: "사회복지 정책론, 지역사회 보장 계획 수립 실습" },
          { name: "유아교육과", tel: "052-230-1310", loc: "인문관 2층", task: "유치원/보육교사 자격 취득 및 아동 심리 미술 프로그램" },
          { name: "세무회계학과", tel: "052-230-1330", loc: "인문관 1층", task: "전산세무 1급 자격 취득, 세법 해석 및 세무조사 대행 실무" },
          { name: "사회복지상담학과", tel: "052-230-1340", loc: "인문관 3층", task: "청소년/가족 심리상담 치료 실증 과정" },
          { name: "국제학부", tel: "052-230-1300", loc: "대학본부 4층", task: "비즈니스 영어/일어/중국어 통역 및 글로벌 무역 실무", rise: "A1 (글로벌 융합 역량 강화 연계)" }
        ]
      },
      {
        name: "전문기술석사과정",
        subTeams: [
          { name: "미래모빌리티제조학과", tel: "052-230-1400", loc: "공학관 B동", task: "전기/수소 친환경 자동차 고성능 부품 가공 및 모빌리티 정비 기술" },
          { name: "바이오화학생산기술학과", tel: "052-230-1420", loc: "공학관 C동", task: "바이오 의약품 생산 제조 및 친환경 미세 석유화학 정밀 공정 고도화" },
          { name: "인공지능기반텔레헬스학과", tel: "052-230-1410", loc: "보건관 4층", task: "비대면 원격 의료 장비 제어 및 바이오 IT 인공지능 융합 텔레헬스 석사과정" }
        ]
      }
    ]
  },
  anchor: {
    title: "앵커사업단(부속기관)",
    desc: "울산과학대학교 앵커 사업 및 실무를 직접 관장하는 사업단",
    departments: [
      {
        name: "앵커사업단(부속기관)",
        subTeams: [
          { name: "사업운영팀", tel: "052-230-0500", loc: "산학협력관 4층", task: "앵커 사업 예산 총괄, 회계 처리, 정산 및 사업비 모니터링 관리", rise: "앵커 예산 총괄 및 모니터링 관리" },
          { name: "ECC센터", tel: "052-230-0501", loc: "산학협력관 4층", task: "교육혁신(Education Innovation) 부문 총괄 및 주문식 교육과정 가동", rise: "A1 (주문식 교육과정 매핑)" },
          { name: "ICC센터", tel: "052-230-0502", loc: "산학협력관 4층", task: "기업협업(Industry Cooperation) 부문 총괄 및 지산학 공동 연구 개발 기술 지원", rise: "A2 (글로컬 창업인재 연계)" },
          { name: "RCC센터", tel: "052-230-0503", loc: "산학협력관 4층", task: "지역협업(Region Cooperation) 부문 총괄 및 지역현안해결, 도시재생/에코컬처 연계", rise: "B1/B2/D3 (도시재생/에코컬처/늘봄 연계)" },
          { name: "AID-X지원센터", tel: "052-230-0504", loc: "산학협력관 4.5층", task: "AID-X 디지털 전환 특화 직업교육과정 개발 및 AI 융합 교육 모델 실증", rise: "A1 (AIDX 교육 매핑)" },
          { name: "울산늘봄누리센터", tel: "052-230-0505", loc: "보건관 1층", task: "울산 지역 늘봄 교육 프로그램 개발, 연계 및 강사 풀(Pool) 매칭 관리", rise: "B2 (늘봄 누리 플랫폼 연계)" },
          { name: "신산업특화센터", tel: "052-230-0506", loc: "공학관 B동 2층", task: "2차전지, 미래 모빌리티 등 지역 신산업 분야 재직자 훈련 과정 개설 운영", rise: "A1 (신산업 트랙 매핑)" }
        ]
      }
    ]
  }
};

export default function OrgChartManager() {
  const [selectedKey, setSelectedKey] = useState("university");
  const [expandedDept, setExpandedDept] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [expandedFaculties, setExpandedFaculties] = useState({});

  // 앵커수행 7대 조직 판별 헬퍼
  const isAnchorExecutionDept = (name) => {
    const anchorDepts = ["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"];
    return anchorDepts.includes(name);
  };

  const currentCategory = universityOrgData[selectedKey] || universityOrgData.university;
  const listDepts = currentCategory.departments;

  const handleCategoryChange = (key) => {
    setSelectedKey(key);
    setExpandedDept(null);
    setSelectedTeam(null);
    setExpandedFaculties({});
  };

  const toggleDept = (deptIndex) => {
    if (expandedDept === deptIndex) {
      setExpandedDept(null);
    } else {
      setExpandedDept(deptIndex);
    }
  };

  const toggleFaculty = (facultyName) => {
    setExpandedFaculties((prev) => ({
      ...prev,
      [facultyName]: !prev[facultyName]
    }));
  };

  return (
    <div className="org-chart-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      {/* 1. 상단 안내 */}
      <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Network size={22} />
          울산과학대학교 대학조직도
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary-dark)", lineHeight: "1.5" }}>
          울산과학대학교의 학부(과), 대학본부, 평생교육원, 산학협력단, 부속기관 등 핵심 행정 및 교육 조직 계통을 한눈에 조회합니다.
          조직을 선택하면 하위 소속 팀 및 연계된 앵커수행 또는 앵커연계 과제 정보를 조회하실 수 있습니다.
        </p>
      </div>

      {/* 2. 메인 화면 분할 레이아웃 */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        
        {/* [좌측] 1차 분류 및 부서 아코디언 트리 */}
        <div className="glass-card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-secondary-dark)", letterSpacing: "1px" }}>대분류 선택</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {Object.keys(universityOrgData).map((key) => {
              const isAnchor = key === "anchor";
              return (
                <React.Fragment key={key}>
                  {isAnchor && (
                    <div style={{ 
                      height: "1px", 
                      background: "rgba(255,255,255,0.1)", 
                      margin: "1.25rem 0 0.8rem 0" 
                    }} />
                  )}
                  <button
                    onClick={() => handleCategoryChange(key)}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      border: "none",
                      textAlign: "left",
                      fontSize: "0.9rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: selectedKey === key ? "rgba(59, 130, 246, 0.15)" : "transparent",
                      color: selectedKey === key ? "var(--accent-color)" : "var(--text-secondary-dark)",
                      borderLeft: selectedKey === key ? "4px solid var(--accent-color)" : "4px solid transparent",
                      marginTop: isAnchor ? "0.2rem" : "0"
                    }}
                  >
                    {universityOrgData[key].title}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* [중앙] 2차 부서/처 아코디언 목록 */}
        <div className="glass-card" style={{ padding: "1.5rem", minHeight: "500px", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "0.2rem" }}>{currentCategory.title} 세부 조직도</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)" }}>{currentCategory.desc}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {selectedKey === "anchor" ? (
              // 앵커사업단인 경우에는 아코디언 상자를 없애고 바로 센터 리스트 노출 (앵커수행 배지 유지)
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {listDepts[0]?.subTeams.map((team) => (
                  <div
                    key={team.name}
                    onClick={() => setSelectedTeam(team)}
                    style={{
                      padding: "0.8rem 1rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      transition: "all 0.2s ease",
                      background: selectedTeam?.name === team.name ? "rgba(59, 130, 246, 0.12)" : "rgba(255,255,255,0.02)",
                      color: selectedTeam?.name === team.name ? "var(--accent-color)" : "var(--text-primary-dark)",
                      border: selectedTeam?.name === team.name ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(255,255,255,0.05)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span style={{ fontWeight: "700" }}>{team.name}</span>
                    {team.rise && (
                      <span style={{
                        fontSize: "0.75rem",
                        background: "rgba(16, 185, 129, 0.1)",
                        color: "#10B981",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "4px",
                        fontWeight: "800"
                      }}>
                        앵커수행
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // 일반 처/처/원인 경우 아코디언 트리 형태 유지 (앵커사업단을 제외하고는 '앵커연계' 배지 적용)
              listDepts.map((dept, deptIdx) => {
                const isExpanded = expandedDept === deptIdx;
                const hasSingleIdenticalSubteam = dept.subTeams.length === 1 && dept.subTeams[0].name === dept.name;

                if (hasSingleIdenticalSubteam) {
                  // 산학기획팀, 산학지원팀처럼 2차 세부 뎁스가 무의미한 경우, 아코디언 헤더를 생략하고 바로 클릭 가능한 버튼으로 단일 노출!
                  const team = dept.subTeams[0];
                  const isSelected = selectedTeam?.name === team.name;
                  return (
                    <div
                      key={dept.name}
                      onClick={() => {
                        setSelectedTeam(team);
                        setExpandedDept(null); // 다른 아코디언 상태는 닫음
                      }}
                      style={{
                        padding: "1rem 1.25rem",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "0.95rem",
                        fontWeight: "800",
                        transition: "all 0.2s ease",
                        background: isSelected ? "rgba(59, 130, 246, 0.12)" : "rgba(255, 255, 255, 0.01)",
                        color: isSelected ? "var(--accent-color)" : "var(--text-primary-dark)",
                        border: isSelected ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(255, 255, 255, 0.05)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <span>{dept.name}</span>
                      {team.rise && (
                        <span style={{
                          fontSize: "0.75rem",
                          background: isAnchorExecutionDept(dept.name) || selectedKey === "academic" ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
                          color: isAnchorExecutionDept(dept.name) || selectedKey === "academic" ? "#10B981" : "var(--accent-color)",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          fontWeight: "800"
                        }}>
                          {isAnchorExecutionDept(dept.name) ? "앵커수행" : (selectedKey === "academic" ? "주문식교육과정" : "앵커연계")}
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={dept.name}
                    style={{
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: isExpanded ? "rgba(255, 255, 255, 0.02)" : "transparent",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div
                      onClick={() => toggleDept(deptIdx)}
                      style={{
                        padding: "1rem 1.25rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        fontWeight: "800",
                        background: isExpanded ? "rgba(255,255,255,0.03)" : "transparent"
                      }}
                    >
                      <span style={{ fontSize: "0.95rem" }}>{dept.name}</span>
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>

                    {isExpanded && (
                      <div style={{ padding: "0.5rem 1rem 1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {dept.subTeams.map((team) => {
                          if (team.isFaculty) {
                            const isFacultyExpanded = !!expandedFaculties[team.name];
                            return (
                              <div
                                key={team.name}
                                style={{
                                  border: "1px solid rgba(255, 255, 255, 0.05)",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  background: "rgba(255, 255, 255, 0.01)"
                                }}
                              >
                                <div
                                  onClick={() => toggleFaculty(team.name)}
                                  style={{
                                    padding: "0.6rem 0.8rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    fontWeight: "800",
                                    fontSize: "0.85rem",
                                    background: isFacultyExpanded ? "rgba(255,255,255,0.02)" : "transparent"
                                  }}
                                >
                                  <span>{team.name}</span>
                                  {isFacultyExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>

                                {isFacultyExpanded && (
                                  <div style={{ padding: "0.4rem 0.6rem 0.6rem", display: "flex", flexDirection: "column", gap: "0.3rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                    {team.majors.map((major) => (
                                      <div
                                        key={major.name}
                                        onClick={() => setSelectedTeam(major)}
                                        style={{
                                          padding: "0.5rem 0.8rem",
                                          borderRadius: "6px",
                                          cursor: "pointer",
                                          fontSize: "0.8rem",
                                          transition: "all 0.2s ease",
                                          background: selectedTeam?.name === major.name ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.01)",
                                          color: selectedTeam?.name === major.name ? "var(--accent-color)" : "var(--text-primary-dark)",
                                          border: selectedTeam?.name === major.name ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid transparent",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          marginLeft: "0.4rem"
                                        }}
                                      >
                                        <span style={{ fontWeight: "700" }}>{major.name}</span>
                                        {major.rise && (
                                          <span style={{
                                            fontSize: "0.75rem",
                                            background: isAnchorExecutionDept(major.name) || selectedKey === "academic" ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
                                            color: isAnchorExecutionDept(major.name) || selectedKey === "academic" ? "#10B981" : "var(--accent-color)",
                                            padding: "0.15rem 0.4rem",
                                            borderRadius: "4px",
                                            fontWeight: "800"
                                          }}>
                                            {isAnchorExecutionDept(major.name) ? "앵커수행" : (selectedKey === "academic" ? "주문식교육과정" : "앵커연계")}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={team.name}
                              onClick={() => setSelectedTeam(team)}
                              style={{
                                padding: "0.6rem 0.8rem",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                transition: "all 0.2s ease",
                                background: selectedTeam?.name === team.name ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.02)",
                                color: selectedTeam?.name === team.name ? "var(--accent-color)" : "var(--text-primary-dark)",
                                border: selectedTeam?.name === team.name ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                              }}
                            >
                              <span style={{ fontWeight: "700" }}>{team.name}</span>
                              {team.rise && (
                                <span style={{
                                  fontSize: "0.75rem",
                                  background: isAnchorExecutionDept(team.name) || selectedKey === "academic" ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
                                  color: isAnchorExecutionDept(team.name) || selectedKey === "academic" ? "#10B981" : "var(--accent-color)",
                                  padding: "0.15rem 0.4rem",
                                  borderRadius: "4px",
                                  fontWeight: "800"
                                }}>
                                  {isAnchorExecutionDept(team.name) ? "앵커수행" : (selectedKey === "academic" ? "주문식교육과정" : "앵커연계")}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* [우측] 조직 상세 설명 정보 카드 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {selectedTeam ? (
            <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--accent-color)", fontWeight: "900", textTransform: "uppercase" }}>
                  TEAM PROFILE
                </span>
                <h4 style={{ fontSize: "1.15rem", fontWeight: "800", marginTop: "0.2rem" }}>{selectedTeam.name}</h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Phone size={16} style={{ color: "var(--text-secondary-dark)" }} />
                  <div>
                    <span style={{ color: "var(--text-secondary-dark)", display: "block", fontSize: "0.75rem" }}>전화번호</span>
                    <span style={{ fontWeight: "700" }}>{selectedTeam.tel}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <MapPin size={16} style={{ color: "var(--text-secondary-dark)" }} />
                  <div>
                    <span style={{ color: "var(--text-secondary-dark)", display: "block", fontSize: "0.75rem" }}>위치(캠퍼스/호실)</span>
                    <span style={{ fontWeight: "700" }}>{selectedTeam.loc}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "start", gap: "0.5rem" }}>
                  <Layers size={16} style={{ color: "var(--text-secondary-dark)", marginTop: "0.1rem" }} />
                  <div>
                    <span style={{ color: "var(--text-secondary-dark)", display: "block", fontSize: "0.75rem" }}>담당 업무</span>
                    <span style={{ fontWeight: "600", lineHeight: "1.4" }}>{selectedTeam.task}</span>
                  </div>
                </div>

                {selectedTeam.rise && (
                  <div style={{
                    marginTop: "0.5rem",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    background: selectedKey === "academic" ? "rgba(16, 185, 129, 0.06)" : "rgba(59, 130, 246, 0.06)",
                    border: selectedKey === "academic" ? "1px solid rgba(16, 185, 129, 0.15)" : "1px solid rgba(59, 130, 246, 0.15)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem"
                  }}>
                    <span style={{ 
                      fontSize: "0.75rem", 
                      color: selectedKey === "academic" ? "#10B981" : "var(--accent-color)", 
                      fontWeight: "800", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.25rem" 
                    }}>
                      <Award size={14} />
                      {selectedKey === "academic" 
                        ? "주문식교육과정 주요 협업 과제" 
                        : (selectedKey === "anchor" ? "앵커수행 주요 협업 과제" : "앵커연계 주요 협업 과제")}
                    </span>
                    <span style={{ fontSize: "0.8rem", fontWeight: "800" }}>{selectedTeam.rise}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: "2.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "0.75rem" }}>
              <BookOpen size={36} style={{ color: "var(--text-secondary-dark)" }} />
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)" }}>
                조직도에서 특정 학과/팀을 선택하시면 전화번호, 위치, 담당업무 및 {selectedKey === "academic" ? "주문식교육과정" : (selectedKey === "anchor" ? "앵커수행" : "앵커연계")} 상세 정보를 이곳에서 조회하실 수 있습니다.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
