import type { Dispatch, SetStateAction } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Edit,
  Plus,
  Trash2
} from "lucide-react";
import type { ScheduleItem } from "../schedule-types";

interface ScheduleEventsPanelProps {
  currentRole: any;
  eventSchedules: ScheduleItem[];
  onDeleteEvent: (id?: number | string) => void;
  onEditEvent: (event: ScheduleItem) => void;
  onOpenAddModal: (type: string) => void;
  selectedEventMonth: number;
  selectedYear: number | string | undefined;
  setSelectedEventMonth: Dispatch<SetStateAction<number>>;
}

export function ScheduleEventsPanel({
  currentRole,
  eventSchedules,
  onDeleteEvent,
  onEditEvent,
  onOpenAddModal,
  selectedEventMonth,
  selectedYear,
  setSelectedEventMonth
}: ScheduleEventsPanelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* 행사 컨트롤 카드 */}
      <div className="card" style={{ padding: "1.25rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
            ✨ 앵커 사업단 주요 행사 관리
          </h3>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            월별 가로 탭을 눌러 행사 상세 기획, 참석자, 목적 및 결과 정보 관리
          </p>
        </div>

        {currentRole.id !== "GUEST" && (
          <button
            className="btn btn-primary"
            onClick={() => onOpenAddModal("event")}
            style={{
              display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1.2rem", borderRadius: "9999px",
              background: "var(--accent-color)", border: "none", color: "white", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer"
            }}
          >
            <Plus size={16} />
            행사 기획 및 결과 등록
          </button>
        )}
      </div>

      {/* 💡 월별 가로 탭바 헤더 */}
      <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.02)", padding: "0.4rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2].map((month) => (
          <button
            key={month}
            onClick={() => setSelectedEventMonth(month)}
            style={{
              padding: "0.3rem 0.8rem", borderRadius: "4px", border: "none",
              background: selectedEventMonth === month ? "var(--accent-color)" : "transparent",
              color: selectedEventMonth === month ? "white" : "var(--text-secondary)",
              fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", transition: "all 0.15s ease"
            }}
          >
            {month === 3 ? `'${24 + Number(selectedYear || 0)}.3월` : month === 1 ? `'${25 + Number(selectedYear || 0)}.1월` : `${month}월`}
          </button>
        ))}
      </div>

      {/* 행사 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {eventSchedules.filter(event => event.year === selectedYear && event.month === selectedEventMonth).length > 0 ? (
          eventSchedules.filter(event => event.year === selectedYear && event.month === selectedEventMonth).map(event => (
            <div
              key={event.id}
              id={`event-card-${event.id}`}
              className="card"
              style={{ padding: "1.5rem", borderRadius: "10px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* 1) 맨 윗줄: [담당부서]   일시 (부서 옆 1.5cm)   장소 (일시 옆 0.5cm)   행사제목 (수정 마크보다 1cm 좌측)   수정/삭제 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.6rem" }}>
                {/* 왼쪽 영역: [담당부서], 일시, 장소 한 줄 정리 */}
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                  {/* 담당부서 (대괄호 감싸기, 볼드, 짙은 분홍색, 폰트크기 0.85rem 적용) */}
                  <span style={{ fontWeight: "850", color: "#EC4899", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    [{event.department || "사업운영팀"}]
                  </span>

                  {/* 소속부서에서 1.5cm (56px) 띄우고 일시 */}
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "56px", whiteSpace: "nowrap" }}>
                    일시 : {event.datetime}
                  </span>

                  {/* 일시에서 0.5cm (19px) 띄우고 | 구분선 */}
                  <span style={{ color: "rgba(255,255,255,0.15)", marginLeft: "19px" }}>|</span>

                  {/* 구분선에서 0.5cm (19px) 띄우고 장소 */}
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "19px", whiteSpace: "nowrap" }}>
                    장소 : <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{event.location || "미정"}</span>
                  </span>
                </div>

                {/* 오른쪽 영역: [행사제목]과 [수정/삭제] */}
                <div style={{ display: "flex", alignItems: "center", flexGrow: 1, justifyContent: "flex-end", overflow: "hidden" }}>
                  {/* 행사제목: 폰트 크기 2pt 더 크게 (1.35rem), '수정' 마크보다 왼쪽으로 1cm (38px) 떨어지게 */}
                  <h4 style={{ margin: "0 38px 0 1.5rem", fontSize: "1.35rem", fontWeight: "800", color: "var(--text-primary)", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={event.title}>
                    {event.title}
                  </h4>

                  {/* 수정 & 삭제 (우측정렬) */}
                  {currentRole.id !== "GUEST" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                      <button
                        onClick={() => onEditEvent(event)}
                        title="수정"
                        style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                        onFocus={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                        onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                        onBlur={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                        onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        title="삭제"
                        style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.2rem", transition: "color 0.15s" }}
                        onFocus={(e) => e.currentTarget.style.color = "#EF4444"}
                        onMouseOver={(e) => e.currentTarget.style.color = "#EF4444"}
                        onBlur={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                        onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2) 바디 영역: 좌측(참석자 & 목적) / 우측(결과 보고 작성 블록) -> 1:1 비율 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "stretch", fontSize: "0.82rem", color: "var(--text-primary)" }}>

                {/* 좌측 정보 컬럼 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", justifyContent: "center" }}>
                  {/* 참석자(내부) : 참석자(외부) -> 1:1 비율 그리드 정비 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", width: "100%" }}>
                    <div>
                      <strong>참석자(내부) :</strong> {event.attendeesInternal || "없음"}
                    </div>
                    <div>
                      <strong>참석자(외부) :</strong> {event.attendeesExternal || "없음"}
                    </div>
                  </div>

                  {/* 행사목적 한 줄 */}
                  <div style={{ lineHeight: "1.4" }}>
                    <strong>행사목적 :</strong> <span style={{ color: "var(--text-secondary)" }}>{event.purpose || "내용 없음"}</span>
                  </div>
                </div>

                {/* 우측 결과보고 블록 (좌측 내용물과 높이 자동 맞춤 동기화) */}
                <div style={{ background: "rgba(16, 185, 129, 0.14)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.25)", display: "flex", flexDirection: "column", gap: "0.3rem", justifyContent: "center" }}>
                  <span style={{ color: "#059669", fontWeight: "800", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <CheckCircle size={14} />
                    행사 결과 보고
                  </span>
                  <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: "1.45", color: "var(--text-secondary)" }}>
                    {event.result || "결과 보고가 등록되지 않았습니다."}
                  </p>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--panel-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", textAlign: "center" }}>
            <CalendarIcon size={40} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
            <span>{selectedEventMonth}월에 등록된 주요 행사 일정이 없습니다.<br />[행사 일정 등록] 버튼을 눌러 초기 계획을 채워보세요.</span>
          </div>
        )}
      </div>

    </div>
  );
}
