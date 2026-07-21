import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet, Check } from "lucide-react";

/**
 * 💡 ExcelUploaderProps - 엑셀 업로더 컴포넌트 입력 속성 타입 정의
 */
export interface ExcelUploaderProps {
  /** 데이터 파싱 후 업데이트 콜백 함수 */
  onUpdateData: (data: any[], updateType: "BUDGET" | "KPI") => void;
  /** 프로젝트 및 단위과제 전체 목록 데이터 */
  projects: any[];
  /** 연차 선택 (기본값: 2차년도) */
  selectedYear?: number;
  /** 업로드 모드 ("BUDGET": 예산 양식, "KPI": 성과지표 양식) */
  mode?: "BUDGET" | "KPI";
  /** 조회 모드 ("all": 전체, "unit": 단위과제 전용) */
  viewMode?: "all" | "unit";
  /** 선택된 단위과제 ID (옵션) */
  selectedUnitId?: string;
}

/**
 * 💡 ExcelUploader - 엑셀 파일 실시간 일괄 업로드 및 양식 다운로드 TSX 컴포넌트
 */
export default function ExcelUploader({
  onUpdateData,
  projects,
  selectedYear = 2,
  mode = "BUDGET",
  viewMode = "all",
  selectedUnitId
}: ExcelUploaderProps): React.JSX.Element {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // 드래그 앤 드롭 상태 관리 핸들러
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // 엑셀 파싱 및 정합성 검증 로직
  const parseExcel = (file: File) => {
    setLoading(true);
    setSuccess(false);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        if (!e.target?.result) return;
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const json: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

        let isBudgetUpdate = false;
        let isKpiUpdate = false;

        // 엑셀 컬럼 헤더(키) 값을 검사하여 예산인지 KPI인지 판별
        if (json.length > 0) {
          const keys = Object.keys(json[0]).map((k) => k.trim());
          if (keys.includes("프로그램ID") && keys.includes("예산구분") && keys.includes("국고")) {
            isBudgetUpdate = true;
          } else if (keys.includes("세부항목ID") && keys.includes("실적값(현재값)")) {
            isKpiUpdate = true;
          }
        }

        // 현재 업로더 모드와 일치하는 파일인지 검증
        if (mode === "BUDGET" && !isBudgetUpdate) {
          alert("[업로드 실패] 이 영역은 예산 및 프로그램 전용 업로더입니다. '재원구분 예산양식' 엑셀 파일만 업로드해 주세요.");
          setLoading(false);
          return;
        }

        if (mode === "KPI" && !isKpiUpdate) {
          alert("[업로드 실패] 이 영역은 성과지표 전용 업로더입니다. '성과지표 관리양식' 엑셀 파일만 업로드해 주세요.");
          setLoading(false);
          return;
        }

        // 공백이 제거된 컬럼 키로 JSON 데이터 표준화
        const normalizedJson = json.map((row) => {
          const newRow: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            newRow[k.trim()] = row[k];
          });
          return newRow;
        });

        let dataToUpdate = normalizedJson;
        if (mode === "BUDGET" && viewMode === "unit" && selectedUnitId) {
          dataToUpdate = normalizedJson.filter((row) => {
            const unitIdInRow = row["단위과제ID"] ? String(row["단위과제ID"]).trim() : "";
            return unitIdInRow === String(selectedUnitId).trim();
          });

          if (dataToUpdate.length === 0) {
            alert(`[업로드 실패] 업로드된 파일에 현재 선택된 단위과제("${selectedUnitId}")의 예산 데이터가 존재하지 않습니다.`);
            setLoading(false);
            return;
          }
        }

        onUpdateData(dataToUpdate, isBudgetUpdate ? "BUDGET" : "KPI");
        setSuccess(true);

        if (mode === "BUDGET" && viewMode === "unit" && selectedUnitId) {
          alert(`[업로드 완료] 현재 선택된 단위과제("${selectedUnitId}")의 예산 데이터 ${dataToUpdate.length}건이 성공적으로 업데이트되었습니다.`);
        } else if (mode === "BUDGET") {
          alert(`[업로드 완료] 전체 단위과제의 예산 데이터 ${dataToUpdate.length}건이 일괄 업데이트되었습니다.`);
        } else {
          alert(`[업로드 완료] 성과지표 데이터 ${dataToUpdate.length}건이 성공적으로 업데이트되었습니다.`);
        }

        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error(err);
        alert("엑셀 파일 처리 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
        setDragActive(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseExcel(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      parseExcel(e.target.files[0]);
    }
  };

  // 모드별 맞춤형 샘플 데이터 엑셀 생성 및 다운로드 실행
  const downloadSample = (type: "BUDGET" | "KPI") => {
    const wb = XLSX.utils.book_new();
    let data: any[] = [];
    let filename = "";

    if (type === "BUDGET") {
      filename = "ANCHOR_재원구분_예산양식_2026.xlsx";
      if (viewMode === "unit" && selectedUnitId) {
        filename = `ANCHOR_재원구분_예산양식_2026_${selectedUnitId}.xlsx`;
      }
      projects.forEach((p) => {
        if (p.units && Array.isArray(p.units)) {
          p.units.forEach((u: any) => {
            if (viewMode === "unit" && selectedUnitId && u.id !== selectedUnitId) {
              return;
            }
            if (u.programs && Array.isArray(u.programs)) {
              u.programs.forEach((prog: any) => {
                const py = prog.years?.[selectedYear] || {};

                const standardCategories = [
                  "인건비", "장학금", "프로그램개발운영비", "환경개선비",
                  "실험실습장비비", "지역연계협업비", "기업지원협력비",
                  "성과활용확산비", "기타사업운영경비", "간접비"
                ];

                const getBriefCategoryLabel = (catLabel: string) => {
                  if (catLabel === "교육∙연구 프로그램 개발∙운영비") return "프로그램개발운영비";
                  if (catLabel === "교육∙연구 환경개선비") return "환경개선비";
                  if (catLabel === "실험∙실습장비 및 기자재 구입∙운영비") return "실험실습장비비";
                  if (catLabel === "지역 연계∙협업 지원비") return "지역연계협업비";
                  if (catLabel === "기업 지원∙협력 활동비") return "기업지원협력비";
                  if (catLabel === "성과 활용∙확산 지원비") return "성과활용확산비";
                  if (catLabel === "그 밖의 사업운영경비") return "기타사업운영경비";
                  return catLabel;
                };

                // 본예산 행 빌드
                const mainCatMap: Record<string, number> = {};
                standardCategories.forEach(cat => { mainCatMap[cat] = 0; });
                if (py.budget_categories && Array.isArray(py.budget_categories)) {
                  py.budget_categories.forEach((c: any) => {
                    const catLabel = getBriefCategoryLabel(c.category);
                    if (standardCategories.includes(catLabel)) {
                      mainCatMap[catLabel] = c.budget !== undefined ? c.budget / 1000000 : 0;
                    }
                  });
                }

                data.push({
                  "단위과제ID": u.id,
                  "프로그램ID": prog.id,
                  "프로그램명": prog.title,
                  "예산구분": "본예산",
                  "국고": py.budget_national !== undefined ? py.budget_national / 1000000 : 0,
                  "지자체시비": py.budget_city !== undefined ? py.budget_city / 1000000 : 0,
                  "외부사업비": py.budget_external !== undefined ? py.budget_external / 1000000 : (py.external_budget !== undefined ? py.external_budget / 1000000 : 0),
                  ...mainCatMap
                });

                // 이월예산 행 빌드
                const carryCatMap: Record<string, number> = {};
                standardCategories.forEach(cat => { carryCatMap[cat] = 0; });
                if (selectedYear >= 2 && py.budget_categories && Array.isArray(py.budget_categories)) {
                  py.budget_categories.forEach((c: any) => {
                    const catLabel = getBriefCategoryLabel(c.category);
                    if (standardCategories.includes(catLabel)) {
                      carryCatMap[catLabel] = c.budget_carry !== undefined ? c.budget_carry / 1000000 : 0;
                    }
                  });
                }

                data.push({
                  "단위과제ID": u.id,
                  "프로그램ID": prog.id,
                  "프로그램명": prog.title,
                  "예산구분": "이월예산",
                  "국고": selectedYear === 1 ? 0 : (py.budget_carry_national !== undefined ? py.budget_carry_national / 1000000 : 0),
                  "지자체시비": selectedYear === 1 ? 0 : (py.budget_carry_city !== undefined ? py.budget_carry_city / 1000000 : 0),
                  "외부사업비": selectedYear === 1 ? 0 : (py.budget_carry_external !== undefined ? py.budget_carry_external / 1000000 : 0),
                  ...carryCatMap
                });
              });
            }
          });
        }
      });
    } else {
      filename = `ANCHOR_성과지표_관리양식_${selectedYear}차년도.xlsx`;
      projects.forEach((p) => {
        if (p.units && Array.isArray(p.units)) {
          p.units.forEach((u: any) => {
            if (u.kpis && Array.isArray(u.kpis)) {
              u.kpis.forEach((k: any) => {
                if (k.subItems && Array.isArray(k.subItems)) {
                  k.subItems.forEach((sub: any) => {
                    const yData = sub.years?.[selectedYear] || { target: 0, current: 0 };
                    data.push({
                      "단위과제ID": u.id,
                      "지표ID": k.id,
                      "지표명": k.name,
                      "세부항목ID": sub.id,
                      "세부항목명": sub.name,
                      "목푯값": yData.target,
                      "실적값(현재값)": yData.current,
                      "단위": sub.unit,
                      "주관부서": k.owner
                    });
                  });
                } else {
                  data.push({
                    "단위과제ID": u.id,
                    "지표ID": k.id,
                    "지표명": k.name,
                    "세부항목ID": `${k.id}-1`,
                    "세부항목명": k.name,
                    "목푯값": k.target,
                    "실적값(현재값)": k.current,
                    "단위": "%",
                    "주관부서": k.owner
                  });
                }
              });
            }
          });
        }
      });
    }

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
    const a = document.createElement("a");
    a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="glass-card" style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>
            {mode === "BUDGET" ? "예산 및 프로그램 엑셀 데이터 업데이트" : "성과지표 엑셀 데이터 업데이트"}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            {mode === "BUDGET"
              ? "2026년 본사업비/2025년 이월비 재원이 구분된 예산 엑셀 양식을 업로드하여 실시간으로 반영합니다."
              : "각 단위과제별 성과지표 및 세부항목의 목표치/실적 엑셀 양식을 업로드하여 실시간으로 반영합니다."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {mode === "BUDGET" ? (
            <button className="btn-primary" style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} onClick={() => downloadSample("BUDGET")}>
              <Download size={16} />
              <span>
                {viewMode === "unit" && selectedUnitId
                  ? `재원별 예산양식 받기 (${selectedUnitId} 전용)`
                  : "재원별 예산양식 받기 (전체 목록)"}
              </span>
            </button>
          ) : (
            <button className="btn-primary" style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} onClick={() => downloadSample("KPI")}>
              <Download size={16} />
              <span>성과지표 양식 받기</span>
            </button>
          )}
        </div>
      </div>

      <div
        className={`dropzone ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{ position: "relative" }}
      >
        <input
          type="file"
          id="excel-file-input"
          accept=".xlsx, .xls"
          onChange={handleChange}
          style={{ display: "none" }}
        />

        {loading && (
          <div className="loading-overlay">
            <div className="spinner" style={{ border: "4px solid rgba(255,255,255,0.1)", borderLeftColor: "var(--accent-color)", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite" }}></div>
          </div>
        )}

        <label htmlFor="excel-file-input" style={{ cursor: "pointer", display: "block" }}>
          {success ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", color: "var(--success-color)" }}>
              <Check size={48} />
              <span style={{ fontWeight: "700" }}>
                {mode === "BUDGET"
                  ? "업데이트 완료! 재원별 예산 및 프로그램 데이터가 반영되었습니다."
                  : "업데이트 완료! 성과지표의 목표 및 실적 데이터가 반영되었습니다."}
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <FileSpreadsheet size={48} style={{ color: "var(--accent-color)" }} />
              <div>
                <span style={{ fontWeight: "700" }}>파일을 끌어다 놓거나, 클릭하여 찾아보기</span>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
                  지원 포맷: .xlsx, .xls ({mode === "BUDGET" ? "앵커사업 재원 구분 예산양식" : "성과지표 관리양식"})
                </p>
              </div>
            </div>
          )}
        </label>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
