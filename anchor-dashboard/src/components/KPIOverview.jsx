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

// 백만원 단위 포맷팅 헬퍼 함수 (소수점 첫째자리까지 표현)
const formatToMillionWon = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0.0";
  return (value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// 도넛 차트 조각 옆에 지시선과 함께 이름(비율%) 라벨을 그리기 위한 커스텀 SVG 렌더러
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const pctString = (percent * 100).toFixed(1);

  return (
    <text
      x={x}
      y={y}
      fill="var(--text-primary-dark)"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="10px"
      fontWeight="700"
    >
      {`${name} (${pctString}%)`}
    </text>
  );
};

export default function KPIOverview({ projects, currentRole, selectedYear = 2 }) {
  // 1차년도에는 공통경비(프로젝트 ID: E)가 존재하지 않으므로 필터링 처리
  const activeProjects = selectedYear === 1 
    ? projects.filter((p) => p.id !== "E") 
    : projects;

  // 예산 합계 및 재원 구분 계산
  const totalBudgetMain = activeProjects.reduce((sum, p) => {
    return sum + p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.budget_main || 0), 0);
  }, 0);
  const totalSpentMain = activeProjects.reduce((sum, p) => {
    return sum + p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.spent_main || 0), 0);
  }, 0);
  const rateMain = totalBudgetMain > 0 ? (totalSpentMain / totalBudgetMain) * 100 : 0;

  const totalBudgetCarry = selectedYear === 1 ? 0 : activeProjects.reduce((sum, p) => {
    return sum + p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.budget_carry || 0), 0);
  }, 0);
  const totalSpentCarry = selectedYear === 1 ? 0 : activeProjects.reduce((sum, p) => {
    return sum + p.units.reduce((s, u) => s + (u.years?.[selectedYear]?.spent_carry || 0), 0);
  }, 0);
  const rateCarry = totalBudgetCarry > 0 ? (totalSpentCarry / totalBudgetCarry) * 100 : 0;

  const totalBudget = totalBudgetMain + totalBudgetCarry;
  const totalSpent = totalSpentMain + totalSpentCarry;

  // A1나 신산업특화 예산 동적 추출 및 앵커 예산 계산
  let shinSanUpBudgetMain = 0; // 신산업(본사업)
  let shinSanUpBudgetCarry = 0; // 신산업(이월사업)
  activeProjects.forEach((p) => {
    p.units.forEach((u) => {
      if (u.id === "A1나") {
        shinSanUpBudgetMain = u.years?.[selectedYear]?.budget_main || 0;
        shinSanUpBudgetCarry = u.years?.[selectedYear]?.budget_carry || 0;
      }
    });
  });
  const anchorBudgetMain = Math.max(0, totalBudgetMain - shinSanUpBudgetMain);
  const anchorBudgetCarry = Math.max(0, totalBudgetCarry - shinSanUpBudgetCarry);

  // 전체 KPI 달성률 계산
  let kpiCount = 0;
  let totalKpiAchievement = 0;
  activeProjects.forEach((p) => {
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
  const chartData = activeProjects.map((p) => {
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

  const pieData = activeProjects.map((p) => {
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
          <div className="kpi-subtext" style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.72rem", width: "100%", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.4rem", marginTop: "0.3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>앵커(본사업): {formatToMillionWon(anchorBudgetMain)}백만원</span>
              <span>앵커(이월사업): {formatToMillionWon(anchorBudgetCarry)}백만원</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>신산업(본사업): {formatToMillionWon(shinSanUpBudgetMain)}백만원</span>
              <span>신산업(이월사업): {formatToMillionWon(shinSanUpBudgetCarry)}백만원</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: "0.3rem", marginTop: "0.1rem" }}>
              <span>2차년도(본사업): {formatToMillionWon(totalBudgetMain)}백만원</span>
              <span>1차년도(이월사업): {formatToMillionWon(totalBudgetCarry)}백만원</span>
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

        {selectedYear >= 2 && (
          <div className="glass-card">
            <div className="kpi-header">
              <span>{selectedYear - 1}차년도 이월사업비 집행</span>
              <TrendingUp size={16} className="badge-yellow" />
            </div>
            <div className="kpi-value" style={{ color: "var(--warning-color)", fontSize: "1.45rem" }}>
              {formatToMillionWon(totalSpentCarry)} 백만원
            </div>
            <div className="kpi-subtext">집행률: {rateCarry.toFixed(1)}% (배정: {formatToMillionWon(totalBudgetCarry)}백만원)</div>
          </div>
        )}

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
                  cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                  formatter={(value) => `${value.toLocaleString()} 백만원`}
                  contentStyle={{
                    background: "rgba(24, 24, 27, 0.95)",
                    border: "1px solid var(--border-color-dark)",
                    borderRadius: "0.5rem",
                    color: "white",
                    fontSize: "11px"
                  }}
                />
                <Legend verticalAlign="top" height={36} fontSize={11} />
                <Bar dataKey="본예산" fill="#1e3a8a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="본집행" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                {selectedYear >= 2 && <Bar dataKey="이월예산" name={`${selectedYear - 1}차년도 이월예산`} fill="#064e3b" radius={[3, 3, 0, 0]} />}
                {selectedYear >= 2 && <Bar dataKey="이월집행" name={`${selectedYear - 1}차년도 이월집행`} fill="#10b981" radius={[3, 3, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 예산 분배 비율 */}
        <div className="glass-card" style={{ minHeight: "380px" }}>
          <h3 style={{ marginBottom: "1.2rem", fontSize: "1.1rem", fontWeight: "800" }}>
            재원 배분 구조 {selectedYear === 1 ? "(공통경비 제외)" : "(공통경비 포함)"}
          </h3>
          <div style={{ width: "100%", height: "240px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <ResponsiveContainer>
              <PieChart margin={{ top: 20, right: 35, left: 35, bottom: 20 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={{ stroke: "rgba(255, 255, 255, 0.25)", strokeWidth: 1 }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} 백만원`}
                  contentStyle={{
                    background: "rgba(24, 24, 27, 0.95)",
                    border: "1px solid var(--border-color-dark)",
                    borderRadius: "0.5rem",
                    color: "white",
                    fontSize: "11px"
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
