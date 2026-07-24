import type { Dispatch, SetStateAction } from "react";
import type { LegacyPdcaRecord } from "../utils/pdca-utils";
import { formatAssignee, formatToMillionWon } from "../utils/pdca-utils";

interface PdcaAllProgramsViewProps {
  allFilteredPrograms: LegacyPdcaRecord[];
  selectedYear: number;
  handleSelectProgram: (program: LegacyPdcaRecord) => void;
  selectedProgId: string | null;
  activeProg?: LegacyPdcaRecord;
  setActivePdcaStage: Dispatch<SetStateAction<string>>;
  isResearcher: boolean;
  currentRole: LegacyPdcaRecord;
  handleUpdatePDCA: (stage: string, status: string) => void;
}

export function PdcaAllProgramsView({
  allFilteredPrograms,
  selectedYear,
  handleSelectProgram,
  selectedProgId,
  activeProg,
  setActivePdcaStage,
  isResearcher,
  currentRole,
  handleUpdatePDCA,
}: PdcaAllProgramsViewProps) {
  return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1.5rem", borderRadius: "1.25rem", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.02)" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>사업단 전체 프로그램 추진 상태</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
              행을 클릭하거나 우측 [정보 등록] 버튼을 눌러 실시간 PDCA 수치 및 집행 실적을 입력하실 수 있습니다.
            </p>
          </div>

          <div className="table-panel" style={{ maxHeight: "350px", overflowY: "auto" }}>
            <table className="custom-table" style={{ fontSize: "0.75rem" }}>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ width: "80px", textAlign: "center" }}>단위과제</th>
                  <th rowSpan={2} style={{ width: "110px", textAlign: "center" }}>ID</th>
                  <th rowSpan={2}>프로그램명</th>
                  <th rowSpan={2} style={{ width: "140px", textAlign: "center" }}>담당자</th>
                  <th colSpan={2} style={{ textAlign: "center" }}>{selectedYear}차년도 예산 및 집행</th>
                  <th colSpan={4} style={{ textAlign: "center" }}>진행 단계(PDCA)</th>
                  <th rowSpan={2} style={{ width: "65px", textAlign: "center" }}>정보<br/>등록</th>
                </tr>
                <tr>
                  <th style={{ textAlign: "center", width: "110px" }}>예산</th>
                  <th style={{ textAlign: "center", width: "110px" }}>집행</th>
                  <th style={{ textAlign: "center", width: "40px" }}>P</th>
                  <th style={{ textAlign: "center", width: "40px" }}>D</th>
                  <th style={{ textAlign: "center", width: "40px" }}>C</th>
                  <th style={{ textAlign: "center", width: "40px" }}>A</th>
                </tr>
              </thead>
              <tbody>
                {allFilteredPrograms.map((prog) => {
                  const py = prog.years?.[selectedYear] || {};
                  return (
                    <tr
                      key={prog.id}
                      onClick={() => handleSelectProgram(prog)}
                      style={{
                        background: selectedProgId === prog.id ? "rgba(59,130,246,0.06)" : "inherit",
                        cursor: "pointer"
                      }}
                     role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                      <td style={{ textAlign: "center" }}>{prog.unitId}</td>
                      <td style={{ fontFamily: "var(--font-data)", fontWeight: "700" }}>{prog.id}</td>
                      <td style={{ fontWeight: selectedProgId === prog.id ? "700" : "normal" }}>{prog.title}</td>
                      <td style={{ fontWeight: "700", color: "var(--accent-color)", textAlign: "center" }}>
                        {(() => {
                          const assigneeStr = formatAssignee(prog.assignees?.[selectedYear] !== undefined ? prog.assignees[selectedYear] : prog.assignee);
                          return assigneeStr.split(",").map((name, idx) => (
                            <div key={idx} style={{ whiteSpace: "nowrap" }}>{name.trim()}</div>
                          ));
                        })()}
                      </td>
                      <td style={{ fontFamily: "var(--font-data)", textAlign: "right" }}>
                        <div>{formatToMillionWon(py.budget_main)}백만원</div>
                        {selectedYear !== 1 && (
                          <div style={{ color: "var(--text-secondary)", fontSize: "0.68rem", borderTop: "1px dashed var(--border-color)", marginTop: "2px", paddingTop: "2px" }}>
                            {formatToMillionWon(py.budget_carry)}백만원 <span style={{ fontSize: "0.6rem" }}>(이월)</span>
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: "var(--font-data)", textAlign: "right" }}>
                        <div>{formatToMillionWon(py.spent_main)}백만원</div>
                        {selectedYear !== 1 && (
                          <div style={{ color: "var(--text-secondary)", fontSize: "0.68rem", borderTop: "1px dashed var(--border-color)", marginTop: "2px", paddingTop: "2px" }}>
                            {formatToMillionWon(py.spent_carry)}백만원 <span style={{ fontSize: "0.6rem" }}>(이월)</span>
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: "center", color: (prog.pdca?.p || "대기") === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca?.p || "대기"}</td>
                      <td style={{ textAlign: "center", color: (prog.pdca?.d || "대기") === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca?.d || "대기"}</td>
                      <td style={{ textAlign: "center", color: (prog.pdca?.c || "대기") === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca?.c || "대기"}</td>
                      <td style={{ textAlign: "center", color: (prog.pdca?.a || "대기") === "완료" ? "var(--success-color)" : "inherit", fontWeight: "700" }}>{prog.pdca?.a || "대기"}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="btn-primary"
                          style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", borderRadius: "0.3rem", lineHeight: "1.1" }}
                          onClick={(e) => { e.stopPropagation(); handleSelectProgram(prog); }}
                        >
                          정보<br/>등록
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 테이블 하단 상세 편집 블록 (선택 시 동적 출현) */}
          {activeProg && (
            <div style={{ marginTop: "1rem", padding: "1.5rem", border: "1px solid var(--accent-color)", borderRadius: "1rem", background: "rgba(59,130,246,0.03)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "800", marginBottom: "0.5rem" }}>[{activeProg.id}] {activeProg.title}</h4>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <div>국고 예산: {formatToMillionWon(activeProg.years?.[selectedYear]?.budget_national)}백만원 (집행: {formatToMillionWon(activeProg.years?.[selectedYear]?.spent_national)}백만원)</div>
                  <div>시비 예산: {formatToMillionWon(activeProg.years?.[selectedYear]?.budget_city)}백만원 (집행: {formatToMillionWon(activeProg.years?.[selectedYear]?.spent_city)}백만원)</div>
                  <div>외부 예산: {formatToMillionWon(activeProg.years?.[selectedYear]?.budget_external)}백만원 (집행: {formatToMillionWon(activeProg.years?.[selectedYear]?.spent_external)}백만원)</div>
                </div>

                <h5 style={{ fontSize: "0.8rem", fontWeight: "700", marginTop: "1rem", marginBottom: "0.5rem" }}>PDCA 단계 갱신</h5>
                <div className="pdca-stepper" style={{ marginBottom: "0" }}>
                  {["p", "d", "c", "a"].map((stage) => {
                    const status = activeProg.pdca?.[stage] || "대기";
                    const isDone = status === "완료";
                    const isProgress = status === "진행";
                    return (
                      <div
                        key={stage}
                        className={`pdca-step-item ${isDone ? "done" : isProgress ? "in-progress" : ""}`}
                        style={{ cursor: "pointer", transition: "transform 0.2s" }}
                        onClick={() => setActivePdcaStage(stage.toUpperCase())}
                        title={`${stage.toUpperCase()} 단계 실무 폼 열기`}
                       role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.currentTarget.click(); } }}>
                        <div className="pdca-circle" style={{ width: "24px", height: "24px", fontSize: "0.75rem" }}>{stage.toUpperCase()}</div>
                        <span style={{ fontSize: "0.65rem", fontWeight: "700" }}>
                          {stage === "p" ? "Plan" : stage === "d" ? "Do" : stage === "c" ? "Check" : "Act"}
                        </span>
                        {(isResearcher || currentRole.rank <= 2) && (
                          <select
                            style={{
                              fontSize: "0.6rem",
                              background: "var(--input-bg)",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "0.2px",
                              cursor: "not-allowed"
                            }}
                            value={status}
                            disabled={true}
                            title={
                              stage === "p"
                                ? "Plan 단계 상태는 기획 정보 입력량에 따라 자동으로 설정됩니다."
                                : stage === "d"
                                  ? "Do 단계 상태는 집행 및 수행 실적 저장 시 자동으로 설정됩니다."
                                  : stage === "c"
                                    ? "Check 단계 상태는 성과 실적 저장 시 자동으로 설정됩니다."
                                    : "Act 단계 상태는 환류 평가 저장 시 자동으로 설정됩니다."
                            }
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdatePDCA(stage, e.target.value)}
                          >
                            <option value="대기">대기</option>
                            {stage !== "c" && stage !== "a" && <option value="진행">진행</option>}
                            <option value="완료">완료</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--accent-color)" }}>기획 / 성과 / 환류 실무 정보 입력</h5>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>좌측 단위과제별 모드를 활성화하여 더욱 상세한 다변화 재원 및 2분할 환류 폼을 편집하실 수 있습니다.</p>
              </div>
            </div>
          )}
        </div>
  );
}
