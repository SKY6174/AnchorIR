import React, { useState } from "react";
import { 
  Building2, Laptop, ShieldCheck, Plus, CheckCircle, 
  MapPin, Landmark, DollarSign, Calendar, Info, 
  Eye, FileText, FileImage, LayoutGrid, ListFilter, Trash2
} from "lucide-react";

// 단장님이 지시하신 10개 필드로 구성되고 '26.3월 ~ '27.2월 12개월 체크가 적용된 초기 기자재 품목 데이터셋
const defaultEquipments = [
  { id: 1, unit: "A1", seq: 1, deptName: "간호학과", divisionName: "공동기자재지원센터", itemName: "임상 시뮬레이터 스마트 실습 베드", unitPrice: 12000000, quantity: 2, description: "간호학 임상 실습 고도화 교육 환경 인프라 조달", operation: "교과목(정규)", mgrDept: "ECC", scheduleMilestones: { "기획": ["3", "4"], "승인": ["4", "5"], "구매": ["6", "7", "8"], "검수": ["9", "10"] } },
  { id: 2, unit: "A2", seq: 2, deptName: "화학공학과", divisionName: "", itemName: "고정밀 가스 크로마토그래피 측정기", unitPrice: 24500000, quantity: 1, description: "화공 정밀 분석 및 대외 기업 애로기술 분석 지원용", operation: "교과목(비정규)", mgrDept: "ICC", scheduleMilestones: { "기획": ["3"], "승인": ["4"], "구매": ["5", "6"], "검수": ["7", "8"] } },
  { id: 3, unit: "B1", seq: 3, deptName: "컴퓨터공학과", divisionName: "원격교육지원센터", itemName: "가상현실/메타버스 전용 GPU 렌더링 서버", unitPrice: 15000000, quantity: 3, description: "신기술 가상현실 융합인재양성 교육 장비 구축", operation: "교과목(정규)", mgrDept: "신산업", scheduleMilestones: { "기획": ["4", "5"], "승인": ["6"], "구매": ["7", "8"], "검수": ["9"] } },
  { id: 4, unit: "B2", seq: 4, deptName: "기계공학과", divisionName: "", itemName: "3D 메탈 프린터 조달", unitPrice: 38000000, quantity: 1, description: "지산학 스마트 제조 부품 시제품 제작 지원 인프라", operation: "교과목(정규)", mgrDept: "ICC", scheduleMilestones: { "기획": ["3", "4"], "승인": ["5"], "구매": ["6", "7"], "검수": ["8", "9"] } },
  { id: 5, unit: "B3", seq: 5, deptName: "전기전자공학과", divisionName: "공동기자재지원센터", itemName: "반도체 회로 분석 계측기 (Oscilloscope)", unitPrice: 8500000, quantity: 4, description: "반도체 인력양성 실습용 고가 계측 장비 확충", operation: "교과목(비정규)", mgrDept: "AIDX", scheduleMilestones: { "기획": ["3", "4"], "승인": ["5", "6"], "구매": ["7", "8", "9"], "검수": ["10", "11", "12"] } },
  { id: 6, unit: "B4", seq: 6, deptName: "", divisionName: "늘봄누리센터", itemName: "늘봄 교실용 스마트 대화형 교육 패드", unitPrice: 850000, quantity: 15, description: "대학 기자재 활용형 아동 늘봄교육 교재 조달", operation: "교과목(비정규)", mgrDept: "늘봄", scheduleMilestones: { "기획": ["5", "6"], "승인": ["7"], "구매": ["8", "9"], "검수": ["10", "11"] } },
  { id: 7, unit: "C1", seq: 7, deptName: "스마트팩토리전공", divisionName: "", itemName: "다축 협동 산업용 로봇 팔 암 (Robot Arm)", unitPrice: 28000000, quantity: 1, description: "로봇제어 전공 정규 실험실습 공간 인프라 구축", operation: "교과목(정규)", mgrDept: "AIDX", scheduleMilestones: { "기획": ["3", "4"], "승인": ["4", "5"], "구매": ["6", "7"], "검수": ["8", "9", "10"] } },
  { id: 8, unit: "C2", seq: 8, deptName: "반려동물보건과", divisionName: "", itemName: "동물 전용 디지털 초음파 진단 장치", unitPrice: 19000000, quantity: 1, description: "신설학과 실무 미러형 임상 실습실 조달 품목", operation: "교과목(정규)", mgrDept: "신산업", scheduleMilestones: { "기획": ["4", "5"], "승인": ["6"], "구매": ["7", "8"], "검수": ["9"] } },
  { id: 9, unit: "D1", seq: 9, deptName: "스마트선박학과", divisionName: "", itemName: "미래 친환경선박 가상 운항 교육 시뮬레이터", unitPrice: 45000000, quantity: 1, description: "5극3특 가상 운항 실습 교육 과정 지원용 장비", operation: "교과목(정규)", mgrDept: "RCC", scheduleMilestones: { "기획": ["3", "4", "5"], "승인": ["6", "7"], "구매": ["8", "9", "10"], "검수": ["11", "12", "1", "2"] } },
  { id: 10, unit: "D2", seq: 10, deptName: "미용예술학과", divisionName: "", itemName: "메디컬 스킨케어 다기능 뷰티 디바이스", unitPrice: 6500000, quantity: 5, description: "웰니스 뷰티 케어 실습 및 지역 상생 뷰티 아카데미 활용", operation: "교과목(비정규)", mgrDept: "RCC", scheduleMilestones: { "기획": ["3", "4"], "승인": ["5"], "구매": ["6", "7"], "검수": ["8", "9"] } }
];

