import React, { useState } from "react";
import { 
  Building2, Laptop, ShieldCheck, Plus, CheckCircle, 
  MapPin, Landmark, DollarSign, Calendar, Info, 
  Eye, FileText, FileImage, LayoutGrid, ListFilter
} from "lucide-react";

export default function ProcurementManager({ currentRole, selectedYear, subTab, onChangeSubTab }) {
  // 모달 제어 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState("env"); // "env", "equip", "service"
  
  // 환경개선 상세 팝업 상태
  const [selectedEnvItem, setSelectedEnvItem] = useState(null);

  // 기자재 탭 단위과제 필터 상태
  const [selectedEquipUnit, setSelectedEquipUnit] = useState("A1");

  // 1. 환경개선 목업 데이터 (1차년도/2차년도 통합 리스트)
  const [envData, setEnvData] = useState([
    {
      id: 1,
      year: 1,
      title: "UC-HYPER 교육과정 운영용 하이퍼 팩토리 교육환경 개선 구축",
      unit: "A1",
      plan: "하이퍼 팩토리 핵심 교육 과정 진행을 위해 기존 로봇실습실의 환기 및 배선 전면 개조 계획 수립",
      meetingResult: "2026.04.12. 사업단 내부 회의 결과: 배선 규격을 3상 380V로 승압 확정 및 LED 조도 개선 의결",
      progress: "기본 설계 완료 ➔ 내부 결재 완료 ➔ 리모델링 시공 완료 ➔ 준공 검사 대기 중 (90% 완료)",
      budgetPlan: 45000000,
      budgetSpent: 42300000,
      location: "울산과학대학교 동부캠퍼스 3공학관 204호",
      purpose: "미래형 친환경 모빌리티 로봇 제어 교육 및 실습용 공간 확보",
      birdseyeView: "공간 조감도: 현대적인 다크 톤 벽면, 개별 집진 설비 및 유리 파티션 분할 레이아웃 적용",
      blueprints: "도면 정보: 전면 배선 회로도 설계 및 소방 대피로 확보 설계 완료",
      utilization: "연간 4개 학과 (컴퓨터IT전공, 기계공학과 등) 전공 교과 및 재직자 직무 교육 공간으로 활용"
    },
    {
      id: 2,
      year: 1,
      title: "바이오 융합 실험실 교육 환경 개선 리모델링",
      unit: "B2",
      plan: "바이오 안전 등급 클래스 2 수준의 무균 작업대 구성을 위한 배관 및 인테리어 개선 구축",
      meetingResult: "2026.05.02. 학과 간담회 결과: 무균 벤치 인근 동선을 단순화하기 위한 중앙 작업실 벽체 철거 승인",
      progress: "철거 완료 ➔ 방수 및 특수 도장 시공 중 (진행률 60%)",
      budgetPlan: 32000000,
      budgetSpent: 18500000,
      location: "서부캠퍼스 1공학관 412호",
      purpose: "바이오 메디컬 융합 인재 양성을 위한 분자생물학 기초/심화 실험 공간",
      birdseyeView: "공간 조감도: 클린룸 패널 및 에어샤워 설치 구조",
      blueprints: "도면 정보: 환기 덕트 경로 및 배수 라인 특수 정화조 연동 도면 작성",
      utilization: "바이오제약 및 정밀화학 분야 산학 공동 연구 및 학생 캡스톤 프로젝트용 공간으로 연중 개방"
    }
  ]);

  // 2. 기자재 구입·운영 목업 데이터
  const [equipData, setEquipData] = useState([
    {
      id: 1,
      unit: "A1",
      name: "다축 교육용 수직다관절 산업용 로봇 팔 (6축)",
      program: "지능형 로봇 스마트 팩토리 인력 양성 프로그램",
      department: "기계공학과 / 기계IT융합전공",
      schedule: "2026.06.01 발주 완료 ➔ 2026.07.15 납품 및 셋업 예정",
      budgetPlan: 55000000,
      budgetSpent: 55000000,
      opPlan: "전문 기술 인력 1인 전담 지정하여 매주 금요일 예방 정비 실행 및 학생 자율 조작 예약제 실시",
      opPerformance: "학기 중 매주 평균 28시간 학생 로봇 티칭 실습 활용, 캡스톤 디자인 대회 출품작 3건 제작 지원 완료"
    },
    {
      id: 2,
      unit: "B2",
      name: "고분자 정밀 크로마토그래피 분석 분석기 (HPLC)",
      program: "신소재 정밀화학 분석 전문성 강화 프로그램",
      department: "화학공학과 / 바이오화학 신소재 센터",
      schedule: "2026.04.20 결재 ➔ 2026.05.30 검수 및 설치 완료",
      budgetPlan: 48000000,
      budgetSpent: 47600000,
      opPlan: "바이오화학 전공 석/박사 및 전문 분석 연구원 기기 정기 캘리브레이션 운영",
      opPerformance: "지역 정밀화학 협력 기업 시료 공동 분석 12건 수행, 관련 졸업 논문 2편 데이터 획득 기여"
    }
  ]);

  // 3. 주요 용역 목업 데이터 (500만원 이상)
  const [serviceData, setServiceData] = useState([
    {
      id: 1,
      title: "울산형 RISE 앵커 과제 고도화를 위한 교육과정 표준 개편 용역",
      purpose: "대학 내 자율/중점 지표 달성을 위한 미래 모빌리티 융합 교과 체계 수립 및 혁신 모델 검증",
      providerQual: "국내 4년제 대학 교육 혁신 컨설팅 유경험 법인 (최근 3년간 유사 국책사업 실적 5건 이상 보유)",
      step: 2, // 1: 결재완료, 2: 발주완료, 3: 검수/종료
      budgetPlan: 18000000,
      budgetSpent: 18000000,
      opResult: "교과과정 표준 가이드라인 1부 납품 및 4개 학부 연동 교육 모델 시뮬레이션 결과 반영 완료"
    },
    {
      id: 2,
      title: "재학생 현장 밀착형 실습 공간 안전 진단 및 정밀 분석 컨설팅 용역",
      purpose: "학내 실험/실습실 유해 위험 요인 분석 및 특수화학 물질 취급 시설 정밀 계측",
      providerQual: "정부 지정 안전진단 전문 대행 기관 (자본금 3억 이상 및 정밀 계측 설비 보유 업체)",
      step: 1, // 1: 결재완료, 2: 발주완료, 3: 검수/종료
      budgetPlan: 95000000,
      budgetSpent: 0,
      opResult: "안전 진단 기획 단계 완료 및 총무팀 구매 입찰 공고 대기 상태 기술 대기 중"
    }
  ]);

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
    // 기자재용
    name: "",
    program: "",
    department: "",
    schedule: "",
    opPlan: "",
    opPerformance: "",
    // 용역용
    providerQual: "",
    step: 1,
    opResult: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (modalType === "env") {
      const newItem = {
        id: Date.now(),
        year: selectedYear,
        title: formData.title || "새 환경개선 항목",
        unit: formData.unit,
        plan: formData.plan || "-",
        meetingResult: formData.meetingResult || "-",
        progress: formData.progress || "-",
        budgetPlan: Number(formData.budgetPlan) || 0,
        budgetSpent: Number(formData.budgetSpent) || 0,
        location: formData.location || "-",
        purpose: formData.purpose || "-",
        birdseyeView: formData.birdseyeView || "공간 조감도 예시 프레임 적용",
        blueprints: formData.blueprints || "도면 정보 예시 프레임 적용",
        utilization: formData.utilization || "-"
      };
      setEnvData([newItem, ...envData]);
    } else if (modalType === "equip") {
      const newItem = {
        id: Date.now(),
        unit: formData.unit,
        name: formData.name || "새 기자재 항목",
        program: formData.program || "-",
        department: formData.department || "-",
        schedule: formData.schedule || "-",
        budgetPlan: Number(formData.budgetPlan) || 0,
        budgetSpent: Number(formData.budgetSpent) || 0,
        opPlan: formData.opPlan || "-",
        opPerformance: formData.opPerformance || "-"
      };
      setEquipData([newItem, ...equipData]);
    } else if (modalType === "service") {
      const newItem = {
        id: Date.now(),
        title: formData.title || "새 주요 용역 항목",
        purpose: formData.purpose || "-",
        providerQual: formData.providerQual || "-",
        step: Number(formData.step) || 1,
        budgetPlan: Number(formData.budgetPlan) || 0,
        budgetSpent: Number(formData.budgetSpent) || 0,
        opResult: formData.opResult || "-"
      };
      setServiceData([newItem, ...serviceData]);
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
      program: "",
      department: "",
      schedule: "",
      opPlan: "",
      opPerformance: "",
      providerQual: "",
      step: 1,
      opResult: ""
    });
  };

  const openAddModal = (type) => {
    setModalType(type);
    setIsAddModalOpen(true);
  };

  return (
    <div className="procurement-manager-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 1. 환경개선 탭 본문 */}
      {subTab === "env_improvement" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 환경개선 헤더 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary-dark)" }}>
                🛠️ 교육환경 개선 사업 관리
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary-dark)" }}>
                안전하고 현대적인 실습실 인프라 및 교육환경 구축 관리 1차 정리 대장
              </p>
            </div>
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
              새 환경개선 건 등록
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem" }}>
            
            {/* 왼쪽: 리스트 프레임 */}
            <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)" }}>
              <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary-dark)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                환경개선 구축 목록
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {envData.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedEnvItem(item)}
                    style={{
                      padding: "1rem",
                      borderRadius: "8px",
                      background: selectedEnvItem?.id === item.id ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.02)",
                      border: selectedEnvItem?.id === item.id ? "1px solid var(--accent-color)" : "1px solid rgba(255,255,255,0.05)",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                      <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA", fontWeight: "700" }}>
                        {item.unit} 과제
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)" }}>
                        예산: {(item.budgetPlan / 10000).toLocaleString()}만 원
                      </span>
                    </div>
                    <h5 style={{ margin: "0.5rem 0 0.5rem 0", fontSize: "0.9rem", fontWeight: "700", color: "white", lineHeight: "1.3" }}>
                      {item.title}
                    </h5>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>
                        📍 {item.location}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: "600" }}>
                        <Eye size={12} />
                        자세히 보기
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 오른쪽: 클릭 시 상세 조회 프레임 */}
            <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)" }}>
              <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary-dark)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                🔍 구축 상세 명세서
              </h4>
              {selectedEnvItem ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem", color: "var(--text-primary-dark)" }}>
                  
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>사업 건명</span>
                    <strong style={{ fontSize: "0.95rem", color: "#60A5FA" }}>{selectedEnvItem.title}</strong>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>배정 단위과제</span>
                      <strong>{selectedEnvItem.unit} 과제</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>구축 위치</span>
                      <span>{selectedEnvItem.location}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>사용 목적</span>
                    <p style={{ margin: "0.2rem 0", lineHeight: "1.3" }}>{selectedEnvItem.purpose}</p>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>교육환경 구축 계획</span>
                    <p style={{ margin: "0.2rem 0", lineHeight: "1.3" }}>{selectedEnvItem.plan}</p>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>회의 결과 / 결정 사항</span>
                    <p style={{ margin: "0.2rem 0", lineHeight: "1.3", color: "#FBBF24" }}>{selectedEnvItem.meetingResult}</p>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>진행 경과</span>
                    <p style={{ margin: "0.2rem 0", lineHeight: "1.3", color: "#34D399" }}>{selectedEnvItem.progress}</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>사업비 계획액</span>
                      <strong style={{ color: "#3B82F6" }}>{(selectedEnvItem.budgetPlan / 10000).toLocaleString()}만 원</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>실제 집행액</span>
                      <strong style={{ color: "#10B981" }}>{(selectedEnvItem.budgetSpent / 10000).toLocaleString()}만 원</strong>
                    </div>
                  </div>

                  {/* 도면 및 조감도 예시 시각화 박스 */}
                  <div style={{ border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "6px", padding: "0.75rem", background: "rgba(0,0,0,0.2)" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.25rem" }}>🎨 조감도 및 설계도 모형</span>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary-dark)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#60A5FA" }}>
                        <FileImage size={14} />
                        <span>{selectedEnvItem.birdseyeView}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#A7F3D0" }}>
                        <FileText size={14} />
                        <span>{selectedEnvItem.blueprints}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>향후 활용 계획</span>
                    <p style={{ margin: "0.2rem 0", lineHeight: "1.3" }}>{selectedEnvItem.utilization}</p>
                  </div>

                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--text-secondary-dark)", fontSize: "0.85rem", textAlign: "center" }}>
                  <Info size={32} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
                  <span>왼쪽 목록에서 환경개선 건을 선택하시면<br />세부 구축 계획 및 설계 도면 명세서가 조회됩니다.</span>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 2. 기자재 구입·운영 탭 본문 */}
      {subTab === "equipment_purchase" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 기자재 상단 필터 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary-dark)" }}>
                🔬 기자재 구입 및 운영 현황
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary-dark)" }}>
                단위과제별 교육/연구용 핵심 기자재의 계획·집행 및 실적 관리
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              {/* 단위과제 필터 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ListFilter size={16} style={{ color: "var(--text-secondary-dark)" }} />
                <select
                  value={selectedEquipUnit}
                  onChange={(e) => setSelectedEquipUnit(e.target.value)}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-primary-dark)",
                    border: "1px solid var(--border-color-dark)",
                    borderRadius: "6px",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    outline: "none"
                  }}
                >
                  {["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                    <option key={u} value={u} style={{ background: "var(--bg-card-dark)" }}>{u} 과제</option>
                  ))}
                </select>
              </div>

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
            </div>
          </div>

          {/* 기자재 리스트 (카드 그리드 뷰) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {equipData.filter(e => e.unit === selectedEquipUnit).length > 0 ? (
              equipData.filter(e => e.unit === selectedEquipUnit).map((equip) => (
                <div 
                  key={equip.id} 
                  className="card" 
                  style={{ 
                    padding: "1.25rem", 
                    borderRadius: "10px", 
                    background: "var(--bg-card-dark)", 
                    border: "1px solid var(--border-color-dark)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "4px", background: "rgba(52, 211, 153, 0.2)", color: "#34D399", fontWeight: "700" }}>
                      기자재 승인 완료
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)" }}>
                      단위과제: {equip.unit}
                    </span>
                  </div>

                  <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "white" }}>
                    {equip.name}
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-primary-dark)", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.5rem" }}>
                    <div>
                      <span style={{ color: "var(--text-secondary-dark)" }}>🔗 관련 프로그램:</span> {equip.program}
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary-dark)" }}>🏫 소속 학부(과)/센터:</span> {equip.department}
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary-dark)" }}>📅 추진 일정:</span> {equip.schedule}
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.25rem" }}>
                      <div>
                        <span style={{ color: "var(--text-secondary-dark)", display: "block" }}>사업비 계획</span>
                        <strong style={{ color: "#3B82F6" }}>{(equip.budgetPlan / 10000).toLocaleString()}만 원</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-secondary-dark)", display: "block" }}>실제 집행액</span>
                        <strong style={{ color: "#10B981" }}>{(equip.budgetSpent / 10000).toLocaleString()}만 원</strong>
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.5rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)", marginTop: "0.25rem" }}>
                      <span style={{ color: "#FBBF24", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.2rem" }}>⚙️ 운영 및 활성화 방안</span>
                      <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: "1.3" }}>{equip.opPlan}</p>
                    </div>

                    <div style={{ background: "rgba(52, 211, 153, 0.05)", padding: "0.5rem", borderRadius: "6px", border: "1px solid rgba(52, 211, 153, 0.1)" }}>
                      <span style={{ color: "#34D399", fontWeight: "700", display: "block", fontSize: "0.75rem", marginBottom: "0.2rem" }}>📈 운영 실적 (활용 성과)</span>
                      <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: "1.3" }}>{equip.opPerformance}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ gridColumn: "span 2", padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", color: "var(--text-secondary-dark)", textAlign: "center" }}>
                <Laptop size={40} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
                <span>선택하신 <strong>{selectedEquipUnit} 과제</strong>에 등록된 기자재 내역이 없습니다.<br />우측 상단 [기자재 추가] 버튼을 눌러 초기 프레임 데이터를 채워주세요.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. 주요 용역 탭 본문 */}
      {subTab === "major_services" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* 주요 용역 상단 카드 */}
          <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary-dark)" }}>
                📑 500만원 이상 주요 용역 관리 대장
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary-dark)" }}>
                기획 결재부터 입찰/발주 및 최종 검수 완료까지의 전 과정 트래킹 프레임
              </p>
            </div>
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
              새 주요 용역 건 등록
            </button>
          </div>

          {/* 용역 리스트 뷰 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {serviceData.map((service) => (
              <div 
                key={service.id} 
                className="card" 
                style={{ 
                  padding: "1.5rem", 
                  borderRadius: "10px", 
                  background: "var(--bg-card-dark)", 
                  border: "1px solid var(--border-color-dark)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem"
                }}
              >
                {/* 상단 명칭 및 예산 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "white", maxWidth: "70%" }}>
                    {service.title}
                  </h4>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block" }}>예산 (계획 / 실제집행)</span>
                    <strong style={{ color: "#60A5FA", fontSize: "1rem" }}>
                      {(service.budgetPlan / 10000).toLocaleString()}만 원
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary-dark)" }}> / </span>
                    <strong style={{ color: "#34D399", fontSize: "1rem" }}>
                      {(service.budgetSpent / 10000).toLocaleString()}만 원
                    </strong>
                  </div>
                </div>

                {/* 중간 세부 내용 */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-primary-dark)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div>
                      <strong style={{ color: "var(--text-secondary-dark)" }}>🎯 추진 목적 (용역 요건):</strong>
                      <p style={{ margin: "0.2rem 0 0 0", lineHeight: "1.4" }}>{service.purpose}</p>
                    </div>
                    <div style={{ marginTop: "0.25rem" }}>
                      <strong style={{ color: "var(--text-secondary-dark)" }}>🏢 수행 기관 자격 요건:</strong>
                      <p style={{ margin: "0.2rem 0 0 0", lineHeight: "1.4" }}>{service.providerQual}</p>
                    </div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.02)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <strong style={{ color: "#34D399", fontSize: "0.75rem" }}>📈 최종 운영 결과 기술</strong>
                    <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: "1.4" }}>{service.opResult || "결과 정산 및 분석 보고서 검토 중..."}</p>
                  </div>
                </div>

                {/* 💡 하단 추진일정 진행 경과 스텝퍼 (Stepper) 시각화 */}
                <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: "8px", padding: "1rem", marginTop: "0.25rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", display: "block", marginBottom: "0.5rem" }}>
                    🔄 구매 용역 행정 추진 일정 단계 현황
                  </span>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                    
                    {/* 가로 선 피팅 */}
                    <div style={{ position: "absolute", left: "10%", right: "10%", top: "45%", height: "2px", background: "rgba(255,255,255,0.1)", zIndex: 1 }}>
                      <div style={{ width: service.step === 1 ? "0%" : service.step === 2 ? "50%" : "100%", height: "100%", background: "var(--accent-color)", transition: "all 0.3s ease" }}></div>
                    </div>

                    {/* Step 1 */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, width: "30%" }}>
                      <div style={{
                        width: "24px", height: "24px", borderRadius: "50%",
                        background: service.step >= 1 ? "var(--accent-color)" : "rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: "700", color: "white"
                      }}>
                        {service.step >= 1 ? <CheckCircle size={14} /> : "1"}
                      </div>
                      <span style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: service.step >= 1 ? "white" : "var(--text-secondary-dark)", fontWeight: "600" }}>
                        사업단 기획 및 결재 완료
                      </span>
                    </div>

                    {/* Step 2 */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, width: "30%" }}>
                      <div style={{
                        width: "24px", height: "24px", borderRadius: "50%",
                        background: service.step >= 2 ? "var(--accent-color)" : "rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: "700", color: "white"
                      }}>
                        {service.step >= 2 ? <CheckCircle size={14} /> : "2"}
                      </div>
                      <span style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: service.step >= 2 ? "white" : "var(--text-secondary-dark)", fontWeight: "600" }}>
                        구매 발주 (총무팀 대행)
                      </span>
                    </div>

                    {/* Step 3 */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, width: "30%" }}>
                      <div style={{
                        width: "24px", height: "24px", borderRadius: "50%",
                        background: service.step >= 3 ? "var(--accent-color)" : "rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: "700", color: "white"
                      }}>
                        {service.step >= 3 ? <CheckCircle size={14} /> : "3"}
                      </div>
                      <span style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: service.step >= 3 ? "white" : "var(--text-secondary-dark)", fontWeight: "600" }}>
                        납품 및 준공 검수
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* 4. 공통 신규 등록 폼 모달 (데이터를 채워가는 유스케이스 대처) */}
      {isAddModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div className="card" style={{ width: "600px", maxHeight: "85vh", overflowY: "auto", padding: "1.5rem", borderRadius: "12px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "white" }}>
                ➕ {modalType === "env" ? "새 환경개선 사업 등록" : modalType === "equip" ? "새 기자재 구매 항목 등록" : "새 주요 용역 사업 등록"}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary-dark)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* 공통 1: 단위과제 선택 */}
              {(modalType === "env" || modalType === "equip") && (
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>귀속 단위과제</label>
                  <select 
                    name="unit" 
                    value={formData.unit} 
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}
                  >
                    {["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                      <option key={u} value={u} style={{ background: "var(--bg-card-dark)" }}>{u} 과제</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 환경개선용 입력 필드들 */}
              {modalType === "env" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사업 건명</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 미래형 친환경 하이퍼 실습실 환경 리모델링" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>구축 위치</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="예: 동부캠퍼스 2공학관 102호" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사용 목적</label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="공간 개조의 궁극적 이용 형태" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>교육환경 구축을 위한 계획</label>
                    <textarea name="plan" value={formData.plan} onChange={handleInputChange} placeholder="인테리어, 전기, 소방, 급배수 조치 계획 기술" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>회의 결과</label>
                    <input type="text" name="meetingResult" value={formData.meetingResult} onChange={handleInputChange} placeholder="심의 의결 내역 요약" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>진행 경과</label>
                    <input type="text" name="progress" value={formData.progress} onChange={handleInputChange} placeholder="예: 시공 착수 ➔ 배선 조율 중" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사업비 계획액 (원)</label>
                      <input type="number" name="budgetPlan" value={formData.budgetPlan} onChange={handleInputChange} placeholder="예: 30000000" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>실제 집행액 (원)</label>
                      <input type="number" name="budgetSpent" value={formData.budgetSpent} onChange={handleInputChange} placeholder="예: 28500000" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>조감도 파일 설명</label>
                    <input type="text" name="birdseyeView" value={formData.birdseyeView} onChange={handleInputChange} placeholder="예: 3D 실내 투시 조감도 파일 첨부" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>설계도 정보</label>
                    <input type="text" name="blueprints" value={formData.blueprints} onChange={handleInputChange} placeholder="예: 캐드 소방 배선 기계 덕트 설계 도면" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>향후 활용 계획</label>
                    <input type="text" name="utilization" value={formData.utilization} onChange={handleInputChange} placeholder="공간 연계 교육과정 활용 방식" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                </>
              )}

              {/* 기자재용 입력 필드들 */}
              {modalType === "equip" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>기자재 명칭</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="예: 고해상도 금속 3D 프린터" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련 프로그램</label>
                    <input type="text" name="program" value={formData.program} onChange={handleInputChange} placeholder="예: 신산업 대응 스마트팩토리 특화 인재 육성" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련 학부(과) 또는 센터</label>
                    <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="예: AI로봇전공 / 공동기자재지원센터" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>추진 일정</label>
                    <input type="text" name="schedule" value={formData.schedule} onChange={handleInputChange} placeholder="예: 2026.06 발주완료 ➔ 08월 말 검수완료" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사업비 계획액 (원)</label>
                      <input type="number" name="budgetPlan" value={formData.budgetPlan} onChange={handleInputChange} placeholder="예: 60000000" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>실제 집행액 (원)</label>
                      <input type="number" name="budgetSpent" value={formData.budgetSpent} onChange={handleInputChange} placeholder="예: 59800000" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>기자재 운영 및 활성화 방안</label>
                    <textarea name="opPlan" value={formData.opPlan} onChange={handleInputChange} placeholder="이용 매뉴얼 작성, 담당 기술조교 운영 방안 기술" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>운영 실적 및 활용 성과</label>
                    <textarea name="opPerformance" value={formData.opPerformance} onChange={handleInputChange} placeholder="현재까지 교육 지원 및 대외 연구 지원 건수 기입" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                </>
              )}

              {/* 용역용 입력 필드들 */}
              {modalType === "service" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>용역 명칭 (500만원 이상)</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="예: 앵커 산학 네트워크 포럼 기획 운영 대행 용역" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>추진 목적 (용역 요건)</label>
                    <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="해당 용역이 해결하고자 하는 문제 및 목표" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>수행기관 자격 (규모, 실적 이력)</label>
                    <textarea name="providerQual" value={formData.providerQual} onChange={handleInputChange} placeholder="입찰 자격 기준 (예: 연 매출 1억 이상, 동종 용역 이력 3건 이상)" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>사업비 계획액 (원)</label>
                      <input type="number" name="budgetPlan" value={formData.budgetPlan} onChange={handleInputChange} placeholder="예: 25000000" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>실제 집행액 (원)</label>
                      <input type="number" name="budgetSpent" value={formData.budgetSpent} onChange={handleInputChange} placeholder="예: 0" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>현재 행정 절차 단계</label>
                      <select name="step" value={formData.step} onChange={handleInputChange} style={{ width: "100%", padding: "0.5rem", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }}>
                        <option value={1}>1단계: 사업단 결재완료</option>
                        <option value={2}>2단계: 구매 발주 (총무팀 대행)</option>
                        <option value={3}>3단계: 준공 검수 완료</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>최종 운영 결과</label>
                    <textarea name="opResult" value={formData.opResult} onChange={handleInputChange} placeholder="검수 결과 및 산출물 내역 요약" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
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

    </div>
  );
}
