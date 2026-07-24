import type { ScheduleItem } from "../schedule-types";

export const buildSchedulesByDate = (
  monthlySchedules: ScheduleItem[],
  selectedDeptFilter: string,
  selectedYear: number | string | undefined,
): Record<string, ScheduleItem[]> => {
  const filtered = selectedDeptFilter === "전체"
    ? monthlySchedules
    : monthlySchedules.filter(s => s.dept && (s.dept === "전체" || s.dept.split(",").map((x: string) => x.trim()).includes(selectedDeptFilter)));

  const mapped: Record<string, ScheduleItem[]> = {};
  filtered.forEach(s => {
    if (s.startAt && s.year === selectedYear) {
      const dateKey = s.startAt.substring(0, 10);
      if (!mapped[dateKey]) {
        mapped[dateKey] = [];
      }
      mapped[dateKey].push(s);
    }
  });
  return mapped;
};

export const getSchedulesForDay = (
  schedulesByDate: Record<string, ScheduleItem[]>,
  displayYear: number,
  currentMonth: number,
  selectedDay: number,
): ScheduleItem[] => {
  const dateString = `${displayYear}-${currentMonth < 10 ? "0" + currentMonth : currentMonth}-${selectedDay < 10 ? "0" + selectedDay : selectedDay}`;
  return schedulesByDate[dateString] || [];
};
