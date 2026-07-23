import KPIOverview from "../../../components/KPIOverview";
import type { KPIOverviewProps } from "../../../components/KPIOverview";

type DashboardScreenProps = {
  projects: KPIOverviewProps["projects"];
  currentRole: KPIOverviewProps["currentRole"];
  selectedYear: number;
};

export const DashboardScreen = ({
  projects,
  currentRole,
  selectedYear
}: DashboardScreenProps) => (
  <div>
    {/* 메인 대시보드 탭: 사용자의 요청에 따라 엑셀 업로더 영역을 제거하고 KPI 요약 카드만 노출합니다. */}
    <KPIOverview
      key={`kpi-${selectedYear}`}
      projects={projects}
      currentRole={currentRole}
      selectedYear={selectedYear}
    />
  </div>
);
