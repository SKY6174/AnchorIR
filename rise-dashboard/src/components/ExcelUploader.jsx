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
          if (keys.includes("프로그램ID") && (keys.includes("국고_본예산") || keys.includes("국고_이월예산"))) {
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
            const py = prog.years?.[selectedYear] || {};
            
            // 10대 표준 비목 매핑용 오브젝트 생성 및 초기화
            const catMap = {};
            const standardCategories = [
              "인건비", "장학금", "프로그램개발운영비", "환경개선비", 
              "실험실습장비비", "지역연계협업비", "기업지원협력비", 
              "성과활용확산비", "기타운영경비", "간접비"
            ];
            standardCategories.forEach(cat => {
              catMap[`${cat}_본예산`] = 0;
              catMap[`${cat}_이월비`] = 0;
            });
            
            // 기존 프로그램에 저장된 비목 정보 백만원 단위로 변환해 매핑 (0원 초과분만 적용하기 위해)
            if (py.budget_categories && Array.isArray(py.budget_categories)) {
              py.budget_categories.forEach(c => {
                let catLabel = c.category;
                // DB의 전체 비목명을 엑셀용 축약 라벨로 매핑
                if (catLabel === "교육∙연구 프로그램 개발∙운영비") catLabel = "프로그램개발운영비";
                if (catLabel === "교육∙연구 환경개선비") catLabel = "환경개선비";
                if (catLabel === "실험∙실습장비 및 기자재 구입∙운영비") catLabel = "실험실습장비비";
                if (catLabel === "지역 연계∙협업 지원비") catLabel = "지역연계협업비";
                if (catLabel === "기업 지원∙협력 활동비") catLabel = "기업지원협력비";
                if (catLabel === "성과 활용∙확산 지원비") catLabel = "성과활용확산비";
                if (catLabel === "그 밖의 사업운영경비") catLabel = "기타운영경비";
                
                if (standardCategories.includes(catLabel)) {
                  catMap[`${catLabel}_본예산`] = c.budget !== undefined ? c.budget / 1000000 : 0;
                  catMap[`${catLabel}_이월비`] = c.budget_carry !== undefined ? c.budget_carry / 1000000 : 0;
                }
              });
            }

            data.push({
              "단위과제ID": u.id,
              "프로그램ID": prog.id,
              "프로그램명": prog.title,
              
              // 재원별 본예산 배정 정보 (백만원)
              "국고_본예산": py.budget_national !== undefined ? py.budget_national / 1000000 : 0,
              "지자체시비_본예산": py.budget_city !== undefined ? py.budget_city / 1000000 : 0,
              "외부사업비_본예산": py.budget_external !== undefined ? py.budget_external / 1000000 : 0,
              
              // 재원별 이월예산 배정 정보 (백만원)
              "국고_이월예산": py.budget_carry_national !== undefined ? py.budget_carry_national / 1000000 : 0,
              "지자체시비_이월예산": py.budget_carry_city !== undefined ? py.budget_carry_city / 1000000 : 0,
              "외부사업비_이월예산": py.budget_carry_external !== undefined ? py.budget_carry_external / 1000000 : 0,
              
              // 비목별 예산 필드 나열
              ...catMap
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
    
    // type: "array"를 사용하여 라이브러리가 원시 ArrayBuffer(Uint8Array) 바이트 배열을 직접 리턴하게 합니다.
    // 이는 기존 binary 문자열 인코딩 및 s2ab(string to ArrayBuffer) 과정에서 한글명(프로그램/과제명)이 손상되어
    // 정상적인 엑셀 파일이 아닌 깨진 파일로 다운로드되던 결함을 완벽히 패치합니다.
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
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
