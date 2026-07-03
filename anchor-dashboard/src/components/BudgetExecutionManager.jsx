import React, { useState } from "react";
import { Upload, AlertTriangle, CheckCircle2, TrendingUp, DollarSign, Calendar, FileText } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";

export default function BudgetExecutionManager({ projects, currentRole, selectedYear }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // 월별 가상 집행 추이 데이터 (3월 ~ 익년 2월)
  const monthlyData = [
    { month: "3월", mainBudget: 5, carryoverBudget: 15, iscarryoverValid: true },
    { month: "4월", mainBudget: 12, carryoverBudget: 28, iscarryoverValid: true },
    { month: "5월", mainBudget: 22, carryoverBudget: 42, iscarryoverValid: true },
    { month: "6월", mainBudget: 35, carryoverBudget: 60, iscarryoverValid: true },
    { month: "7월", mainBudget: 48, carryoverBudget: 78, iscarryoverValid: true },
    { month: "8월", mainBudget: 58, carryoverBudget: 92, iscarryoverValid: true, isLimitMonth: true }, // 8/31 한계선
    { month: "9월", mainBudget: 68, carryoverBudget: 92, carryoverReturned: true }, // 반납 처리
    { month: "10월", mainBudget: 74, carryoverBudget: 92 },
    { month: "11월", mainBudget: 80, carryoverBudget: 92 },
    { month: "12월", mainBudget: 85, carryoverBudget: 92 },
    { month: "1월", mainBudget: 89, carryoverBudget: 92 },
    { month: "2월", mainBudget: 95, carryoverBudget: 92 }
  ];

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
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0, color: "var(--text-primary-dark)" }}>
            {selectedYear}차년도 예산 집행률 관리
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary-dark)", margin: "0.25rem 0 0 0" }}>
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

      {/* 본예산 vs 이월예산 핵심 지표 현황판 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        
        {/* 본예산 요약 */}
        <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", display: "flex", flexDirection: "column", gap: "0.75rem", border: "1px solid var(--border-color-dark)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary-dark)", fontWeight: "600" }}>본예산 집행률 현황</span>
            <DollarSign size={20} style={{ color: "#3B82F6" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary-dark)" }}>68.5%</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)" }}>(누적 58.40억 원 / 총 85.20억 원)</span>
          </div>
          {/* 가상 프로그레스 바 */}
          <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: "68.5%", height: "100%", background: "#3B82F6", borderRadius: "4px" }}></div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#60A5FA" }}>ℹ️ 전체 12개월 중 현재 6개월(8월 말 기준) 누적 통계</span>
        </div>

        {/* 이월예산 요약 */}
        <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", display: "flex", flexDirection: "column", gap: "0.75rem", border: "1px solid var(--border-color-dark)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary-dark)", fontWeight: "600" }}>이월예산 집행률 현황 (8/31 마감)</span>
            <Calendar size={20} style={{ color: "#EF4444" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: "800", color: "#F87171" }}>92.0%</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)" }}>(누적 8.95억 원 / 총 9.73억 원)</span>
          </div>
          {/* 가상 프로그레스 바 */}
          <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: "92%", height: "100%", background: "#EF4444", borderRadius: "4px" }}></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
            <span style={{ color: "#FCA5A5" }}>⚠️ 8월 31일 기한 마감 완료</span>
            <span style={{ color: "var(--text-secondary-dark)" }}>잔액 반납 예정액: **0.78억 원**</span>
          </div>
        </div>

      </div>

      {/* 엑셀 업로드 시뮬레이션 카드 및 월별 누적 추이 표 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        
        {/* 1. 월별 집행현황 데이터 테이블 (프레임) */}
        <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--bg-card-dark)", border: "1px solid var(--border-color-dark)", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "var(--text-primary-dark)" }}>월별 누적 집행률 추이 (본예산 vs 이월예산)</h3>
            <TrendingUp size={18} style={{ color: "var(--accent-color)" }} />
          </div>
          
          <div style={{ width: "100%", height: 320, padding: "0.5rem 0" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--text-secondary-dark)" 
                  tick={{ fontSize: 11, fill: "var(--text-secondary-dark)" }}
                />
                <YAxis 
                  stroke="var(--text-secondary-dark)" 
                  tick={{ fontSize: 11, fill: "var(--text-secondary-dark)" }}
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
          className="card" 
          style={{ 
            padding: "1.5rem", 
            borderRadius: "10px", 
            background: "var(--bg-card-dark)", 
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
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary-dark)" }}>
              월별 집행현황 엑셀 파일 수집
            </h3>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary-dark)", maxWidth: "280px", lineHeight: "1.4" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.8rem", color: "var(--text-primary-dark)" }}>
              <FileText size={16} style={{ color: "#10B981" }} />
              <span>{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)" }}>
            * 업로드 형식: 대학 회계 월별 집행 현황 양식 (.xlsx)
          </div>
        </div>

      </div>

    </div>
  );
}
