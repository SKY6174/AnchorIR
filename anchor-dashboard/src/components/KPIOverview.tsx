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
  Pie,
  type PieLabelRenderProps
} from "recharts";
import { TrendingUp, Activity, Award } from "lucide-react";

/**
 * 💡 KPIOverviewProps - KPI 요약 대시보드 컴포넌트 입력 속성 타입 정의
 */
export interface KPIOverviewProps {
  /** 프로젝트 및 단위과제 전체 목록 데이터 */
  projects: any[];
  /** 현재 사용자 역할 키 */
  currentRole?: string;
  /** 차년도 선택 (기본값: 2차년도) */
  selectedYear?: number;
}

// 백만원 단위 포맷팅 헬퍼 함수 (소수점 첫째자리까지 표현)
const formatToMillionWon = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0.0";
  return (value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// 도넛 차트 조각 라벨 렌더러 Props 타입
// 도넛 차트 조각 옆에 지시선과 함께 이름(비율%) 라벨을 그리기 위한 커스텀 SVG 렌더러
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name
}: PieLabelRenderProps): React.JSX.Element => {
  const numericCx = Number(cx);
  const numericCy = Number(cy);
  const numericMidAngle = Number(midAngle);
  const numericOuterRadius = Number(outerRadius);
  const RADIAN = Math.PI / 180;
  const radius = numericOuterRadius * 1.15;
  const x = numericCx + radius * Math.cos(-numericMidAngle * RADIAN);
  const y = numericCy + radius * Math.sin(-numericMidAngle * RADIAN);
  const pctString = `(${(Number(percent) * 100).toFixed(1)}%)`;

  return (
    <text
      x={x}
      y={y}
      fill="var(--text-primary)"
      textAnchor={x > numericCx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="12px"
      fontWeight="700"
    >
      <tspan x={x} dy="-0.5em">{String(name)}</tspan>
      <tspan x={x} dy="1.2em">{pctString}</tspan>
    </text>
  );
};

/**
 * 💡 KPIOverview - 5대 핵심 KPI 및 집행률 요약 TSX 컴포넌트
 */
export default function KPIOverview({ projects = [], currentRole, selectedYear = 2 }: KPIOverviewProps): React.JSX.Element {
  // 안전 방어 코드: projects가 배열이 아닐 경우 빈 배열로 처리하여 TypeError 방지
  const safeProjects = Array.isArray(projects) ? projects : [];

  // 1차년도에는 공통경비(프로젝트 ID: E)가 존재하지 않으므로 필터링 처리
  const activeProjects = selectedYear === 1
    ? safeProjects.filter((p) => p && p.id !== "E")
    : safeProjects;

  // 예산 합계 및 재원 구분 계산
  const totalBudgetMain = activeProjects.reduce((sum, p) => {
    if (!p.units || !Array.isArray(p.units)) return sum;
    return sum + p.units.reduce((s: number, u: any) => s + (u.years?.[selectedYear]?.budget_main || 0), 0);
  }, 0);
  const totalSpentMain = activeProjects.reduce((sum, p) => {
    if (!p.units || !Array.isArray(p.units)) return sum;
    return sum + p.units.reduce((s: number, u: any) => s + (u.years?.[selectedYear]?.spent_main || 0), 0);
  }, 0);
  const rateMain = totalBudgetMain > 0 ? (totalSpentMain / totalBudgetMain) * 100 : 0;

  const totalBudgetCarry = selectedYear === 1 ? 0 : activeProjects.reduce((sum, p) => {
    if (!p.units || !Array.isArray(p.units)) return sum;
    return sum + p.units.reduce((s: number, u: any) => s + (u.years?.[selectedYear]?.budget_carry || 0), 0);
  }, 0);
  const totalSpentCarry = selectedYear === 1 ? 0 : activeProjects.reduce((sum, p) => {
    if (!p.units || !Array.isArray(p.units)) return sum;
    return sum + p.units.reduce((s: number, u: any) => s + (u.years?.[selectedYear]?.spent_carry || 0), 0);
  }, 0);
  const rateCarry = totalBudgetCarry > 0 ? (totalSpentCarry / totalBudgetCarry) * 100 : 0;

  const totalBudget = totalBudgetMain + totalBudgetCarry;
  const totalSpent = totalSpentMain + totalSpentCarry;

  // 외부사업비 합산 추출
  const totalExternalBudget = activeProjects.reduce((sum, p) => {
    if (!p.units || !Array.isArray(p.units)) return sum;
    return sum + p.units.reduce((s: number, u: any) => {
      if (!u.programs || !Array.isArray(u.programs)) return s;
      const progExternalSum = u.programs.reduce((progSum: number, prog: any) => {
        return progSum + (prog.years?.[selectedYear]?.budget_external || 0);
      }, 0) || 0;
      return s + progExternalSum;
    }, 0);
  }, 0);

  // A1나 신산업특화 예산 동적 추출 및 앵커 예산 계산
  let shinSanUpBudgetMain = 0;
  let shinSanUpBudgetCarry = 0;
  if (selectedYear >= 2) {
    activeProjects.forEach((p) => {
      if (p.units && Array.isArray(p.units)) {
        p.units.forEach((u: any) => {
          if (u.id === "A1나") {
            shinSanUpBudgetMain = u.years?.[selectedYear]?.budget_main || 0;
            shinSanUpBudgetCarry = u.years?.[selectedYear]?.budget_carry || 0;
          }
        });
      }
    });
  }
  const anchorBudgetMain = Math.max(0, totalBudgetMain - shinSanUpBudgetMain);
  const anchorBudgetCarry = Math.max(0, totalBudgetCarry - shinSanUpBudgetCarry);

  // KPI 달성률 유형별 계산
  let commonKpiCount = 0;
  let commonKpiTotal = 0;
  let selfKpiCount = 0;
  let selfKpiTotal = 0;
  let focusKpiCount = 0;
  let focusKpiTotal = 0;

  activeProjects.forEach((p) => {
    if (p.units && Array.isArray(p.units)) {
      p.units.forEach((u: any) => {
        (u.kpis || []).forEach((k: any) => {
          let ach = 0;
          if (selectedYear === 1 && k.id === "L-1") ach = 111.9;
          else if (selectedYear === 1 && k.id === "L-2") ach = 687.8;
          else if (selectedYear === 1 && k.id === "L-3") ach = 138.6;
          else if (selectedYear === 1 && k.id === "L-4") ach = 146.7;
          else if (selectedYear === 1 && k.id === "L-5") ach = 81.8;
          else if (selectedYear === 1 && k.id === "L-6") ach = 103.3;
          else if (selectedYear === 1 && k.id === "L-7") ach = 321.3;
          else if (selectedYear === 1 && k.id === "L-8") ach = 134.0;
          else if (selectedYear === 1 && k.id === "L-9") ach = 106.0;
          else if (selectedYear === 1 && k.id === "L-10") ach = 128.5;
          else if (selectedYear === 1 && k.id === "L-11") ach = 160.0;
          else if (selectedYear === 1 && k.id === "L-12") ach = 114.6;
          else if (selectedYear === 1 && k.id === "L-13") ach = 108.0;
          else if (selectedYear === 1 && k.id === "L-14") ach = 500.0;
          else if (selectedYear === 1 && k.id === "L-15") ach = 132.2;
          else if (selectedYear === 1 && k.id === "L-16") ach = 123.3;
          else if (selectedYear === 1 && k.id === "L-17") ach = 0.0;
          else if (selectedYear === 1 && k.id === "L-18") ach = 176.5;
          else if (selectedYear === 1 && k.id === "L-19") ach = 244.0;
          else if (selectedYear === 1 && k.id === "L-20") ach = 202.5;
          else if (selectedYear === 1 && k.id === "L-21") ach = 100.0;
          else if (selectedYear === 1 && k.id === "L-22") ach = 175.0;
          else if (selectedYear === 1 && k.id === "L-23") ach = 144.3;
          else if (selectedYear === 1 && k.id === "L-24") ach = 138.3;
          else if (selectedYear === 1 && k.id === "C-1") ach = 100.0;
          else if (selectedYear === 1 && k.id === "C-2") ach = 115.5;
          else if (selectedYear === 1 && k.id === "C-3") ach = 112.0;
          else if (selectedYear === 1 && k.id === "C-4") ach = 107.4;
          else if (selectedYear === 1 && k.id === "C-5") ach = 102.5;
          else if (selectedYear === 1 && k.id === "C-6") ach = 106.7;
          else if (k.subItems && k.subItems.length > 0) {
            let sumSub = 0;
            k.subItems.forEach((sub: any) => {
              const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
              sumSub += yData.target > 0 ? (yData.current / yData.target) * 100 : 0;
            });
            ach = sumSub / k.subItems.length;
          } else {
            ach = k.target > 0 ? (k.current / k.target) * 100 : 0;
          }
          const finalAch = Math.min(ach, 120);

          if (k.type === "공통") {
            commonKpiCount++;
            commonKpiTotal += finalAch;
          } else if (k.type === "자율") {
            selfKpiCount++;
            selfKpiTotal += finalAch;
          } else if (k.type === "중점") {
            focusKpiCount++;
            focusKpiTotal += finalAch;
          }
        });
      });
    }
  });

  const avgCommonKpi = commonKpiCount > 0 ? commonKpiTotal / commonKpiCount : 0;
  const avgSelfKpi = selfKpiCount > 0 ? selfKpiTotal / selfKpiCount : 0;
  const avgFocusKpi = focusKpiCount > 0 ? focusKpiTotal / focusKpiCount : 0;

  // 차트 데이터
  const safeActiveProjects = Array.isArray(activeProjects) ? activeProjects : [];
  const chartData = safeActiveProjects.map((p) => {
    const hasUnits = p && p.units && Array.isArray(p.units);
    const pBudgetMain = hasUnits ? p.units.reduce((s: number, u: any) => s + (u.years?.[selectedYear]?.budget_main || 0), 0) : 0;
    const pSpentMain = hasUnits ? p.units.reduce((s: number, u: any) => s + (u.years?.[selectedYear]?.spent_main || 0), 0) : 0;
    const pBudgetCarry = hasUnits ? p.units.reduce((s: number, u: any) => s + (u.years?.[selectedYear]?.budget_carry || 0), 0) : 0;
    const pSpentCarry = hasUnits ? p.units.reduce((s: number, u: any) => s + (u.years?.[selectedYear]?.spent_carry || 0), 0) : 0;

    return {
      name: p.id === "E" ? "공통운영경비" : (p.title ? p.title.split(":")[0] : ""),
      "본예산": Math.round(pBudgetMain / 1000000),
      "본집행": Math.round(pSpentMain / 1000000),
      "이월예산": Math.round(pBudgetCarry / 1000000),
      "이월집행": Math.round(pSpentCarry / 1000000)
    };
  });

  const pieData = safeActiveProjects.map((p) => {
    const hasUnits = p && p.units && Array.isArray(p.units);
    const pBudgetMain = hasUnits ? p.units.reduce((s: number, u: any) => s + (u.years?.[selectedYear]?.budget_main || 0), 0) : 0;
    const pBudgetCarry = hasUnits ? p.units.reduce((s: number, u: any) => s + (u.years?.[selectedYear]?.budget_carry || 0), 0) : 0;
    return {
      name: p.id === "E" ? "공통운영경비" : (p.title ? p.title.split(":")[0] : ""),
      value: Math.round((pBudgetMain + pBudgetCarry) / 1000000)
    };
  });

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  return (
    <div>
      {/* 4대 핵심 요약 카드 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gap: "1.5rem",
        marginBottom: "2rem"
      }}>
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="kpi-header">
              <span>ANCHOR {selectedYear}차년도 총 예산</span>
              <TrendingUp size={16} className="badge-blue" />
            </div>
            <div className="kpi-value" style={{ color: "var(--accent-color)", fontSize: "1.45rem", display: "flex", alignItems: "baseline", gap: "0.4rem", flexWrap: "wrap" }}>
              <span>{formatToMillionWon(totalBudget)} 백만원</span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "normal" }}>
                (외부사업비: {formatToMillionWon(totalExternalBudget)} 백만원)
              </span>
            </div>
          </div>
          <div className="kpi-subtext" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.6rem", marginTop: "0.5rem" }}>
            {selectedYear === 1 ? (
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem" }}>
                <div style={{
                  flex: 1,
                  background: "rgba(59, 130, 246, 0.08)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: "0.375rem",
                  padding: "0.5rem 0.8rem",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem"
                }}>
                  <span style={{ fontWeight: "700", color: "#60a5fa" }}>앵커(본사업)</span>
                  <span>{formatToMillionWon(anchorBudgetMain)} 백만원</span>
                </div>
                <div style={{
                  flex: 1,
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "0.375rem",
                  padding: "0.5rem 0.8rem",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem"
                }}>
                  <span style={{ fontWeight: "700", color: "#93c5fd" }}>1차년도(본사업)</span>
                  <span style={{ fontWeight: "700" }}>{formatToMillionWon(totalBudgetMain)} 백만원</span>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem" }}>
                  <div style={{
                    flex: 1,
                    background: "rgba(59, 130, 246, 0.08)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "0.375rem",
                    padding: "0.5rem 0.8rem",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.85rem"
                  }}>
                    <span style={{ fontWeight: "700", color: "#60a5fa" }}>앵커(본사업)</span>
                    <span>{formatToMillionWon(anchorBudgetMain)} 백만원</span>
                  </div>
                  <div style={{
                    flex: 1,
                    background: "rgba(139, 92, 246, 0.08)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    borderRadius: "0.375rem",
                    padding: "0.5rem 0.8rem",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.85rem"
                  }}>
                    <span style={{ fontWeight: "700", color: "#a78bfa" }}>앵커(이월사업)</span>
                    <span>{formatToMillionWon(anchorBudgetCarry)} 백만원</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem" }}>
                  <div style={{
                    flex: 1,
                    background: "rgba(85, 182, 133, 0.08)",
                    border: "1px solid rgba(85, 182, 133, 0.2)",
                    borderRadius: "0.375rem",
                    padding: "0.5rem 0.8rem",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.85rem"
                  }}>
                    <span style={{ fontWeight: "700", color: "#55b685" }}>신산업(본사업)</span>
                    <span>{formatToMillionWon(shinSanUpBudgetMain)} 백만원</span>
                  </div>
                  <div style={{
                    flex: 1,
                    background: "rgba(233, 162, 59, 0.08)",
                    border: "1px solid rgba(233, 162, 59, 0.2)",
                    borderRadius: "0.375rem",
                    padding: "0.5rem 0.8rem",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.85rem"
                  }}>
                    <span style={{ fontWeight: "700", color: "#e9a23b" }}>신산업(이월사업)</span>
                    <span>{formatToMillionWon(shinSanUpBudgetCarry)} 백만원</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: "0.6rem", marginTop: "0.3rem" }}>
                  <div style={{
                    flex: 1,
                    background: "rgba(85, 182, 133, 0.15)",
                    border: "1px solid rgba(85, 182, 133, 0.3)",
                    borderRadius: "0.375rem",
                    padding: "0.5rem 0.8rem",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.85rem"
                  }}>
                    <span style={{ fontWeight: "700", color: "#94deb8" }}>{selectedYear}차년도(본사업)</span>
                    <span style={{ fontWeight: "700" }}>{formatToMillionWon(totalBudgetMain)} 백만원</span>
                  </div>
                  <div style={{
                    flex: 1,
                    background: "rgba(233, 162, 59, 0.15)",
                    border: "1px solid rgba(233, 162, 59, 0.3)",
                    borderRadius: "0.375rem",
                    padding: "0.5rem 0.8rem",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.85rem"
                  }}>
                    <span style={{ fontWeight: "700", color: "#f6c97f" }}>{selectedYear - 1}차년도(이월사업)</span>
                    <span style={{ fontWeight: "700" }}>{formatToMillionWon(totalBudgetCarry)} 백만원</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {selectedYear === 1 ? (
          <>
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: "1.2rem 1.5rem" }}>
              <div className="kpi-header">
                <span>{selectedYear}차년도 본사업비 집행</span>
                <Activity size={16} className="badge-green" />
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <div className="kpi-value" style={{ color: "#94deb8", fontSize: "1.45rem", marginBottom: "0.3rem" }}>
                  {formatToMillionWon(totalSpentMain)} 백만원
                </div>
                <div className="kpi-subtext" style={{ fontSize: "0.72rem" }}>집행률: {rateMain.toFixed(1)}% (배정: {formatToMillionWon(totalBudgetMain)}백만원)</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", height: "100%" }}>
              <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "0.8rem 1.1rem" }}>
                <div className="kpi-header">
                  <span>(지자체)자율성과지표</span>
                  <Award size={16} style={{ color: "#ec4899" }} />
                </div>
                <div>
                  <div className="kpi-value" style={{ color: "#ec4899", fontSize: "1.3rem", margin: "0.15rem 0" }}>
                    {avgSelfKpi.toFixed(1)}%
                  </div>
                  <div className="kpi-subtext" style={{ fontSize: "0.65rem" }}>{selectedYear}차년도 지자체 요구 자율 혁신목표</div>
                </div>
              </div>
              <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "0.8rem 1.1rem" }}>
                <div className="kpi-header">
                  <span>(대학)중점관리지표</span>
                  <Award size={16} style={{ color: "#f472b6" }} />
                </div>
                <div>
                  <div className="kpi-value" style={{ color: "#f472b6", fontSize: "1.3rem", margin: "0.15rem 0" }}>
                    {avgFocusKpi.toFixed(1)}%
                  </div>
                  <div className="kpi-subtext" style={{ fontSize: "0.65rem" }}>{selectedYear}차년도 대학 특성 핵심관리지표</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", height: "100%" }}>
              <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "0.8rem 1.1rem" }}>
                <div className="kpi-header">
                  <span>{selectedYear}차년도 본사업비 집행</span>
                  <Activity size={16} className="badge-green" />
                </div>
                <div>
                  <div className="kpi-value" style={{ color: "#94deb8", fontSize: "1.3rem", margin: "0.15rem 0" }}>
                    {formatToMillionWon(totalSpentMain)} 백만원
                  </div>
                  <div className="kpi-subtext" style={{ fontSize: "0.65rem" }}>집행률: {rateMain.toFixed(1)}% (배정: {formatToMillionWon(totalBudgetMain)}백만원)</div>
                </div>
              </div>
              <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "0.8rem 1.1rem" }}>
                <div className="kpi-header">
                  <span>{selectedYear - 1}차년도 이월사업비 집행</span>
                  <TrendingUp size={16} className="badge-yellow" />
                </div>
                <div>
                  <div className="kpi-value" style={{ color: "#f6c97f", fontSize: "1.3rem", margin: "0.15rem 0" }}>
                    {formatToMillionWon(totalSpentCarry)} 백만원
                  </div>
                  <div className="kpi-subtext" style={{ fontSize: "0.65rem" }}>집행률: {rateCarry.toFixed(1)}% (배정: {formatToMillionWon(totalBudgetCarry)}백만원)</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", height: "100%" }}>
              <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "0.8rem 1.1rem" }}>
                <div className="kpi-header">
                  <span>(지자체)자율성과지표</span>
                  <Award size={16} style={{ color: "#ec4899" }} />
                </div>
                <div>
                  <div className="kpi-value" style={{ color: "#ec4899", fontSize: "1.3rem", margin: "0.15rem 0" }}>
                    {avgSelfKpi.toFixed(1)}%
                  </div>
                  <div className="kpi-subtext" style={{ fontSize: "0.65rem" }}>{selectedYear}차년도 지자체 요구 자율 혁신목표</div>
                </div>
              </div>
              <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "0.8rem 1.1rem" }}>
                <div className="kpi-header">
                  <span>(대학)중점관리지표</span>
                  <Award size={16} style={{ color: "#f472b6" }} />
                </div>
                <div>
                  <div className="kpi-value" style={{ color: "#f472b6", fontSize: "1.3rem", margin: "0.15rem 0" }}>
                    {avgFocusKpi.toFixed(1)}%
                  </div>
                  <div className="kpi-subtext" style={{ fontSize: "0.65rem" }}>{selectedYear}차년도 대학 특성 핵심관리지표</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 차트 시각화 섹션 */}
      <div className="vis-panel">
        <div className="glass-card" style={{ minHeight: "380px" }}>
          <h3 style={{ marginBottom: "1.2rem", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
            프로젝트별 재원 배정 및 누적 집행 현황 (단위: 백만원)
          </h3>
          <div style={{ width: "100%", height: "280px" }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 52, right: 10, left: 10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(value) => value.toLocaleString()} />
                <Tooltip
                  cursor={{ fill: "rgba(229, 240, 219, 0.15)" }}
                  formatter={(value: any) => `${Number(value).toLocaleString()} 백만원`}
                  contentStyle={{
                    background: "rgba(224, 235, 246, 0.95)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    fontSize: "11px"
                  }}
                  labelStyle={{ color: "#111827", fontWeight: "700", marginBottom: "0.2rem" }}
                  itemStyle={{ color: "#1f2937" }}
                />
                <Legend
                  verticalAlign="top"
                  height={44}
                  iconSize={10}
                  wrapperStyle={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    padding: "0.3rem 0.8rem",
                    display: "inline-flex",
                    justifyContent: "center",
                    gap: "1rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    top: 0,
                    width: "80%"
                  }}
                  formatter={(value) => <span style={{ color: "var(--text-primary)", fontSize: "11px", fontWeight: "600" }}>{value}</span>}
                />
                <Bar dataKey="본예산" name="본사업비 예산" fill="#55b685" radius={[3, 3, 0, 0]} />
                <Bar dataKey="본집행" name="본사업비 집행" fill="#94deb8" radius={[3, 3, 0, 0]} />
                {selectedYear >= 2 && <Bar dataKey="이월예산" name="이월사업비 예산" fill="#e9a23b" radius={[3, 3, 0, 0]} />}
                {selectedYear >= 2 && <Bar dataKey="이월집행" name="이월사업비 집행" fill="#f6c97f" radius={[3, 3, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ minHeight: "380px" }}>
          <h3 style={{ marginBottom: "1.2rem", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
            재원 배분 구조 {selectedYear === 1 ? "(공통운영경비 제외)" : "(공통운영경비 포함)"}
          </h3>
          <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <ResponsiveContainer>
              <PieChart margin={{ top: 24, right: 40, left: 40, bottom: 24 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={{ stroke: "var(--text-secondary)", strokeWidth: 1, opacity: 0.45 }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `${Number(value).toLocaleString()} 백만원`}
                  contentStyle={{
                    background: "var(--tooltip-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    fontSize: "11px"
                  }}
                  labelStyle={{ color: "var(--text-primary)", fontWeight: "700" }}
                  itemStyle={{ color: "var(--text-primary)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
