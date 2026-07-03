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
          { name: "교무팀", tel: "052-230-0114", loc: "대학본부 2층", task: "학사 행정 총괄 및 교원 인사" },
          { name: "직업교육혁신센터", tel: "052-230-0115", loc: "대학본부 2층", task: "NCS 및 직업교육과정 개발/운영", rise: "A1 (주문식 교육과정 연계)" },
          { name: "교양교육혁신센터", tel: "052-230-0116", loc: "대학본부 3층", task: "융합형 교양 교육과정 개발 및 교재 편찬" },
          { name: "교수학습지원센터", tel: "052-230-0117", loc: "대학본부 3층", task: "교수법 및 학습법 개발 지도, 원격 교육 지원" }
        ]
      },
      {
        name: "기획처",
        subTeams: [
          { name: "기획팀", tel: "052-230-0120", loc: "대학본부 3층", task: "대학 중장기 발전계획 및 RISE 사업 기획/조율", rise: "RISE 사업단 총괄 연계" },
          { name: "홍보실", tel: "052-230-0121", loc: "대학본부 1층", task: "언론 홍보, SNS 채널 및 대외 브랜딩 관리" }
        ]
      },
      {
        name: "학생취업처",
        subTeams: [
          { name: "진로취업팀", tel: "052-230-0130", loc: "학생회관 2층", task: "학생 맞춤형 진로지도 및 일자리 연계", rise: "A2 (글로컬 창업인재 연계)" },
          { name: "학생복지팀", tel: "052-230-0131", loc: "학생회관 1층", task: "장학금 지급, 학생 자치 기구 및 동아리 지원" },
          { name: "장애학생지원센터", tel: "052-230-0132", loc: "학생회관 1층", task: "장애학생 학습 보조 기자재 및 이동 편의 지원" },
          { name: "사회봉사지원센터", tel: "052-230-0133", loc: "학생회관 2층", task: "지역 사회 봉사 프로그램 기획 및 학점 연계 봉사" }
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
        name: "총무처",
        subTeams: [
          { name: "총무팀", tel: "052-230-0150", loc: "대학본부 1층", task: "자산 관리, 보안 및 의전 행정 총괄" },
          { name: "재무회계팀", tel: "052-230-0151", loc: "대학본부 1층", task: "대학 예결산 관리 및 자금 집행 검증" },
          { name: "시설안전관리팀", tel: "052-230-0152", loc: "공학관 B동 1층", task: "교내 시설물 소방 안전 진단 및 환경 개선용역 관리", rise: "구매용역 환경개선 연계" }
        ]
      },
      {
        name: "학술정보원",
        subTeams: [
          { name: "학술정보팀", tel: "052-230-0160", loc: "도서관 1층", task: "도서 및 학술 데이터베이스 확충, 열람실 운영" }
        ]
      },
      {
        name: "국제교류원",
        subTeams: [
          { name: "국제교류팀", tel: "052-230-0170", loc: "대학본부 4층", task: "외국인 유학생 유치 및 교환학생 파견 관리", rise: "A1 (국제학부 융합 연계)" }
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
          { name: "산학기획팀", tel: "052-230-0200", loc: "산학협력관 3층", task: "산학 연구 과제 기획 및 가족회사 네트워킹 기획 운영" }
        ]
      },
      {
        name: "산학지원팀",
        subTeams: [
          { name: "산학지원팀", tel: "052-230-0201", loc: "산학협력관 3층", task: "산학 연구비 집행 정산 및 지식재산권 기술이전 관리" }
        ]
      },
      {
        name: "부속기관",
        subTeams: [
          { name: "현장실습지원센터", tel: "052-230-0202", loc: "산학협력관 2층", task: "재학생 하계/동계 기업 인턴십 및 현장 실습 매칭", rise: "A1 (주문식 현장실습 연계)" },
          { name: "창업창직교육센터", tel: "052-230-0203", loc: "산학협력관 2층", task: "창업보육센터 지원 및 학생 스타트업 교육", rise: "A2 (U-RISE 스타트업 연계)" },
          { name: "울산광역시탄소중립지원센터", tel: "052-230-0204", loc: "연구관 4층", task: "울산형 탄소중립 실행계획 및 정책 제안 수립", rise: "1차년도 ESG/탄소중립 연계" },
          { name: "산업안전보건교육센터", tel: "052-230-0205", loc: "안전교육원", task: "산업체 근로자 보건안전 훈련 시뮬레이션", rise: "재난안전 공동사업 연계" },
          { name: "이차전지연구소", tel: "052-230-0211", loc: "연구관 2층", task: "이차전지 핵심 소재 분석 및 기업 연계 R&D 과제 공동 개발", rise: "A1 (신산업 트랙 연계)" },
          { name: "지산학혁신연구소", tel: "052-230-0212", loc: "산학협력관 3층", task: "지산학관 혁신 모델 기획 및 성과 분석 지표 관리", rise: "RISE 성과분석 연계" }
        ]
      },
      {
        name: "학교기업",
        subTeams: [
          { name: "종합환경분석센터", tel: "052-230-0206", loc: "연구관 1층", task: "지역 토양 및 수질 환경 검사 대행 업무" },
          { name: "영상콘텐츠제작센터", tel: "052-230-0207", loc: "창의관 2층", task: "RISE 홍보 영상 및 온라인 콘텐츠 제작", rise: "홍보영상 Shorts 스케치 연계" },
          { name: "스포츠재활운동센터", tel: "052-230-0208", loc: "체육관 1층", task: "스포츠재활 트레이닝 및 시민 개방형 재활 프로그램" }
        ]
      },
      {
        name: "기업인재교육본부",
        subTeams: [
          { name: "일학습병행공동훈련센터", tel: "052-230-0209", loc: "산학협력관 1층", task: "고용노동부 주관 일학습병행 공동과정 운영" },
          { name: "공동훈련센터(지산맞)", tel: "052-230-0210", loc: "산학협력관 1층", task: "지역 및 산업 맞춤형 전문 인력양성 훈련" }
        ]
      },
      {
        name: "사업기구",
        subTeams: [
          { name: "어린이급식관리지원단", tel: "052-230-0213", loc: "자연과학관 1층", task: "울산 관내 어린이 단체급식소 위생 및 영양 관리 지도 사업" },
          { name: "간호시뮬레이션센터", tel: "052-230-0214", loc: "간호관 3층", task: "보건의료 학생 및 지역 사회 간호사 임상 가상 실습 훈련", rise: "자연과학 보건 인재 양성 연계" }
        ]
      }
    ]
  },
  lifelong: {
    title: "평생교육원",
    desc: "성인학습자 및 지역 주민을 위한 열린 평생직업교육 전담 기구",
    departments: [
      {
        name: "평생학습지원실",
        subTeams: [
          { name: "평생교육운영팀", tel: "052-230-0300", loc: "평생교육원관 2층", task: "성인 평생 교육과정 개설 및 강사 배정 관리", rise: "B2/B3 (성인평생학습 플랫폼 연계)" },
          { name: "원격평생학습팀", tel: "052-230-0301", loc: "평생교육원관 2층", task: "온라인 성인학습자 교육 콘텐츠 서버 및 LMS 시스템 운영" }
        ]
      }
    ]
  },
  academic: {
    title: "학부(과)",
    desc: "공학, 자연과학, 인문사회 및 고도화 기술 전문 전공 부서",
    departments: [
      {
        name: "공학계열",
        subTeams: [
          { name: "전기전자공학부 (전기전공, 스마트전자전공)", tel: "052-230-1100", loc: "공학관 A동", task: "친환경 신재생에너지 및 스마트 전자 융합 전공 교육" },
          { name: "기계공학부 (기계시스템전공, 기계설비전공)", tel: "052-230-1110", loc: "공학관 B동", task: "선박/자동차 제조 설계 및 에너지 기계설비 시스템 훈련", rise: "A1 (HD현대이앤티 공동 교육 연계)" },
          { name: "화학공학과", tel: "052-230-1120", loc: "공학관 C동", task: "정밀 석유화학 및 바이오 화공 신기술 배양" },
          { name: "융합안전공학과", tel: "052-230-1130", loc: "공학관 A동", task: "산업 현장 유해 위험 진단 및 예방 안전 교육" },
          { name: "컴퓨터공학과", tel: "052-230-1140", loc: "창의관 3층", task: "소프트웨어 코딩, 웹/앱 개발 및 AI 플랫폼 교육" },
          { name: "게임영상학과", tel: "052-230-1150", loc: "창의관 4층", task: "실시간 게임 그래픽, 3D 애니메이션 및 엔진 코딩" },
          { name: "실내건축학과", tel: "052-230-1160", loc: "조형관 2층", task: "실내 인테리어 공간 디자인 및 3D CAD/BIM 실무" },
          { name: "인테리어시공과", tel: "052-230-1170", loc: "조형관 1층", task: "친환경 내장재 시공, 목공 실습 및 견적 실무" }
        ]
      },
      {
        name: "자연과학계열",
        subTeams: [
          { name: "간호학부", tel: "052-230-1200", loc: "간호관", task: "전문 보건의료 간호사 육성 및 임상 시뮬레이션 훈련" },
          { name: "치위생학과", tel: "052-230-1210", loc: "보건관 2층", task: "구강 예방 치위생 지식 및 치과 임상 실무 교육" },
          { name: "물리치료학과", tel: "052-230-1220", loc: "보건관 3층", task: "도수 치료, 신경계 재활 및 체형 교정 임상 기술" },
          { name: "식품영양학과", tel: "052-230-1230", loc: "자연과학관 1층", task: "단체 급식 식단 설계 및 영양 분석 상담 실습" },
          { name: "푸드케어과", tel: "052-230-1240", loc: "자연과학관 2층", task: "맞춤형 케어푸드 처방 및 영양 관리 실무" },
          { name: "호텔조리제빵과", tel: "052-230-1250", loc: "자연과학관 3층", task: "이탈리안/양식 조리 및 디저트 베이킹 특화 과정" },
          { name: "스포츠재활학부", tel: "052-230-1260", loc: "체육관 2층", task: "선수 트레이닝 코칭 및 체력 진단 분석법", rise: "지역사회 시니어 헬스케어 평생교육" },
          { name: "골프산업과", tel: "052-230-1270", loc: "체육관 1층", task: "골프 레슨 피팅 실무, 시설 운영 매니지먼트" }
        ]
      },
      {
        name: "인문사회계열",
        subTeams: [
          { name: "국제학부", tel: "052-230-1300", loc: "대학본부 4층", task: "비즈니스 영어/일어/중국어 통역 및 글로벌 무역 실무", rise: "A1 (글로벌 융합 역량 강화 연계)" },
          { name: "유아교육과", tel: "052-230-1310", loc: "인문관 2층", task: "유치원/보육교사 자격 취득 및 아동 심리 미술 프로그램" },
          { name: "사회복지학과", tel: "052-230-1320", loc: "인문관 3층", task: "사회복지 정책론, 지역사회 보장 계획 수립 실습" },
          { name: "세무회계학과", tel: "052-230-1330", loc: "인문관 1층", task: "전산세무 1급 자격 취득, 세법 해석 및 세무조사 대행 실무" },
          { name: "사회복지상담학과", tel: "052-230-1340", loc: "인문관 3층", task: "청소년/가족 심리상담 치료 실증 과정" }
        ]
      },
      {
        name: "전문기술석사과정",
        subTeams: [
          { name: "미래모빌리티제조과정", tel: "052-230-1400", loc: "공학관 B동", task: "전기/수소 친환경 자동차 고성능 부품 가공 및 모빌리티 정비 기술" },
          { name: "인공지능기반텔레헬스과정", tel: "052-230-1410", loc: "보건관 4층", task: "비대면 원격 의료 장비 제어 및 바이오 IT 인공지능 융합 텔레헬스 석사과정" },
          { name: "바이오화학생산기술과정", tel: "052-230-1420", loc: "공학관 C동", task: "바이오 의약품 생산 제조 및 친환경 미세 석유화학 정밀 공정 고도화" },
          { name: "임상·지역통합 간호과정", tel: "052-230-1430", loc: "간호관 4층", task: "고위험 임상 전문 간호(APN) 및 홈 케어 지역 통합 돌봄 석사과정" }
        ]
      }
    ]
  },
  anchor: {
    title: "앵커사업단",
    desc: "울산과학대학교 라이즈(RISE)사업 및 앵커 실무를 직접 관장하는 사업 부서",
    departments: [
      {
        name: "앵커사업단",
        subTeams: [
          { name: "사업운영팀", tel: "052-230-0500", loc: "산학협력관 4층", task: "RISE 사업 예산 총괄, 회계 처리, 정산 및 사업비 모니터링 관리" },
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

  const currentCategory = universityOrgData[selectedKey];
  const listDepts = currentCategory.departments;

  const handleCategoryChange = (key) => {
    setSelectedKey(key);
    setExpandedDept(null);
    setSelectedTeam(null);
  };

  const toggleDept = (deptIndex) => {
    if (expandedDept === deptIndex) {
      setExpandedDept(null);
    } else {
      setExpandedDept(deptIndex);
    }
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
          울산과학대학교의 학부(과), 대학본부, 평생교육원, 산학협력단 등 핵심 행정 및 교육 조직 계통을 한눈에 조회합니다.
          조직을 선택하면 하위 소속 팀 및 연계된 라이즈(RISE) 과제 정보를 조회하실 수 있습니다.
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
                  {isAnchor && <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0.5rem 0" }} />} {/* 한 칸의 공백 구분선 */}
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
                      borderLeft: selectedKey === key ? "4px solid var(--accent-color)" : "4px solid transparent"
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
              // 앵커사업단인 경우에는 아코디언 상자를 없애고 바로 센터 리스트 노출
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
                        RISE 연계
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // 일반 처/처/원인 경우 아코디언 트리 형태 유지
              listDepts.map((dept, deptIdx) => {
                const isExpanded = expandedDept === deptIdx;
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
                        {dept.subTeams.map((team) => (
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
                                background: "rgba(16, 185, 129, 0.1)",
                                color: "#10B981",
                                padding: "0.15rem 0.4rem",
                                borderRadius: "4px",
                                fontWeight: "800"
                              }}>
                                RISE 연계
                              </span>
                            )}
                          </div>
                        ))}
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
                    background: "rgba(16, 185, 129, 0.06)",
                    border: "1px solid rgba(16, 185, 129, 0.15)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem"
                  }}>
                    <span style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Award size={14} />
                      라이즈(RISE) 주요 협업 과제
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
                조직도에서 특정 학과/팀을 선택하시면 전화번호, 위치, 담당업무 및 RISE 연계 상세 정보를 이곳에서 조회하실 수 있습니다.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
