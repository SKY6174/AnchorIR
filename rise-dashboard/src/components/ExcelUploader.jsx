import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet, Check } from "lucide-react";

/**
 * ExcelUploader Component
 * 엑셀 파일을 통해 실시간으로 데이터를 일괄 업데이트하고 양식을 내려받습니다.
 * - mode === "BUDGET": 예산 및 프로그램 전용 엑셀 업로더
 * - mode === "KPI": 성과지표(목표/실적) 전용 엑셀 업로더
 */
export default function ExcelUploader({ onUpdateData, projects, selectedYear = 2, mode = "BUDGET" }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 드래그 앤 드롭 상태 관리 핸들러
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // 엑셀 파싱 및 정합성 검증 로직
  const parseExcel = (file) => {
    setLoading(true);
    setSuccess(false);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const json = XLSX.utils.sheet_to_json(worksheet);

        let isBudgetUpdate = false;
        let isKpiUpdate = false;

        // 엑셀 컬럼 헤더(키) 값을 검사하여 예산인지 KPI인지 판별
        if (json.length > 0) {
          const keys = Object.keys(json[0]).map((k) => k.trim());
          if (keys.includes("프로그램ID") && (keys.includes("2026년본사업비_집행") || keys.includes("2025년이월비_집행"))) {
            isBudgetUpdate = true;
          } else if (keys.includes("세부항목ID") && keys.includes("실적값(현재값)")) {
            isKpiUpdate = true;
          }
        }

        // 현재 업로더 모드와 일치하는 파일인지 엄격하게 검증 (불일치 시 업로드 차단)
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

        // 공백이 제거된 컬럼 키로 JSON 데이터 키를 동기화하여 표준화
        const normalizedJson = json.map((row) => {
          const newRow = {};
          Object.keys(row).forEach((k) => {
            newRow[k.trim()] = row[k];
          });
          return newRow;
        });

        // App.jsx의 데이터 갱신 로직으로 파싱된 배열 데이터와 업데이트 타입 전달
        onUpdateData(normalizedJson, isBudgetUpdate ? "BUDGET" : "KPI");
        setSuccess(true);
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

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseExcel(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      parseExcel(e.target.files[0]);
    }
  };

  // 문자열을 ArrayBuffer로 변환하는 시트 다운로드 헬퍼
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  // 모드별 맞춤형 샘플 데이터 엑셀 생성 및 다운로드 실행
  const downloadSample = (type) => {
    const wb = XLSX.utils.book_new();
    let data = [];
    let filename = "";

    if (type === "BUDGET") {
      filename = "ANCHOR_재원구분_예산양식_2026.xlsx";
      projects.forEach((p) => {
        p.units.forEach((u) => {
          u.programs.forEach((prog) => {
            data.push({
              "단위과제ID": u.id,
              "프로그램ID": prog.id,
              "프로그램명": prog.title,
              "2026년본사업비_배정": prog.budget_2026 || 0,
              "2026년본사업비_집행": prog.spent_2026 || 0,
              "2025년이월비_배정": prog.budget_2025_carry || 0,
              "2025년이월비_집행": prog.spent_2025_carry || 0
            });
          });
        });
      });
    } else {
      filename = `ANCHOR_성과지표_관리양식_${selectedYear}차년도.xlsx`;
      projects.forEach((p) => {
        p.units.forEach((u) => {
          u.kpis.forEach((k) => {
            if (k.subItems && Array.isArray(k.subItems)) {
              k.subItems.forEach((sub) => {
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
        });
      });
    }

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    const blob = new Blob([s2ab(wbout)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card" style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>
            {mode === "BUDGET" ? "예산 및 프로그램 엑셀 데이터 업데이트" : "성과지표 엑셀 데이터 업데이트"}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary-dark)", marginTop: "0.2rem" }}>
            {mode === "BUDGET"
              ? "2026년 본사업비/2025년 이월비 재원이 구분된 예산 엑셀 양식을 업로드하여 실시간으로 반영합니다."
              : "각 단위과제별 성과지표 및 세부항목의 목표치/실적 엑셀 양식을 업로드하여 실시간으로 반영합니다."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {mode === "BUDGET" ? (
            <button className="btn-primary" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", color: "var(--text-primary-dark)" }} onClick={() => downloadSample("BUDGET")}>
              <Download size={16} />
              <span>재원별 예산양식 받기</span>
            </button>
          ) : (
            <button className="btn-primary" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color-dark)", color: "var(--text-primary-dark)" }} onClick={() => downloadSample("KPI")}>
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
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary-dark)", marginTop: "0.3rem" }}>
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
