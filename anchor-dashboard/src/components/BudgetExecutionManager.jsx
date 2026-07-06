import React, { useState, useEffect } from "react";
import { Upload, AlertTriangle, CheckCircle2, TrendingUp, DollarSign, Calendar, FileText } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";

export default function BudgetExecutionManager({ projects, currentRole, selectedYear }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // 1) 조회 구분 및 단위과제 선택 상태 변수 정의
  const [viewType, setViewType] = useState("total"); // "total" (사업전체) vs "unit" (단위과제별)
  const [selectedUnit, setSelectedUnit] = useState("");

  // 2) 현재 선택된 연도에 따른 단위과제 리스트 정의
  const unitList = selectedYear === 1
    ? ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3", "D4"]
    : ["A1가", "A1나", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "D1", "D2", "D3"];

  // 연차 변경 시 선택된 단위과제 초기값 자동 동기화
  useEffect(() => {
    setSelectedUnit(unitList[0]);
  }, [selectedYear]);

  // 3) 사업전체 및 일부 단위과제용 하드코딩 지표 정의
  const executionDataMap = {
    total: {
      mainRate: "68.5%", carryoverRate: "92.0%",
      mainSpent: "58.40억 원", mainTotal: "85.20억 원",
      carryoverSpent: "8.95억 원", carryoverTotal: "9.73억 원",
      carryoverBalance: "0.78억 원",
      chartData: [
        { month: "3월", mainBudget: 5, carryoverBudget: 15 },
        { month: "4월", mainBudget: 12, carryoverBudget: 28 },
        { month: "5월", mainBudget: 22, carryoverBudget: 42 },
        { month: "6월", mainBudget: 35, carryoverBudget: 60 },
        { month: "7월", mainBudget: 48, carryoverBudget: 78 },
        { month: "8월", mainBudget: 58, carryoverBudget: 92 },
        { month: "9월", mainBudget: 68, carryoverBudget: 92 },
        { month: "10월", mainBudget: 74, carryoverBudget: 92 },
        { month: "11월", mainBudget: 80, carryoverBudget: 92 },
        { month: "12월", mainBudget: 85, carryoverBudget: 92 },
        { month: "1월", mainBudget: 89, carryoverBudget: 92 },
        { month: "2월", mainBudget: 95, carryoverBudget: 92 }
      ]
    },
    A1: {
      mainRate: "71.6%", carryoverRate: "0.0%",
      mainSpent: "21.32억 원", mainTotal: "29.78억 원",
      carryoverSpent: "0.00억 원", carryoverTotal: "0.00억 원",
      carryoverBalance: "0.00억 원",
      chartData: [
        { month: "3월", mainBudget: 8, carryoverBudget: 0 },
        { month: "4월", mainBudget: 15, carryoverBudget: 0 },
        { month: "5월", mainBudget: 25, carryoverBudget: 0 },
        { month: "6월", mainBudget: 38, carryoverBudget: 0 },
        { month: "7월", mainBudget: 52, carryoverBudget: 0 },
        { month: "8월", mainBudget: 62, carryoverBudget: 0 },
        { month: "9월", mainBudget: 71.6, carryoverBudget: 0 },
        { month: "10월", mainBudget: 71.6, carryoverBudget: 0 },
        { month: "11월", mainBudget: 71.6, carryoverBudget: 0 },
        { month: "12월", mainBudget: 71.6, carryoverBudget: 0 },
        { month: "1월", mainBudget: 71.6, carryoverBudget: 0 },
        { month: "2월", mainBudget: 71.6, carryoverBudget: 0 }
      ]
    },
    A1가: {
      mainRate: "73.2%", carryoverRate: "94.5%",
      mainSpent: "18.59억 원", mainTotal: "25.40억 원",
      carryoverSpent: "1.89억 원", carryoverTotal: "2.00억 원",
      carryoverBalance: "0.11억 원",
      chartData: [
        { month: "3월", mainBudget: 7, carryoverBudget: 20 },
        { month: "4월", mainBudget: 14, carryoverBudget: 35 },
        { month: "5월", mainBudget: 24, carryoverBudget: 50 },
        { month: "6월", mainBudget: 39, carryoverBudget: 70 },
        { month: "7월", mainBudget: 54, carryoverBudget: 88 },
        { month: "8월", mainBudget: 64, carryoverBudget: 94.5 },
        { month: "9월", mainBudget: 73.2, carryoverBudget: 94.5 },
        { month: "10월", mainBudget: 73.2, carryoverBudget: 94.5 },
        { month: "11월", mainBudget: 73.2, carryoverBudget: 94.5 },
        { month: "12월", mainBudget: 73.2, carryoverBudget: 94.5 },
        { month: "1월", mainBudget: 73.2, carryoverBudget: 94.5 },
        { month: "2월", mainBudget: 73.2, carryoverBudget: 94.5 }
      ]
    }
  };

  // 4) 동적 가상 데이터 생성기 (사용자가 임의의 단위과제를 선택 시, 고유 시드 기반 그래프 곡선 및 지표 연출)
  const getExecutionData = () => {
    if (viewType === "total") {
      return executionDataMap.total;
    }

    const targetUnit = selectedUnit || unitList[0];
    
    // 이미 사전에 정의된 데이터 맵이 있으면 바로 반환
    if (executionDataMap[targetUnit]) {
      return executionDataMap[targetUnit];
    }

    // 시드 연산 실행
    let seed = 0;
    for (let i = 0; i < targetUnit.length; i++) {
      seed += targetUnit.charCodeAt(i);
    }

    const baseMainRate = 50 + (seed % 35); // 50% ~ 85%
    const baseCarryRate = selectedYear === 1 ? 0 : 75 + (seed % 21); // 1차년도는 이월 없음, 2차년도는 75% ~ 96%
    
    const mainTotal = 3.5 + (seed % 12); // 3.5억 ~ 15.5억
    const mainSpent = (mainTotal * (baseMainRate / 100)).toFixed(2);
    
    const carryoverTotal = selectedYear === 1 ? 0 : 0.4 + (seed % 3) * 0.4; // 1차년도는 0, 2차년도는 0.4억 ~ 1.2억
    const carryoverSpent = (carryoverTotal * (baseCarryRate / 100)).toFixed(2);
    const carryoverBalance = (carryoverTotal - parseFloat(carryoverSpent)).toFixed(2);

    const chartData = [];
    for (let m = 3; m <= 14; m++) {
      const monthNum = m > 12 ? m - 12 : m;
      const monthLabel = `${monthNum}월`;

      const progressRatio = Math.min(1, (m - 2) / 10); // 3월 ~ 익년 2월 누적 비중

      const currentMain = Math.min(baseMainRate, Math.round(baseMainRate * progressRatio * (0.85 + (seed % 3) * 0.05)));
      const isPostAugust = m > 8; // 8월(8월=8, 9월=9...)
      const currentCarry = selectedYear === 1 
        ? 0 
        : (isPostAugust ? baseCarryRate : Math.round(baseCarryRate * Math.min(1, (m - 2) / 6)));

      chartData.push({
        month: monthLabel,
        mainBudget: currentMain,
        carryoverBudget: currentCarry
      });
    }

    return {
      mainRate: `${baseMainRate.toFixed(1)}%`,
      carryoverRate: `${baseCarryRate.toFixed(1)}%`,
      mainSpent: `${mainSpent}억 원`,
      mainTotal: `${mainTotal.toFixed(2)}억 원`,
      carryoverSpent: `${carryoverSpent}억 원`,
      carryoverTotal: `${carryoverTotal.toFixed(2)}억 원`,
      carryoverBalance: `${carryoverBalance}억 원`,
      chartData
    };
  };

  const activeData = getExecutionData();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
      triggerSuccessToast();
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      triggerSuccessToast();
    }
  };

  const triggerSuccessToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="budget-execution-container" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* 토스트 완료 알림 */}
      {showToast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: "#10B981",
          color: "white",
          padding: "1rem 1.5rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          zIndex: 1000,
          animation: "fadeIn 0.3s ease"
        }}>
          <CheckCircle2 size={20} />
          <span>집행률 엑셀 파일이 임시 가반영되었습니다! (세부 정산 연동 대기 중)</span>
        </div>
      )}

      {/* 헤더 섹션 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0, color: "var(--text-primary)" }}>
            {selectedYear}차년도 예산 집행률 관리
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>
            월별 집행현황 관리 및 본예산·이월예산 통합 정산 프레임워크
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem", borderRadius: "4px", background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA" }}>
            {selectedYear}차년도 운영 기준
          </span>
        </div>
      </div>

      {/* 2차년도 기준 1차년도 이월예산 8월 31일 한계점 경고 배너 */}
      <div style={{
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "8px",
        padding: "1rem 1.25rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem"
      }}>
        <AlertTriangle size={24} style={{ color: "#EF4444", flexShrink: 0, marginTop: "2px" }} />
        <div>
          <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#F87171" }}>
            [중요] 1차년도 이월예산 집행 기한 및 반납 원칙 안내
          </h4>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#FCA5A5", lineHeight: "1.4" }}>
            2차년도 운영 지침에 따라, 1차년도에서 이월된 예산은 **8월 31일까지만 집행이 유효하게 인정**되며, 해당 기한 이후 미집행된 잔액은 **전액 반납하는 것이 원칙**입니다. 기한 내에 이월 예산이 우선 집행될 수 있도록 각 단위과제 실무 부서(ECC센터, ICC, RCC 등)는 집행 일정을 특별 관리해 주시기 바랍니다.
          </p>
        </div>
      </div>

      {/* 본예산 vs 이월예산 핵심 지표 현황판 (activeData 연동) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        
        {/* 본예산 요약 */}
        <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              {viewType === "total" ? "[전체] " : `[${selectedUnit}] `}본예산 집행률 현황
            </span>
            <DollarSign size={20} style={{ color: "#3B82F6" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)" }}>{activeData.mainRate}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>(누적 {activeData.mainSpent} / 총 {activeData.mainTotal})</span>
          </div>
          {/* 가상 프로그레스 바 */}
          <div style={{ width: "100%", height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: activeData.mainRate, height: "100%", background: "#3B82F6", borderRadius: "4px" }}></div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#60A5FA" }}>ℹ️ 전체 12개월 중 현재 6개월(8월 말 기준) 누적 통계</span>
        </div>

        {/* 이월예산 요약 */}
        <div className="glass-card" style={{ 
          padding: "1.25rem", 
          borderRadius: "10px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "0.75rem",
          opacity: selectedYear === 1 ? 0.55 : 1, // 1차년도 비활성화 흐림 효과
          position: "relative"
        }}>
          {selectedYear === 1 && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.03)",
              borderRadius: "10px",
              pointerEvents: "none",
              zIndex: 2
            }} />
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              {viewType === "total" ? "[전체] " : `[${selectedUnit}] `}이월예산 집행률 현황 (8/31 마감)
            </span>
            <Calendar size={20} style={{ color: selectedYear === 1 ? "var(--text-secondary)" : "#EF4444" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: "800", color: selectedYear === 1 ? "var(--text-secondary)" : "#F87171" }}>
              {selectedYear === 1 ? "N/A" : activeData.carryoverRate}
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {selectedYear === 1 ? "(이월배정금 없음)" : `(누적 ${activeData.carryoverSpent} / 총 ${activeData.carryoverTotal})`}
            </span>
          </div>
          {/* 가상 프로그레스 바 */}
          <div style={{ width: "100%", height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: selectedYear === 1 ? "0%" : activeData.carryoverRate, height: "100%", background: "#EF4444", borderRadius: "4px" }}></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
            <span style={{ color: selectedYear === 1 ? "#ef4444" : "#FCA5A5", fontWeight: selectedYear === 1 ? "800" : "normal" }}>
              {selectedYear === 1 ? "💡 1차년도는 최초 협약 연도로서 이월예산이 존재하지 않습니다." : "⚠️ 8월 31일 기한 마감 완료"}
            </span>
            {selectedYear === 2 && <span style={{ color: "var(--text-secondary)" }}>잔액 반납 예정액: **{activeData.carryoverBalance}**</span>}
          </div>
        </div>

      </div>

      {/* 꺾은선 차트 카드 및 엑셀 수집 업로더 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        
        {/* 1. 월별 집행현황 꺾은선 차트 카드 (조회 필터 추가) */}
        <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={18} style={{ color: "var(--accent-color)" }} />
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)" }}>월별 누적 집행률 추이</h3>
            </div>
            
            {/* 💡 [조회 구분 변경 컨트롤러 장착] */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              
              {/* 사업전체 / 단위과제별 라디오 버튼 */}
              <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="executionViewType" 
                    value="total" 
                    checked={viewType === "total"}
                    onChange={() => setViewType("total")}
                    style={{ accentColor: "var(--accent-color)" }}
                  />
                  사업 전체
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="executionViewType" 
                    value="unit" 
                    checked={viewType === "unit"}
                    onChange={() => setViewType("unit")}
                    style={{ accentColor: "var(--accent-color)" }}
                  />
                  단위과제별
                </label>
              </div>

              {/* 단위과제 선택용 드롭다운 */}
              {viewType === "unit" && (
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  style={{
                    background: "var(--input-bg)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    outline: "none"
                  }}
                >
                  {unitList.map((unit) => (
                    <option key={unit} value={unit} style={{ background: "var(--background-card, #1e1e1e)", color: "var(--text-primary)" }}>
                      {unit} 과제
                    </option>
                  ))}
                </select>
              )}

            </div>
          </div>
          
          <div style={{ width: "100%", height: 320, padding: "0.5rem 0" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activeData.chartData}
                margin={{ top: 20, right: 30, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--text-secondary)" 
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                />
                <YAxis 
                  stroke="var(--text-secondary)" 
                  tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    background: "rgba(224, 235, 246, 0.95)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    fontSize: "11px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                  labelStyle={{ color: "#111827", fontWeight: "700", marginBottom: "0.2rem" }}
                  itemStyle={{ color: "#1f2937", padding: "0.1rem 0" }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                />
                <ReferenceLine 
                  x="8월" 
                  stroke="#EF4444" 
                  strokeDasharray="4 4" 
                  label={{ value: "이월마감 (8/31)", fill: "#F87171", position: "insideTopLeft", fontSize: 11, fontWeight: "bold" }}
                />
                <Line 
                  name="본예산 누적 집행률" 
                  type="monotone" 
                  dataKey="mainBudget" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  name="이월예산 누적 집행률" 
                  type="monotone" 
                  dataKey="carryoverBudget" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. 엑셀 파일 수집 업로더 카드 (프레임) */}
        <div 
          className="glass-card" 
          style={{ 
            padding: "1.5rem", 
            borderRadius: "10px", 
            border: dragActive ? "2px dashed var(--accent-color)" : "1px solid var(--border-color-dark)",
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center",
            alignItems: "center",
            gap: "1.25rem",
            textAlign: "center",
            minHeight: "320px",
            transition: "all 0.2s ease"
          }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div style={{ padding: "1.25rem", borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Upload size={32} style={{ color: "var(--accent-color)" }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
              월별 집행현황 엑셀 파일 수집
            </h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "280px", lineHeight: "1.4" }}>
              정산 엑셀 파일을 드래그 앤 드롭하거나 아래의 찾아보기 버튼을 눌러 선택해 주세요.
            </p>
          </div>

          <input 
            type="file" 
            id="budget-excel-file" 
            accept=".xlsx, .xls" 
            onChange={handleFileInput} 
            style={{ display: "none" }} 
          />
          <label 
            htmlFor="budget-excel-file" 
            className="btn btn-primary" 
            style={{ 
              padding: "0.5rem 1.25rem", 
              borderRadius: "5px", 
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.875rem",
              background: "var(--accent-color)",
              color: "white"
            }}
          >
            엑셀 파일 찾아보기
          </label>

          {uploadedFile && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--input-bg)", padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.8rem", color: "var(--text-primary)" }}>
              <FileText size={16} style={{ color: "#10B981" }} />
              <span>{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            * 업로드 형식: 대학 회계 월별 집행 현황 양식 (.xlsx)
          </div>
        </div>

      </div>

    </div>
  );
}
