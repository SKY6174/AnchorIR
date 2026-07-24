import type { Dispatch, SetStateAction } from "react";
import type { ScheduleItem } from "../schedule-types";
import { getDaysInMonth, getStartDayOfWeek } from "../utils/schedule-display-utils";

interface ScheduleCalendarGridProps {
  displayYear: number;
  currentMonth: number;
  schedulesByDate: Record<string, ScheduleItem[]>;
  selectedDay: number;
  setSelectedDay: Dispatch<SetStateAction<number>>;
  currentRole: { id?: string };
  openAddModal: (type: string, defaultDateStr?: string | null) => void;
  setDragOverDate: Dispatch<SetStateAction<string | null>>;
  draggingId: number | string | null;
  handleScheduleDrop: (scheduleId: number | string, targetDate: string) => void;
  dragOverDate: string | null;
  setDraggingId: Dispatch<SetStateAction<number | string | null>>;
  handleEditSchedule: (schedule: ScheduleItem) => void;
}

export function ScheduleCalendarGrid({
  displayYear, currentMonth, schedulesByDate, selectedDay, setSelectedDay,
  currentRole, openAddModal, setDragOverDate, draggingId, handleScheduleDrop,
  dragOverDate, setDraggingId, handleEditSchedule,
}: ScheduleCalendarGridProps) {
    const daysInMonth = getDaysInMonth(displayYear, currentMonth);
    const startDay = getStartDayOfWeek(displayYear, currentMonth);
    const cells: React.ReactNode[] = [];

    // 빈 셀 채우기 (라이트/다크모드 유동적 border 적용 및 최소 높이 확보)
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} style={{ minHeight: "85px", height: "auto", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid var(--border-color)" }}></div>);
    }

    // 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${displayYear}-${currentMonth < 10 ? "0" + currentMonth : currentMonth}-${day < 10 ? "0" + day : day}`;
      // 캐싱된 해시맵에서 해당 날짜(dateString)의 일정을 즉시 O(1)로 조회하여 성능을 극대화합니다.
      const daySchedules = schedulesByDate[dateString] || [];
      const isSelected = selectedDay === day;

      cells.push(
        <div
          key={`day-${day}`}
          onClick={() => setSelectedDay(day)}
          onDoubleClick={() => {
            if (currentRole.id !== "GUEST") {
              openAddModal("monthly", dateString);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setDragOverDate(dateString)}
          onDragLeave={() => setDragOverDate(null)}
          onDrop={(e) => {
            e.preventDefault();
            const droppedId = draggingId || e.dataTransfer.getData("text/plain");
            if (droppedId) {
              handleScheduleDrop(droppedId, dateString);
            }
            setDragOverDate(null);
          }}
          style={{
            minHeight: "85px",
            height: "auto",
            padding: "0.25rem 0.25rem 0.4rem 0.25rem",
            borderBottom: "1px solid var(--border-color)",
            borderRight: "1px solid var(--border-color)",
            background: dragOverDate === dateString ? "rgba(59, 130, 246, 0.25)" : (isSelected ? "rgba(59, 130, 246, 0.15)" : "transparent"),
            cursor: "pointer",
            position: "relative",
            transition: "all 0.15s ease",
            display: "flex",
            flexDirection: "column"
          }}
         role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
          <span style={{ fontSize: "0.75rem", fontWeight: "700", color: isSelected ? "var(--accent-color)" : "var(--text-primary)" }}>
            {day}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", marginTop: "0.25rem", maxHeight: "115px", overflowY: "auto", flex: 1, scrollbarWidth: "none", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
            {daySchedules.map((sched: ScheduleItem) => {
              const isTask = sched.isTask || false;
              const isDeadline = sched.isDeadline || false;
              const isCompleted = sched.completed || false;

              let bgColor = "#4B5563";
              if (isDeadline) {
                bgColor = isCompleted ? "rgba(239, 68, 68, 0.4)" : "#EF4444";
              } else if (isTask) {
                bgColor = isCompleted ? "rgba(139, 92, 246, 0.4)" : "#8B5CF6";
              } else {
                bgColor = sched.type === "행사" ? "#3B82F6" : sched.type === "회의" ? "#10B981" : sched.type === "위원회" ? "#F59E0B" : "#4B5563";
              }

              return (
                <div
                  key={sched.id}
                  draggable={true}
                  onDragStart={(e) => {
                    setDraggingId(sched.id ?? null);
                    e.dataTransfer.setData("text/plain", String(sched.id));
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleEditSchedule(sched);
                  }}
                  style={{
                    fontSize: (sched.title || "").length >= 22 ? "0.55rem" : "0.65rem",
                    background: bgColor,
                    color: "white",
                    padding: "0.15rem 0.3rem",
                    borderRadius: "3px",
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    wordBreak: "break-all",
                    whiteSpace: "normal",
                    textDecoration: isCompleted ? "line-through" : "none",
                    opacity: isCompleted ? 0.6 : 1,
                    cursor: draggingId === sched.id ? "grabbing" : "grab",
                    userSelect: "none",
                    lineHeight: "1.2"
                  }}
                  title={`${isDeadline ? "[마감]" : (isTask ? "[할일]" : `[${sched.type}]`)} ${sched.title} (${sched.dept})`}
                >
                  {isDeadline ? "🚨 " : (isTask ? "✔️ " : "")}{sched.title}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return cells;
}
