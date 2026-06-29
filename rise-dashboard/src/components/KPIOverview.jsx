import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { TrendingUp, Activity, Award, Landmark } from "lucide-react";

// 백만원 단위 포맷팅 헬퍼 함수
const formatToMillionWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return Math.round(value / 1000000).toLocaleString();
};

export default function KPIOverview({ projects, currentRole, selectedYear = 2 }) {
  // 예산 합계 및 재원 구분 계산
  const totalBudgetMain = projects.reduce((sum, p) => {
    return sum + p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.budget_main || 0), 0);
  }, 0);
  const totalSpentMain = projects.reduce((sum, p) => {
    return sum + p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.spent_main || 0), 0);
  }, 0);
  const rateMain = totalBudgetMain > 0 ? (totalSpentMain / totalBudgetMain) * 100 : 0;

  const totalBudgetCarry = projects.reduce((sum, p) => {
    return sum + p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.budget_carry || 0), 0);
  }, 0);
  const totalSpentCarry = projects.reduce((sum, p) => {
    return sum + p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.spent_carry || 0), 0);
  }, 0);
  const rateCarry = totalBudgetCarry > 0 ? (totalSpentCarry / totalBudgetCarry) * 100 : 0;

  const totalBudget = totalBudgetMain + totalBudgetCarry;
  const totalSpent = totalSpentMain + totalSpentCarry;

  // A-1-나 신산업특화 예산 동적 추출 및 본사업비(A-1-나 제외) 계산
  let shinSanUpBudget = 0;
  projects.forEach((p) => {
    p.units.forEach((u) => {
      if (u.id === "A-1-나") {
        shinSanUpBudget = u.years?.[selectedYear]?.budget_main || 0;
      }
    });
  });
  const bonBudgetMain = Math.max(0, totalBudgetMain - shinSanUpBudget);

  // 전체 KPI 달성률 계산
  let kpiCount = 0;
  let totalKpiAchievement = 0;
  projects.forEach((p) => {
    p.units.forEach((u) => {
      u.kpis.forEach((k) => {
        kpiCount++;
        let ach = 0;
        if (k.subItems && k.subItems.length > 0) {
          let sumSub = 0;
          k.subItems.forEach((sub) => {
            const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
            sumSub += yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
          });
          ach = sumSub / k.subItems.length;
        } else {
          ach = k.target > 0 ? (k.current / k.target) * 100 : 0;
        }
        totalKpiAchievement += Math.min(ach, 120); // 최대 120% 제한
      });
    });
  });
  const avgKpiAchievement = kpiCount > 0 ? totalKpiAchievement / kpiCount : 0;

  // 차트 데이터 (프로젝트 및 공통영역 분할)
  const chartData = projects.map((p) => {
    const pBudgetMain = p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.budget_main || 0), 0);
    const pSpentMain = p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.spent_main || 0), 0);
    const pBudgetCarry = p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.budget_carry || 0), 0);
    const pSpentCarry = p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.spent_carry || 0), 0);

    return {
      name: p.id === "E" ? "공통경비" : p.title.split(":")[0],
      "본예산": Math.round(pBudgetMain / 1000000),
      "본집행": Math.round(pSpentMain / 1000000),
      "이월예산": Math.round(pBudgetCarry / 1000000),
      "이월집행": Math.round(pSpentCarry / 1000000)
    };
  });

  const pieData = projects.map((p) => {
    const pBudgetMain = p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.budget_main || 0), 0);
    const pBudgetCarry = p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.budget_carry || 0), 0);
    return {
      name: p.id === "E" ? "공통경비" : p.title.split(":")[0],
      value: Math.round((pBudgetMain + pBudgetCarry) / 1000000)
    };
  });

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  return (
    <div>
      {/* 4대 핵심 요약 카드 (재원별 분리 반영) */}
      <div className="kpi-grid">
        <div className="glass-card">
          <div className="kpi-header">
            <span>ANCHOR {selectedYear}차년도 총 예산</span>
            <TrendingUp size={16} className="badge-blue" />
          </div>
          <div className="kpi-value" style={{ color: "var(--accent-color)", fontSize: "1.45rem" }}>
            {formatToMillionWon(totalBudget)} 백만원
          </div>
          <div className="kpi-subtext" style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.75rem", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>본사업비: {formatToMillionWon(bonBudgetMain)}백만원</span>
              <span>신산업특화: {formatToMillionWon(shinSanUpBudget)}백만원</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.2rem", marginTop: "0.1rem" }}>
              <span>본예산 계: {formatToMillionWon(totalBudgetMain)}백만원</span>
              <span>이월비: {formatToMillionWon(totalBudgetCarry)}백만원</span>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span>{selectedYear}차년도 본사업비 집행</span>
            <Activity size={16} className="badge-green" />
          </div>
          <div className="kpi-value" style={{ color: "var(--success-color)", fontSize: "1.45rem" }}>
            {formatToMillionWon(totalSpentMain)} 백만원
          </div>
          <div className="kpi-subtext">집행률: {rateMain.toFixed(1)}% (배정: {formatToMillionWon(totalBudgetMain)}백만원)</div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span>{selectedYear}차년도 이월사업비 집행</span>
            <TrendingUp size={16} className="badge-yellow" />
          </div>
          <div className="kpi-value" style={{ color: "var(--warning-color)", fontSize: "1.45rem" }}>
            {formatToMillionWon(totalSpentCarry)} 백만원
          </div>
          <div className="kpi-subtext">집행률: {rateCarry.toFixed(1)}% (배정: {formatToMillionWon(totalBudgetCarry)}백만원)</div>
        </div>

        <div className="glass-card">
          <div className="kpi-header">
            <span>성과지표 달성도 (KPI)</span>
            <Award size={16} style={{ color: "#ec4899" }} />
          </div>
          <div className="kpi-value" style={{ color: "#ec4899" }}>
            {avgKpiAchievement.toFixed(1)}%
          </div>
          <div className="kpi-subtext">{selectedYear}차년도 성과목표 종합 가속화</div>
        </div>
      </div>

      {/* 차트 시각화 섹션 */}
      <div className="vis-panel">
        {/* 프로젝트별 재원 집행 2중 막대 그래프 */}
        <div className="glass-card" style={{ minHeight: "380px" }}>
          <h3 style={{ marginBottom: "1.2rem", fontSize: "1.1rem", fontWeight: "800" }}>
            프로젝트별 재원 배정 및 누적 집행 현황 (단위: 백만원)
          </h3>
          <div style={{ width: "100%", height: "280px" }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="var(--text-secondary-dark)" fontSize={10} />
                <YAxis stroke="var(--text-secondary-dark)" fontSize={10} />
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} 백만원`}
                  contentStyle={{
                    background: "rgba(24, 24, 27, 0.9)",
                    border: "1px solid var(--border-color-dark)",
                    borderRadius: "0.5rem",
                    color: "white"
                  }}
                />
                <Legend verticalAlign="top" height={36} fontSize={11} />
                <Bar dataKey="본예산" fill="#1e3a8a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="본집행" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="이월예산" fill="#064e3b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="이월집행" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 예산 분배 비율 */}
        <div className="glass-card" style={{ minHeight: "380px" }}>
          <h3 style={{ marginBottom: "1.2rem", fontSize: "1.1rem", fontWeight: "800" }}>
            재원 배분 구조 (공통경비 포함)
          </h3>
          <div style={{ width: "100%", height: "240px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} 백만원`}
                  contentStyle={{
                    background: "rgba(24, 24, 27, 0.9)",
                    border: "1px solid var(--border-color-dark)",
                    borderRadius: "0.5rem",
                    color: "white"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.4rem", marginTop: "0.5rem", fontSize: "0.75rem" }}>
            {pieData.map((item, index) => {
              const totalBudgetInMillion = totalBudget / 1000000;
              return (
                <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[index] }} />
                    <span style={{ color: "var(--text-secondary-dark)" }}>{item.name}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>
                    {totalBudgetInMillion > 0 ? ((item.value / totalBudgetInMillion) * 100).toFixed(1) : "0.0"}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