export default function ProcurementManager({
  currentRole,
  selectedYear,
  subTab,
  onChangeSubTab,
  envData = [],
  setEnvData,
  equipData = [],
  setEquipData,
  serviceData = [],
  setServiceData
}) {
  // 모달 제어 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState("env"); // "env", "equip", "service"
  
  // 환경개선 상세 팝업 상태
  const [selectedEnvItem, setSelectedEnvItem] = useState(null);

  // 기자재 탭 단위과제 필터 상태 (전체 과제 보기를 위해 "ALL" 옵션도 기본 지원)
  const [selectedEquipUnit, setSelectedEquipUnit] = useState("ALL");

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
    operation: "교과목(정규)",
    mgrDept: "ECC",
    // 용역용
    providerQual: "",
    opResult: ""
  });

  // 월별 마일스톤 체크 클릭 토글 함수
  const handleMilestoneToggle = (equipId, stepName, month) => {
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }
    const activeEquipList = equipData.length > 0 ? equipData : defaultEquipments;
    const updated = activeEquipList.map(e => {
      if (e.id === equipId) {
        const currentMilestones = e.scheduleMilestones || { "기획": [], "승인": [], "구매": [], "검수": [] };
        const currentMonths = currentMilestones[stepName] || [];
        
        let nextMonths;
        if (currentMonths.includes(month)) {
          nextMonths = currentMonths.filter(m => m !== month);
        } else {
          nextMonths = [...currentMonths, month];
        }
        
        return {
          ...e,
          scheduleMilestones: {
            ...currentMilestones,
            [stepName]: nextMonths
          }
        };
      }
      return e;
    });
    setEquipData(updated);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }

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
      // 단장님 조건: 학과 또는 부서 중 최소 하나는 반드시 선택되어야 함
      if (!formData.deptName && !formData.divisionName) {
        alert("⚠️ 학과 또는 부서 중 최소 한 곳은 반드시 지정하셔야 합니다.");
        return;
      }

      // 실 기자재 데이터가 비어 있으면 defaultEquipments를 얹고 시작
      const activeEquipList = equipData.length > 0 ? equipData : defaultEquipments;
      const nextSeq = activeEquipList.length + 1;
      
      const newItem = {
        id: Date.now(),
        unit: formData.unit,
        seq: nextSeq,
        deptName: formData.deptName || "",
        divisionName: formData.divisionName || "",
        itemName: formData.name || "새 기자재 항목",
        unitPrice: Number(formData.unitPrice) || 0,
        quantity: Number(formData.quantity) || 1,
        description: formData.description || "-",
        operation: formData.operation || "교과목(정규)",
        mgrDept: formData.mgrDept || "ECC",
        scheduleMilestones: {
          "기획": formData.step === "기획" ? ["3"] : [],
          "승인": formData.step === "승인" ? ["3"] : [],
          "구매": formData.step === "구매" ? ["3"] : [],
          "검수": formData.step === "검수" ? ["3"] : []
        }
      };
      setEquipData([...activeEquipList, newItem]);
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
      department: "",
      unitPrice: "",
      quantity: "",
      description: "",
      step: "기획",
      operation: "교과목(정규)",
      mgrDept: "ECC",
      providerQual: "",
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
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                🛠️ 교육환경 개선 사업 관리
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                안전하고 현대적인 실습실 인프라 및 교육환경 구축 관리 1차 정리 대장
              </p>
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
                새 환경개선 건 등록
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem" }}>
            
            {/* 왼쪽: 리스트 프레임 */}
            <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px" }}>
              <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
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
                      background: selectedEnvItem?.id === item.id ? "rgba(59, 130, 246, 0.15)" : "var(--background-card, rgba(255,255,255,0.01))",
                      border: selectedEnvItem?.id === item.id ? "1px solid var(--accent-color)" : "1px solid var(--border-color, rgba(255,255,255,0.05))",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                      <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA", fontWeight: "700" }}>
                        {item.unit} 과제
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        예산: {(item.budgetPlan / 10000).toLocaleString()}만 원
                      </span>
                    </div>
                    <h5 style={{ margin: "0.5rem 0 0.5rem 0", fontSize: "0.9rem", fontWeight: "700", color: "var(--text-primary)", lineHeight: "1.3" }}>
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
            <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px" }}>
              <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                🔍 구축 상세 명세서
              </h4>
              {selectedEnvItem ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                  
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>사업 건명</span>
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
                  <div style={{ border: "1px dashed var(--border-color-dark)", borderRadius: "6px", padding: "0.75rem", background: "var(--background-card, rgba(0,0,0,0.1))" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>🎨 조감도 및 설계도 모형</span>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
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
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>향후 활용 계획</span>
                    <p style={{ margin: "0.2rem 0", lineHeight: "1.3" }}>{selectedEnvItem.utilization}</p>
                  </div>

                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center" }}>
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
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                🔬 기자재 구입 및 운영 현황
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
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
                  className="user-selector"
                  style={{
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "auto"
                  }}
                >
                  <option value="ALL">전체 과제</option>
                  {["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                    <option key={u} value={u}>{u} 과제</option>
                  ))}
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
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", color: "var(--text-primary)", minWidth: "1080px" }}>
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "45px" }}>순번</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "55px" }}>과제</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontWeight: "800", width: "120px" }}>학과 / 부서</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontWeight: "800", width: "180px" }}>품명</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: "800", width: "90px" }}>단가</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "50px" }}>수량</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: "800", width: "100px" }}>견적총액</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "left", fontWeight: "800" }}>관련내용</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "290px" }}>구매단계 ('26.3월 ~ '27.2월 월별 체크)</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "100px" }}>운영</th>
                  {currentRole.id !== "GUEST" && (
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "800", width: "45px" }}>작업</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const activeEquipList = equipData.length > 0 ? equipData : defaultEquipments;
                  const filteredEquips = selectedEquipUnit === "ALL" 
                    ? activeEquipList 
                    : activeEquipList.filter(e => e.unit === selectedEquipUnit);

                  if (filteredEquips.length > 0) {
                    return filteredEquips.map((equip, idx) => {
                      const price = Number(equip.unitPrice) || 0;
                      const qty = Number(equip.quantity) || 0;
                      const total = price * qty;

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
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "left", fontWeight: "600" }}>
                            {(() => {
                              const dName = equip.deptName || "";
                              const divName = equip.divisionName || "";
                              if (dName && divName) {
                                return `${dName} / ${divName}`;
                              }
                              return dName || divName || "-";
                            })()}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "left", fontWeight: "700", color: "white" }}>
                            {equip.itemName || equip.name || "-"}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "right", color: "var(--text-secondary)" }}>
                            {price.toLocaleString()}원
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", fontWeight: "600" }}>
                            {qty}
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "right", fontWeight: "700", color: "#10B981" }}>
                            {total.toLocaleString()}원
                          </td>
                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "left", color: "var(--text-secondary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={equip.description || equip.opPlan}>
                            {equip.description || equip.opPlan || "-"}
                          </td>
                          
                          {/* 12개월 타임라인 Gantt 마일스톤 멀티 체크 그리드 */}
                          <td style={{ padding: "0.4rem 0.5rem", textAlign: "left", width: "290px", borderLeft: "1px solid rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.03)" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                              {["기획", "승인", "구매", "검수"].map((stepName) => {
                                let activeColor = "#f59e0b"; // 기획: 주황
                                if (stepName === "승인") activeColor = "#3b82f6"; // 승인: 파랑
                                if (stepName === "구매") activeColor = "#a78bfa"; // 구매: 보라
                                if (stepName === "검수") activeColor = "#10b981"; // 검수: 초록

                                const milestoneMonths = equip.scheduleMilestones?.[stepName] || [];

                                return (
                                  <div key={stepName} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ fontSize: "0.68rem", fontWeight: "800", width: "22px", color: "var(--text-secondary-dark)", display: "inline-block", textAlign: "left" }}>
                                      {stepName}
                                    </span>
                                    <div style={{ display: "flex", gap: "2px" }}>
                                      {["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2"].map((m) => {
                                        const isChecked = milestoneMonths.includes(m);
                                        return (
                                          <div
                                            key={m}
                                            onClick={() => handleMilestoneToggle(equip.id, stepName, m)}
                                            style={{
                                              width: "16px",
                                              height: "16px",
                                              borderRadius: "3px",
                                              fontSize: "0.55rem",
                                              fontWeight: "800",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              cursor: "pointer",
                                              transition: "all 0.1s ease",
                                              background: isChecked ? activeColor : "rgba(255,255,255,0.02)",
                                              color: isChecked ? "white" : "rgba(255,255,255,0.15)",
                                              border: isChecked ? `1px solid ${activeColor}` : "1px solid rgba(255,255,255,0.05)",
                                              boxShadow: isChecked ? `0 0 3px ${activeColor}60` : "none"
                                            }}
                                            title={`'26.${m}월 ${stepName} 단계`}
                                          >
                                            {m}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>

                          <td style={{ padding: "0.8rem 0.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                            {equip.operation || "-"}
                          </td>
                          {currentRole.id !== "GUEST" && (
                            <td style={{ padding: "0.8rem 0.5rem", textAlign: "center" }}>
                              <button
                                onClick={() => {
                                  if (confirm("해당 기자재 항목을 삭제하시겠습니까?")) {
                                    setEquipData(activeEquipList.filter(e => e.id !== equip.id));
                                  }
                                }}
                                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", transition: "color 0.15s" }}
                                onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"}
                                onMouseOut={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
                                title="삭제"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    });
                  } else {
                    return (
                      <tr>
                        <td colSpan={currentRole.id !== "GUEST" ? 12 : 11} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                          <Laptop size={36} style={{ marginBottom: "0.75rem", opacity: 0.3, display: "inline-block" }} />
                          <p style={{ margin: 0 }}>선택하신 {selectedEquipUnit === "ALL" ? "전체" : `${selectedEquipUnit} 과제`}에 등록된 기자재 내역이 없습니다.</p>
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
          
          {/* 주요 용역 상단 카드 */}
          <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
                📑 500만원 이상 주요 용역 관리 대장
              </h3>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                기획 결재부터 입찰/발주 및 최종 검수 완료까지의 전 과정 트래킹 프레임
              </p>
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
                새 주요 용역 건 등록
              </button>
            )}
          </div>

          {/* 용역 리스트 뷰 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {serviceData.map((service) => (
              <div 
                key={service.id} 
                className="glass-card" 
                style={{ 
                  padding: "1.5rem", 
                  borderRadius: "10px", 
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem"
                }}
              >
                {/* 상단 명칭 및 예산 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", maxWidth: "70%" }}>
                    {service.title}
                  </h4>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block" }}>예산 (계획 / 실제집행)</span>
                    <strong style={{ color: "#60A5FA", fontSize: "1rem" }}>
                      {(service.budgetPlan / 10000).toLocaleString()}만 원
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}> / </span>
                    <strong style={{ color: "#34D399", fontSize: "1rem" }}>
                      {(service.budgetSpent / 10000).toLocaleString()}만 원
                    </strong>
                  </div>
                </div>

                {/* 중간 세부 내용 */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div>
                      <strong style={{ color: "var(--text-secondary)" }}>🎯 추진 목적 (용역 요건):</strong>
                      <p style={{ margin: "0.2rem 0 0 0", lineHeight: "1.4" }}>{service.purpose}</p>
                    </div>
                    <div style={{ marginTop: "0.25rem" }}>
                      <strong style={{ color: "var(--text-secondary)" }}>🏢 수행 기관 자격 요건:</strong>
                      <p style={{ margin: "0.2rem 0 0 0", lineHeight: "1.4" }}>{service.providerQual}</p>
                    </div>
                  </div>

                  <div style={{ background: "var(--border-color)", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <strong style={{ color: "#34D399", fontSize: "0.75rem" }}>📈 최종 운영 결과 기술</strong>
                    <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: "1.4" }}>{service.opResult || "결과 정산 및 분석 보고서 검토 중..."}</p>
                  </div>
                </div>

                {/* 💡 하단 추진일정 진행 경과 스텝퍼 (Stepper) 시각화 */}
                <div style={{ background: "var(--background-card, rgba(0,0,0,0.05))", borderRadius: "8px", padding: "1rem", marginTop: "0.25rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.5rem" }}>
                    🔄 구매 용역 행정 추진 일정 단계 현황
                  </span>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                    
                    {/* 가로 선 피팅 */}
                    <div style={{ position: "absolute", left: "10%", right: "10%", top: "45%", height: "2px", background: "var(--border-color)", zIndex: 1 }}>
                      <div style={{ width: service.step === 1 ? "0%" : service.step === 2 ? "50%" : "100%", height: "100%", background: "var(--accent-color)", transition: "all 0.3s ease" }}></div>
                    </div>

                    {/* Step 1 */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, width: "30%" }}>
                      <div style={{
                        width: "24px", height: "24px", borderRadius: "50%",
                        background: service.step >= 1 ? "var(--accent-color)" : "var(--border-color)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: "700", color: "white"
                      }}>
                        {service.step >= 1 ? <CheckCircle size={14} /> : "1"}
                      </div>
                      <span style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: service.step >= 1 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: "600" }}>
                        사업단 기획 및 결재 완료
                      </span>
                    </div>

                    {/* Step 2 */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, width: "30%" }}>
                      <div style={{
                        width: "24px", height: "24px", borderRadius: "50%",
                        background: service.step >= 2 ? "var(--accent-color)" : "var(--border-color)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: "700", color: "white"
                      }}>
                        {service.step >= 2 ? <CheckCircle size={14} /> : "2"}
                      </div>
                      <span style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: service.step >= 2 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: "600" }}>
                        구매 발주 (총무팀 대행)
                      </span>
                    </div>

                    {/* Step 3 */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, width: "30%" }}>
                      <div style={{
                        width: "24px", height: "24px", borderRadius: "50%",
                        background: service.step >= 3 ? "var(--accent-color)" : "var(--border-color)",
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
                    className="user-selector"
                  >
                    {["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"].map(u => (
                      <option key={u} value={u}>{u} 과제</option>
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
                        <option value="간호학과">간호학과</option>
                        <option value="화학공학과">화학공학과</option>
                        <option value="컴퓨터공학과">컴퓨터공학과</option>
                        <option value="기계공학과">기계공학과</option>
                        <option value="전기전자공학과">전기전자공학과</option>
                        <option value="유아교육과">유아교육과</option>
                        <option value="스마트팩토리전공">스마트팩토리전공</option>
                        <option value="반려동물보건과">반려동물보건과</option>
                        <option value="스마트선박학과">스마트선박학과</option>
                        <option value="미용예술학과">미용예술학과</option>
                        <option value="물리치료학과">물리치료학과</option>
                        <option value="호텔조리제빵과">호텔조리제빵과</option>
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
                        <option value="공동기자재지원센터">공동기자재지원센터</option>
                        <option value="산학협력단">산학협력단</option>
                        <option value="LINC3.0사업단">LINC3.0사업단</option>
                        <option value="RISE사업센터">RISE사업센터</option>
                        <option value="늘봄누리센터">늘봄누리센터</option>
                        <option value="신산업역량강화지원센터">신산업역량강화지원센터</option>
                        <option value="학생직무체험지원센터">학생직무체험지원센터</option>
                        <option value="국제교류원">국제교류원</option>
                        <option value="원격교육지원센터">원격교육지원센터</option>
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>단가 (원)</label>
                      <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleInputChange} required placeholder="예: 12000000" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>수량</label>
                      <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required placeholder="예: 2" style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련내용</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required placeholder="기자재의 사용 목적 및 핵심 구입 연계 사유 기술" style={{ width: "100%", height: "60px", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", borderRadius: "6px", color: "white", resize: "none" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>구매단계</label>
                      <select name="step" value={formData.step} onChange={handleInputChange} className="user-selector">
                        <option value="기획">기획</option>
                        <option value="승인">승인</option>
                        <option value="구매">구매</option>
                        <option value="검수">검수</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>운영 구분</label>
                      <select name="operation" value={formData.operation} onChange={handleInputChange} className="user-selector">
                        <option value="교과목(정규)">교과목(정규)</option>
                        <option value="교과목(비정규)">교과목(비정규)</option>
                      </select>
                    </div>
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
