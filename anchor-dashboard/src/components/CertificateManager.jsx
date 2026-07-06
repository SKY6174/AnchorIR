import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, Edit, Trash, FileText, Upload, X, AlertTriangle, Download, FileCheck } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "../supabaseClient"; // Supabase 클라이언트 연동 추가

/**
 * CertificateManager:
 * RISE 사업 참여자들의 교육이수증 및 확인서 발급 내역을 단독으로 기록하고 보존하는 컴포넌트입니다.
 * 이수증 등록/수정, 엑셀 다운로드, 개별 사본 업로드 및 사본 파일명 기반 일괄 자동 매핑 기능을 제공합니다.
 */
export default function CertificateManager({
  projects = [],
  certificates = [],
  selectedYear,
  onAddCertificate,
  onUpdateCertificate,
  onDeleteCertificate,
  setCertificates,
  currentRole
}) {
  // 1. 이수증 입력 폼 및 개별 등록/수정 모달 상태
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState(null);
  const [certNo, setCertNo] = useState("");
  const [certDept, setCertDept] = useState("");
  const [certName, setCertName] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certIssuer, setCertIssuer] = useState("사업단장");
  const [certFileName, setCertFileName] = useState("");
  const [certFileData, setCertFileData] = useState("");

  // 2. 사본 파일명 기반 일괄 매핑 모달 상태
  const [isCertificateBatchModalOpen, setIsCertificateBatchModalOpen] = useState(false);
  const [batchCertificateResults, setBatchCertificateResults] = useState([]);

  // 스토리지 파일 대량 업로드 로딩 상태 관리
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");

  // 3. 정렬 상태 설정
  const [certSortConfig, setCertSortConfig] = useState({ key: "date", direction: "asc" });

  // 4. 엑셀 다운로드 캐시용 URL 상태
  const [excelDownloadUrl, setExcelDownloadUrl] = useState("");

  /**
   * cleanName: 파일명에서 공백 및 불필요한 단체 지시어(주식회사, (주) 등)를 제거하여
   * 순수한 이름 텍스트 대조가 가능하도록 정화하는 헬퍼 함수입니다.
   */
  const cleanName = (name) => {
    if (!name) return "";
    let temp = name.replace(/\s/g, "");
    const keywords = ["(주)", "(유)", "(합)", "(합자)", "(재)", "(사)", "(재단)", "(사단)", "주식회사", "유한회사", "㈜", "㈔", "㈎"];
    keywords.forEach(kw => {
      temp = temp.replaceAll(kw, "");
    });
    return temp.replace(/[\(\)]/g, "");
  };

  /**
   * getYearFromDate: 선택된 발급일자로부터 RISE 사업 기획 체계 연차(1~5차년도)를 자동 도출합니다.
   * RISE 회계연도 기준(3월 1일 ~ 익년 2월 말일)에 기반합니다.
   */
  const getYearFromDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(`${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    if (month >= 3) {
      return year - 2024;
    } else {
      return year - 2025;
    }
  };

  // 현재 연차(selectedYear)에 해당하는 이수증만 필터링합니다.
  const filteredCertificates = certificates.filter(c => c.year === selectedYear);

  // 정렬 컬럼 토글 핸들러
  const requestCertSort = (key) => {
    let direction = "asc";
    if (certSortConfig.key === key && certSortConfig.direction === "asc") {
      direction = "desc";
    }
    setCertSortConfig({ key, direction });
  };

  // 정렬 조건에 맞는 정렬된 이수증 목록 반환
  const getSortedCertificates = () => {
    const sorted = [...filteredCertificates];
    const key = certSortConfig.key;
    if (key) {
      sorted.sort((a, b) => {
        let valA = (key === "date" ? a.issueDate : a[key]) || "";
        let valB = (key === "date" ? b.issueDate : b[key]) || "";
        if (typeof valA === "string" && typeof valB === "string") {
          return certSortConfig.direction === "asc"
            ? valA.localeCompare(valB, undefined, { numeric: true })
            : valB.localeCompare(valA, undefined, { numeric: true });
        }
        if (valA < valB) return certSortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return certSortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  const sortedCertificates = getSortedCertificates();

  // 이수증 등록/수정 입력폼 내용 초기화 헬퍼
  const resetCertForm = () => {
    setEditingCertId(null);
    setCertNo("");
    setCertDept("");
    setCertName("");
    setCertDate("");
    setCertIssuer("사업단장");
    setCertFileName("");
    setCertFileData("");
  };

  // 이수증 개별 등록 및 수정 제출 핸들러
  const handleCertSubmit = (e) => {
    e.preventDefault();
    if (!certNo.trim()) return alert("발급번호를 입력해 주세요.");
    if (!certDept.trim()) return alert("발급대상 소속을 입력해 주세요.");
    if (!certName.trim()) return alert("발급대상 성명을 입력해 주세요.");
    if (!certDate) return alert("발급일을 선택해 주세요.");

    const calculatedYear = getYearFromDate(certDate);
    if (!calculatedYear || calculatedYear < 1 || calculatedYear > 5) {
      alert("유효한 RISE 사업 기간 내의 날짜를 선택해 주세요. (2025년 3월 이후)");
      return;
    }

    const payload = {
      year: calculatedYear,
      certNo: certNo.trim(),
      recipientDept: certDept.trim(),
      recipientName: certName.trim(),
      issueDate: certDate,
      issuer: certIssuer,
      fileName: certFileName,
      fileData: certFileData
    };

    if (editingCertId) {
      onUpdateCertificate(editingCertId, payload);
    } else {
      onAddCertificate(payload);
    }
    setIsCertModalOpen(false);
    resetCertForm();
  };

  // 모의 파일 업로드 (Supabase Storage 버킷 업로드 연동)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const normalizedName = file.name.normalize("NFC");
      setCertFileName("업로드 중...");
      try {
        // 한글 깨짐 및 Storage 특수기호 에러(Invalid key) 방지를 위해 물리 파일명은 영문/숫자 고유 ID로 치환
        const fileExt = normalizedName.substring(normalizedName.lastIndexOf(".")).toLowerCase();
        const storagePath = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExt}`; // certificates 전용 버킷 루트에 업로드
        const { data, error } = await supabase.storage
          .from("certificates") // certificates 버킷명 반영
          .upload(storagePath, file);

        if (error) throw error;

        // 업로드 완료 후 공개 읽기 주소(Public URL) 획득
        const { data: { publicUrl } } = supabase.storage
          .from("certificates")
          .getPublicUrl(data.path);

        setCertFileName(normalizedName);
        setCertFileData(publicUrl); // DB 및 상태값에 URL 저장
      } catch (err) {
        console.error("Storage upload error:", err);
        alert("사본 파일 업로드에 실패했습니다. Storage 버킷 상태와 정책을 확인해 주세요.");
        setCertFileName("");
        setCertFileData("");
      }
    }
  };

  // 이수증 파일 사본 열기 핸들러 (원격 URL 및 Base64 하이브리드 지원)
  const handleViewFile = (fileData) => {
    try {
      if (!fileData) {
        window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank");
        return;
      }
      
      // 만약 저장된 데이터가 웹 URL 주소 형태라면 바로 새창으로 엽니다.
      if (fileData.startsWith("http://") || fileData.startsWith("https://")) {
        window.open(fileData, "_blank");
        return;
      }

      // 하위 호환성 유지: 기존의 Base64 디코딩 방식 처리
      let mimeType = "application/pdf";
      let base64 = fileData;
      const parts = fileData.split(",");
      if (parts.length > 1) {
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (mimeMatch) mimeType = mimeMatch[1];
        base64 = parts[1];
      }
      const byteCharacters = window.atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      alert("파일 사본을 여는 도중 문제가 발생했습니다.");
    }
  };

  // 이수증 파일 일괄 업로드 매핑 핸들러 (합집합 매칭 적용)
  const handleBatchCertificateImport = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }

    const results = [];

    for (const file of files) {
      const fileName = file.name.normalize("NFC");
      const fileBaseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      const fileClean = cleanName(fileBaseName);

      let matchedTarget = null;
      let isMatched = false;
      let matchBreakdown = "매칭 실패";

      // 현재 차년도의 모든 이수증 대장을 순회하며 포함 관계 체크
      certificates.forEach(item => {
        if (isMatched) return;

        let certNoMatch = false;
        let nameMatch = false;

        // A. 발급번호 비교
        if (item.certNo && fileBaseName.includes(item.certNo)) {
          certNoMatch = true;
        }

        // B. 성명 비교
        if (item.recipientName) {
          const recClean = cleanName(item.recipientName);
          if (recClean && fileClean.includes(recClean)) {
            nameMatch = true;
          }
        }

        // [합집합]: 발급번호 또는 수급자명이 이름 내에 있는 경우 통과
        if (certNoMatch || nameMatch) {
          isMatched = true;
          matchedTarget = item;
          matchBreakdown = certNoMatch ? "발급번호 일치" : "성명 일치";
        }
      });

      const previewData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

      if (isMatched && matchedTarget) {
        results.push({
          fileName,
          file, // Storage 업로드용 원본 파일 객체 보관
          fileData: previewData,
          status: "success",
          targetId: matchedTarget.id,
          targetDesc: `${matchedTarget.recipientName} [${matchedTarget.recipientDept}] (${matchedTarget.issueDate || matchedTarget.date})`,
          score: 100,
          details: {
            extractedOrg: matchedTarget.certNo || "없음",
            extractedName: matchedTarget.recipientName || "없음",
            breakdown: matchBreakdown
          }
        });
      } else {
        results.push({
          fileName,
          file,
          fileData: previewData,
          status: "fail",
          targetId: null,
          targetDesc: "일치하는 이수증 데이터를 찾지 못함 (발급번호 또는 성명 불일치)",
          score: 0,
          details: {
            extractedOrg: "없음",
            extractedName: "없음",
            breakdown: "조건 미달 (파일명 매칭 정보 없음)"
          }
        });
      }
    }

    setBatchCertificateResults(results);
    setIsCertificateBatchModalOpen(true);
    e.target.value = "";
  };

  // 분석된 일괄 파일 매핑 반영 핸들러 (Supabase Storage 실시간 순차 업로드 구현)
  const handleApplyBatchCertificates = async () => {
    const successItems = batchCertificateResults.filter(res => res.status === "success" && res.targetId);
    if (successItems.length === 0) return;

    let appliedCount = 0;

    const isConfirmed = window.confirm(`매칭 성공된 ${successItems.length}개의 파일을 Supabase Storage 저장소에 순서대로 업로드하고 동기화할까요?`);
    if (!isConfirmed) return;

    setIsUploading(true);
    setUploadStatusText(`업로드 대기 중... (0 / ${successItems.length})`);

    const uploadResults = [];

    // 병목 및 타임아웃 예방을 위해 1건씩 안전하게 순차 업로드합니다.
    for (let i = 0; i < successItems.length; i++) {
      const res = successItems[i];
      setUploadStatusText(`파일 전송 중... (${i + 1} / ${successItems.length})\n[${res.fileName}]`);

      try {
        const targetFile = res.file;
        if (!targetFile) continue;

        const normalizedName = targetFile.name.normalize("NFC");
        // 한글 깨짐 및 Storage 특수기호 에러(Invalid key) 방지를 위해 물리 파일명은 영문/숫자 고유 ID로 치환
        const fileExt = normalizedName.substring(normalizedName.lastIndexOf(".")).toLowerCase();
        const storagePath = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExt}`;

        const { data, error } = await supabase.storage
          .from("certificates")
          .upload(storagePath, targetFile);

        if (error) throw error;

        // 공개 읽기 주소(Public URL) 획득
        const { data: { publicUrl } } = supabase.storage
          .from("certificates")
          .getPublicUrl(data.path);

        uploadResults.push({
          targetId: res.targetId,
          fileName: normalizedName,
          publicUrl
        });
      } catch (err) {
        console.error("Storage upload failed for file:", res.fileName, err);
      }

      // 서버 과부하 방지 미세 대기
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setIsUploading(false);

    const successMap = new Map();
    uploadResults.forEach(res => {
      if (res) {
        successMap.set(res.targetId, res);
      }
    });

    if (successMap.size === 0) {
      alert("파일 저장소 업로드에 모두 실패했습니다. Supabase Storage 버킷 정책 및 파일 형식(Allowed MIME Types)을 확인해 주세요.");
      return;
    }

    setCertificates(prev =>
      prev.map(item => {
        const match = successMap.get(item.id);
        if (match) {
          appliedCount++;
          return {
            ...item,
            fileName: match.fileName,
            fileData: match.publicUrl // DB 저장용 URL 저장
          };
        }
        return item;
      })
    );

    alert(`총 ${appliedCount}건의 이수증 사본 파일이 스토리지 업로드 및 반영 완료되었습니다.`);
    setIsCertificateBatchModalOpen(false);
    setBatchCertificateResults([]);
  };

  // 엑셀 업로드용 서식 템플릿 다운로드
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "발급번호": "2025-UC-001",
        "소속": "컴퓨터정보과",
        "성명": "홍길동",
        "발급일자": "2025-05-15",
        "발급기관": "사업단장"
      }
    ];

    const fileName = `UC_ANCHOR_이수증_업로드_서식.xlsx`;

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "이수증서식");
    ws["!cols"] = Array(5).fill({ wch: 25 });

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
    const a = document.createElement("a");
    a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 엑셀 업로드 (데이터 대량 가져오기)
  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(ws);

        if (rawRows.length === 0) {
          alert("엑셀 파일에 데이터가 존재하지 않습니다.");
          return;
        }

        let importedCount = 0;

        rawRows.forEach((row) => {
          const certNoVal = row["발급번호"];
          const deptVal = row["소속"];
          const nameVal = row["성명"];
          const dateVal = row["발급일자"];

          if (!certNoVal || !deptVal || !nameVal || !dateVal) {
            return;
          }

          const calculatedYear = getYearFromDate(String(dateVal).trim());
          const newCert = {
            year: calculatedYear || selectedYear,
            certNo: String(certNoVal).trim(),
            recipientDept: String(deptVal).trim(),
            recipientName: String(nameVal).trim(),
            issueDate: String(dateVal).trim(),
            issuer: row["발급기관"] ? String(row["발급기관"]).trim() : "사업단장",
            fileName: "",
            fileData: ""
          };

          onAddCertificate(newCert);
          importedCount++;
        });

        alert(`${importedCount}개의 이수증 정보가 성공적으로 적재되었습니다.`);
      } catch (err) {
        console.error("Excel Import Error:", err);
        alert("엑셀 파일 파싱 중 에러가 발생했습니다. 규정된 서식 파일과 컬럼 헤더가 일치하는지 확인해 주세요.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  // 엑셀 다운로드 Caching URL 갱신
  useEffect(() => {
    if (sortedCertificates.length === 0) {
      setExcelDownloadUrl("");
      return;
    }

    const excelData = sortedCertificates.map((cert) => ({
      "발급번호": cert.certNo,
      "소속 부서": cert.recipientDept,
      "성명": cert.recipientName,
      "발급일자": cert.issueDate,
      "발급주체": cert.issuer,
      "사본 첨부여부": cert.fileName ? "유 (첨부됨)" : "무"
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Certificates");

    const wscols = [
      { wch: 25 }, // 발급번호
      { wch: 25 }, // 소속
      { wch: 15 }, // 성명
      { wch: 15 }, // 발급일
      { wch: 15 }, // 발급주체
      { wch: 15 }  // 사본
    ];
    worksheet["!cols"] = wscols;

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    setExcelDownloadUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [sortedCertificates]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      {/* 이수증 툴바 영역 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "1.0rem", fontWeight: "800", color: "var(--text-primary)" }}>📄 {selectedYear}차년도 이수증 발급 내역</h2>
          <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>교육과정 및 세미나 이수증 발급 대장을 영속 보존합니다.</p>
        </div>

        {/* 신규 등록 & 엑셀 다운로드 제어부 */}
        {(currentRole.rank <= 2) && (
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            {/* 엑셀 서식 다운로드 */}
            <button
              onClick={handleDownloadTemplate}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.35rem 0.7rem",
                fontSize: "0.7rem",
                background: "var(--input-bg)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.8)",
                borderRadius: "0.25rem",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              <FileText size={12} /> 엑셀 서식
            </button>

            {/* 엑셀 업로드 */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.35rem 0.7rem",
                fontSize: "0.7rem",
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                color: "#818CF8",
                borderRadius: "0.25rem",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              <Upload size={12} /> 엑셀 업로드
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelImport}
                style={{ display: "none" }}
              />
            </label>

            {/* 사본 일괄 매핑 */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.35rem 0.7rem",
                fontSize: "0.7rem",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                color: "#34D399",
                borderRadius: "0.25rem",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              <FileCheck size={12} /> 사본 일괄 매핑
              <input
                type="file"
                multiple
                accept=".pdf, .hwp, .hwpx, .jpg, .jpeg, .png"
                onChange={handleBatchCertificateImport}
                style={{ display: "none" }}
              />
            </label>

            {/* 엑셀 다운로드 */}
            <a
              href={excelDownloadUrl || "#"}
              download={excelDownloadUrl ? `Certificate_List_Year_${selectedYear}.xlsx` : undefined}
              onClick={(e) => {
                if (!excelDownloadUrl) {
                  e.preventDefault();
                  alert("다운로드할 데이터가 없습니다.");
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.35rem 0.7rem",
                fontSize: "0.7rem",
                background: "#16a34a",
                border: "none",
                color: "white",
                borderRadius: "0.25rem",
                cursor: excelDownloadUrl ? "pointer" : "not-allowed",
                fontWeight: "700",
                textDecoration: "none"
              }}
            >
              <Download size={12} /> 엑셀 다운로드
            </a>

            {/* 신규 추가 */}
            {currentRole.id !== "GUEST" && (
              <button
                className="btn-primary"
                onClick={() => { resetCertForm(); setIsCertModalOpen(true); }}
                style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.7rem", fontSize: "0.7rem" }}
              >
                <Plus size={14} /> 신규 발급 등록
              </button>
            )}
          </div>
        )}
      </div>

      {/* 이수증 리스트 테이블 */}
      <div className="table-container" style={{ border: "1px solid var(--border-color)", borderRadius: "0.5rem", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", color: "var(--text-primary)" }}>
          <thead>
            <tr style={{ background: "var(--border-color, rgba(255,255,255,0.03))", borderBottom: "1px solid var(--border-color-dark)" }}>
              <th onClick={() => requestCertSort("certNo")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "20%", cursor: "pointer" }}>
                발급번호 {certSortConfig.key === "certNo" ? (certSortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
              </th>
              <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "35%" }}>발급대상 인적사항</th>
              <th onClick={() => requestCertSort("date")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "15%", cursor: "pointer" }}>
                발급일 {certSortConfig.key === "date" ? (certSortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
              </th>
              <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "18%" }}>발급주체</th>
              <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "6%" }}>사본</th>
              {currentRole.rank <= 2 && <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "6%" }}>제어</th>}
            </tr>
          </thead>
          <tbody>
            {sortedCertificates.length === 0 ? (
              <tr>
                <td colSpan={currentRole.rank <= 2 ? 6 : 5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                  등록된 이수증 발급 내역이 없습니다.
                </td>
              </tr>
            ) : (
              sortedCertificates.map((cert) => (
                <tr key={cert.id} style={{ borderBottom: "1px solid var(--border-color-dark)", background: "transparent" }}>
                  <td style={{ padding: "0.6rem 0.8rem", fontWeight: "700" }}>{cert.certNo}</td>
                  <td style={{ padding: "0.6rem 0.8rem" }}>
                    <span style={{ color: "var(--text-secondary)", marginRight: "0.4rem" }}>[{cert.recipientDept}]</span>
                    <strong style={{ color: "var(--text-primary)" }}>{cert.recipientName}</strong>
                  </td>
                  <td style={{ padding: "0.6rem 0.8rem" }}>{cert.issueDate}</td>
                  <td style={{ padding: "0.6rem 0.8rem" }}>
                    <span style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", padding: "0.15rem 0.4rem", borderRadius: "0.25rem", fontSize: "0.65rem", fontWeight: "700" }}>{cert.issuer}</span>
                  </td>
                  <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                    {cert.fileName ? (
                      <FileCheck size={16} style={{ color: "#34d399", cursor: "pointer" }} onClick={() => handleViewFile(cert.fileData)} />
                    ) : "-"}
                  </td>
                  {currentRole.rank <= 2 && (
                    <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                        {currentRole.id !== "GUEST" && (
                          <>
                            <button
                              onClick={() => {
                                setEditingCertId(cert.id);
                                setCertNo(cert.certNo || "");
                                setCertDept(cert.recipientDept || "");
                                setCertName(cert.recipientName || "");
                                setCertDate(cert.issueDate || "");
                                setCertIssuer(cert.issuer || "사업단장");
                                setCertFileName(cert.fileName || "");
                                setCertFileData(cert.fileData || "");
                                setIsCertModalOpen(true);
                              }}
                              style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
                              title="수정"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => { if (confirm("이 이수증을 삭제하시겠습니까?")) onDeleteCertificate(cert.id); }}
                              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                              title="삭제"
                            >
                              <Trash size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 이수증 개별 등록 및 수정 모달 */}
      {isCertModalOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", overflowY: "auto", padding: "2rem 1rem" }}>
          <div style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", width: "100%", maxWidth: "500px", maxHeight: "85vh", display: "flex", flexDirection: "column", color: "var(--text-primary)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800" }}>📄 {editingCertId ? "이수증 정보 수정" : "신규 이수증 등록"}</h3>
              <button onClick={() => setIsCertModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCertSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>발급번호</label>
                <input type="text" placeholder="예: 제 2026-이수-0001 호" value={certNo} onChange={(e) => setCertNo(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>발급대상 소속</label>
                  <input type="text" placeholder="예: 울산과학대학교" value={certDept} onChange={(e) => setCertDept(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>발급대상 성명</label>
                  <input type="text" placeholder="예: 홍길동" value={certName} onChange={(e) => setCertName(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>발급일자</label>
                  <input type="date" value={certDate} onChange={(e) => setCertDate(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>발급주체</label>
                  <select value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.25rem" }}>
                    <option value="사업단장">사업단장</option>
                    <option value="늘봄누리센터장">늘봄누리센터장</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>증서 사본 업로드</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.6rem", fontSize: "0.7rem", background: "var(--input-bg)", color: "var(--text-primary)", borderRadius: "0.25rem", cursor: "pointer", border: "1px solid var(--border-color)" }}>
                    <Upload size={14} /> 파일 선택
                    <input type="file" onChange={handleFileChange} style={{ display: "none" }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                  </label>
                  <span style={{ fontSize: "0.7rem", color: "#a1a1aa" }}>{certFileName ? `📁 ${certFileName}` : "선택된 파일 없음"}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsCertModalOpen(false)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>취소</button>
                <button type="submit" className="btn-primary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>저장하기</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 이수증 일괄 매핑 결과 리포트 모달 */}
      {isCertificateBatchModalOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", overflowY: "auto", padding: "2rem 1rem" }}>
          <div style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", width: "100%", maxWidth: "680px", maxHeight: "85vh", display: "flex", flexDirection: "column", color: "var(--text-primary)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FileCheck size={18} style={{ color: "#10B981" }} /> 이수증 사본 일괄 자동 매핑 리포트
              </h3>
              <button onClick={() => setIsCertificateBatchModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "1.25rem", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", background: "var(--input-bg)", padding: "0.75rem", borderRadius: "0.35rem", border: "1px solid var(--border-color)" }}>
                💡 [매칭 조건]: 파일 이름 내에 대시보드의 <b>발급번호</b> 또는 <b>수급자 성명</b> 중 하나라도 포함되어 있는 대상 데이터를 즉시 매핑 처리합니다.
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "700" }}>
                <span>분석 대상 파일: {batchCertificateResults.length}개</span>
                <span style={{ color: "#34D399" }}>매칭 성공: {batchCertificateResults.filter(r => r.status === "success").length}개</span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse", border: "1px solid var(--border-color)" }}>
                  <thead>
                    <tr style={{ background: "var(--input-bg)", borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "0.5rem", textAlign: "left", border: "1px solid var(--border-color)", width: "32%" }}>파일명</th>
                      <th style={{ padding: "0.5rem", textAlign: "left", border: "1px solid var(--border-color)", width: "38%" }}>추출 및 대조 정보</th>
                      <th style={{ padding: "0.5rem", textAlign: "left", border: "1px solid var(--border-color)", width: "20%" }}>매칭된 데이터 대상</th>
                      <th style={{ padding: "0.5rem", textAlign: "center", border: "1px solid var(--border-color)", width: "10%" }}>매칭 상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchCertificateResults.map((res, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border-color)", background: res.status === "success" ? "rgba(16,185,129,0.03)" : "rgba(239,68,68,0.03)" }}>
                        <td style={{ padding: "0.5rem", color: "var(--text-primary)", fontWeight: "500", border: "1px solid var(--border-color)" }}>
                          <div style={{ wordBreak: "break-all" }}>📁 {res.fileName}</div>
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid var(--border-color)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>
                              🔢 발급번호: <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>{res.details?.extractedOrg || "없음"}</span> |
                              👤 수급성명: <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>{res.details?.extractedName || "없음"}</span>
                            </div>
                            <div style={{
                              fontSize: "0.62rem",
                              color: res.status === "success" ? "#34d399" : "#f87171",
                              background: "rgba(255,255,255,0.02)",
                              padding: "0.15rem 0.35rem",
                              borderRadius: "0.2rem",
                              display: "inline-block",
                              width: "fit-content",
                              border: "1px solid var(--border-color)"
                            }}>
                              ⚡ 매칭방식: {res.details?.breakdown || "매칭 실패"}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid var(--border-color)" }}>
                          {res.status === "success" ? (
                            <span style={{ color: "#38bdf8", fontWeight: "600" }}>🟢 {res.targetDesc}</span>
                          ) : (
                            <span style={{ color: "#ef4444" }}>❌ {res.targetDesc}</span>
                          )}
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center", border: "1px solid var(--border-color)" }}>
                          <span style={{
                            padding: "0.15rem 0.4rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.6rem",
                            fontWeight: "700",
                            background: res.status === "success" ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
                            color: res.status === "success" ? "#34D399" : "#F87171"
                          }}>
                            {res.status === "success" ? "매칭완료" : "매칭실패"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color-dark)", padding: "0.85rem 1.25rem", flexShrink: 0 }}>
              <button type="button" className="btn-secondary" onClick={() => setIsCertificateBatchModalOpen(false)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>취소</button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleApplyBatchCertificates}
                disabled={batchCertificateResults.filter(r => r.status === "success").length === 0}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.75rem",
                  background: batchCertificateResults.filter(r => r.status === "success").length === 0 ? "#52525b" : "var(--primary-color)",
                  cursor: batchCertificateResults.filter(r => r.status === "success").length === 0 ? "not-allowed" : "pointer"
                }}
              >
                일괄 적용 및 저장하기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 스토리지 파일 대량 업로드 진행 상황 로딩 모달 오버레이 */}
      {isUploading && createPortal(
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.65)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          color: "var(--text-primary)",
          fontFamily: "sans-serif"
        }}>
          <div style={{
            backgroundColor: "#1e293b",
            padding: "30px 40px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.35)",
            border: "1px solid #334155",
            maxWidth: "400px",
            width: "90%"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "4px solid #38bdf8",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }} />
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>서버 저장소 업로드 중</h3>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px", whiteSpace: "pre-line", lineHeight: "1.5" }}>{uploadStatusText}</p>
          </div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>,
        document.body
      )}
    </div>
  );
}
