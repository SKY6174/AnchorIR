import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, Edit, Trash, FileText, Upload, X, AlertTriangle, Download, Award as AwardIcon, FileCheck } from "lucide-react";
import * as XLSX from "xlsx";

const AGREEMENT_CONTENTS_OPTIONS = [
  "주문식교육", "창업", "글로벌", "R&BD", "AIDX", "탄소중립",
  "복합재난", "평생교육", "늘봄", "지역현안해결", "보건복지서비스", "에코컬처", "도시재생"
];

const CENTERS_LIST = [
  "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "사업운영팀"
];

export default function AgreementManager({
  projects = [],
  agreements = [],
  certificates = [],
  awards = [],
  selectedYear,
  agreementsSubTab = "agreements",
  onChangeAgreementsSubTab,
  onAddAgreement,
  onUpdateAgreement,
  onDeleteAgreement,
  onAddCertificate,
  onUpdateCertificate,
  onDeleteCertificate,
  onAddAward,
  onUpdateAward,
  onDeleteAward,
  setAgreements,
  setCertificates,
  setAwards,
  currentRole
}) {
  // 1. 기존 협약서 모달 및 입력 폼 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [inputDate, setInputDate] = useState("");
  const [inputCenter, setInputCenter] = useState("ECC센터");
  const [inputOrganizations, setInputOrganizations] = useState([{ name: "", subject: "" }]);
  const [inputSubjectUniv, setInputSubjectUniv] = useState("단장");
  const [univSubjectType, setUnivSubjectType] = useState("단장");
  const [inputSubjectUnivDept, setInputSubjectUnivDept] = useState("");
  const [inputSubjectUnivName, setInputSubjectUnivName] = useState("");
  const [inputUnitId, setInputUnitId] = useState("");
  const [inputContents, setInputContents] = useState([]);
  const [inputFileName, setInputFileName] = useState("");
  const [inputFileData, setInputFileData] = useState("");
  const [inputAgreementType, setInputAgreementType] = useState("-");

  // 2. 이수증 모달 및 입력 폼 상태
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState(null);
  const [certNo, setCertNo] = useState("");
  const [certDept, setCertDept] = useState("");
  const [certName, setCertName] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certIssuer, setCertIssuer] = useState("사업단장");
  const [certFileName, setCertFileName] = useState("");
  const [certFileData, setCertFileData] = useState("");

  // 3. 상장 모달 및 입력 폼 상태
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [editingAwardId, setEditingAwardId] = useState(null);
  const [awardNo, setAwardNo] = useState("");
  const [awardDept, setAwardDept] = useState("");
  const [awardName, setAwardName] = useState("");
  const [awardDate, setAwardDate] = useState("");
  const [awardIssuer, setAwardIssuer] = useState("사업단장");
  const [awardFileName, setAwardFileName] = useState("");
  const [awardFileData, setAwardFileData] = useState("");

  // 4. 사본 일괄 매핑 모달 상태
  const [isBatchFileModalOpen, setIsBatchFileModalOpen] = useState(false);
  const [batchFileResults, setBatchFileResults] = useState([]);

  // 정렬 상태 관리
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "asc" });
  const [certSortConfig, setCertSortConfig] = useState({ key: "date", direction: "asc" });
  const [awardSortConfig, setAwardSortConfig] = useState({ key: "date", direction: "asc" });

  // 엑셀 다운로드 URL 상태
  const [excelDownloadUrl, setExcelDownloadUrl] = useState("");

  // 단위과제 로드 (기존 동일)
  const getAvailableUnits = () => {
    const unitsMap = new Map();
    const y1Mapping = {
      "A1가": { id: "A1", title: "지역과 미래를 만드는 UC-HYPER 전문기술인재 양성" },
      "A2": { id: "A2", title: "지역 창업 생태계 혁신을 위한 글로컬 창업 문화 조성" },
      "A3": { id: "D4", title: "지역산업 연계 글로벌 협력 거점 대학 육성" },
      "B1": { id: "B1", title: "중소·중견기업 맞춤형 기술지원·공동연구 활성화" },
      "B2": { id: "C2", title: "AID 역량강화 기반 지역산업 전환 지원" },
      "B3": { id: "C3", title: "교육·산업·복지가 조화로운 지속가능한 탄소중립" },
      "B4": { id: "C1", title: "복합재난 대응 산업안전·보건 관리시스템 개발" },
      "C1": { id: "B2", title: "U-LIFE 평생직업교육 플랫폼 구축" },
      "C2": { id: "D2", title: "내일을 밝히는 '위드아이' 늘봄 생태계 조성" },
      "D1": { id: "B3", title: "지역을 키우는 지역문제 해결 협력 체계 구축" },
      "D2": { id: "D1", title: "통합형 인재양성 기반 포용적 보건복지서비스 구현" },
      "D3": { id: "D3", title: "에코 컬처로 만드는 꿀잼도시 울산" }
    };

    projects.forEach((p) => {
      p.units.forEach((u) => {
        const hasYearPlan = u.programs?.some(prog => prog.years && prog.years[selectedYear]);
        if (hasYearPlan || selectedYear === 2) {
          if (selectedYear === 1) {
            const mapInfo = y1Mapping[u.id];
            if (mapInfo) {
              unitsMap.set(mapInfo.id, { id: mapInfo.id, title: mapInfo.title });
            } else if (u.id !== "A1나") {
              unitsMap.set(u.id, { id: u.id, title: u.title });
            }
          } else {
            unitsMap.set(u.id, { id: u.id, title: u.title });
          }
        }
      });
    });

    return Array.from(unitsMap.values()).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  };

  const availableUnits = getAvailableUnits();

  // 날짜 기준 RISE 사업 연차(1~5) 자동 계산기
  const getYearFromDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(`${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    // 3월 1일부터 다음 해 2월 말일까지가 해당 차년도
    if (month >= 3) {
      return year - 2024;
    } else {
      return year - 2025;
    }
  };

  // 날짜 범위 검증 (Y차년도: (2024 + Y)년 3월 1일 ~ (2024 + Y + 1)년 2월 말일)
  const isDateValidForYear = (dateStr, year) => {
    if (!dateStr) return false;
    const startYear = 2024 + year;
    const endYear = startYear + 1;
    const minDate = new Date(`${startYear}-03-01T00:00:00`);
    const maxDate = new Date(`${endYear}-03-01T00:00:00`);
    maxDate.setMilliseconds(-1);

    const selectedDate = new Date(`${dateStr}T00:00:00`);
    return selectedDate >= minDate && selectedDate <= maxDate;
  };

  // 필터링 목록 도출
  const filteredAgreements = agreements.filter(a => a.year === selectedYear);
  const filteredCertificates = certificates.filter(c => c.year === selectedYear);
  const filteredAwards = awards.filter(a => a.year === selectedYear);

  // 정렬 요청 핸들러 (협약)
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 정렬 요청 핸들러 (이수증)
  const requestCertSort = (key) => {
    let direction = "asc";
    if (certSortConfig.key === key && certSortConfig.direction === "asc") {
      direction = "desc";
    }
    setCertSortConfig({ key, direction });
  };

  // 정렬 요청 핸들러 (상장)
  const requestAwardSort = (key) => {
    let direction = "asc";
    if (awardSortConfig.key === key && awardSortConfig.direction === "asc") {
      direction = "desc";
    }
    setAwardSortConfig({ key, direction });
  };

  // 정렬된 협약 목록
  const getSortedAgreements = () => {
    const sorted = [...filteredAgreements];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let valA = a[sortConfig.key] || "";
        let valB = b[sortConfig.key] || "";

        // 협약기관 컬럼 정렬 시 객체 배열 내의 명칭을 결합한 텍스트로 비교하되,
        // (주), 주식회사 등 상호명 접두 특수기호 및 문자를 정화(Sanitize)하여 실질 상호명 기준으로 정렬합니다.
        if (sortConfig.key === "organizations") {
          const getCleanOrgName = (orgs) => {
            let rawStr = "";
            if (Array.isArray(orgs)) {
              rawStr = orgs.map(o => typeof o === "object" ? (o.name || "") : String(o)).join(", ");
            } else {
              rawStr = String(orgs || "");
            }
            return rawStr
              .replace(/^\((주|유|合|合資|合名|株式|有限|社|재|사|법|인|재단|사단)\)\s*/g, "")
              .replace(/^(주식회사|유한회사|합자회사|합명회사|재단법인|사단법인)\s*/g, "")
              .trim();
          };
          valA = getCleanOrgName(a.organizations);
          valB = getCleanOrgName(b.organizations);
        }

        if (typeof valA === "string" && typeof valB === "string") {
          return sortConfig.direction === "asc"
            ? valA.localeCompare(valB, undefined, { numeric: true })
            : valB.localeCompare(valA, undefined, { numeric: true });
        }
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  // 정렬된 이수증 목록
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

  // 정렬된 상장 목록
  const getSortedAwards = () => {
    const sorted = [...filteredAwards];
    const key = awardSortConfig.key;
    if (key) {
      sorted.sort((a, b) => {
        let valA = (key === "date" ? a.issueDate : a[key]) || "";
        let valB = (key === "date" ? b.issueDate : b[key]) || "";
        if (typeof valA === "string" && typeof valB === "string") {
          return awardSortConfig.direction === "asc"
            ? valA.localeCompare(valB, undefined, { numeric: true })
            : valB.localeCompare(valA, undefined, { numeric: true });
        }
        if (valA < valB) return awardSortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return awardSortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  const sortedAgreements = getSortedAgreements();
  const sortedCertificates = getSortedCertificates();
  const sortedAwards = getSortedAwards();

  // 엑셀 다운로드 pre-generation 캐싱
  useEffect(() => {
    let excelData = [];
    let sheetName = "";
    let cols = [];

    if (agreementsSubTab === "agreements") {
      if (sortedAgreements.length === 0) {
        setExcelDownloadUrl("");
        return;
      }
      excelData = sortedAgreements.map((agr) => {
        let orgsStr = "";
        let orgSubjectsStr = "";
        if (Array.isArray(agr.organizations)) {
          if (typeof agr.organizations[0] === "object" && agr.organizations[0] !== null) {
            orgsStr = agr.organizations.map(o => o.name).join(", ");
            orgSubjectsStr = agr.organizations.map(o => `${o.name}(${o.subject || "주체없음"})`).join(", ");
          } else {
            orgsStr = agr.organizations.join(", ");
            orgSubjectsStr = agr.subjectOrganization || "";
          }
        }
        return {
          "체결일자": agr.date || "",
          "관련 센터": agr.center || "",
          "협약 대상기관": orgsStr,
          "대학 측 협약주체(UC)": agr.subjectUniversity || "",
          "기관 측 협약주체": orgSubjectsStr,
          "관련 단위과제": agr.unitId || "",
          "협약유형": agr.agreementType || "-",
          "협약내용 범주": Array.isArray(agr.contents) ? agr.contents.join(", ") : "",
          "사본 파일명": agr.fileName || "미첨부"
        };
      });
      sheetName = `${selectedYear}차년도 협약서 목록`;
      cols = [{ wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 35 }];
    } else if (agreementsSubTab === "certificates") {
      if (sortedCertificates.length === 0) {
        setExcelDownloadUrl("");
        return;
      }
      excelData = sortedCertificates.map((c) => ({
        "발급번호": c.certNo || "",
        "발급대상 소속": c.recipientDept || "",
        "발급대상 성명": c.recipientName || "",
        "발급일자": c.issueDate || "",
        "발급주체": c.issuer || "",
        "사본 파일명": c.fileName || "미첨부"
      }));
      sheetName = `${selectedYear}차년도 이수증 발급 목록`;
      cols = [{ wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 35 }];
    } else if (agreementsSubTab === "awards") {
      if (sortedAwards.length === 0) {
        setExcelDownloadUrl("");
        return;
      }
      excelData = sortedAwards.map((a) => ({
        "발급번호": a.awardNo || "",
        "발급대상 소속": a.recipientDept || "",
        "발급대상 성명": a.recipientName || "",
        "발급일자": a.issueDate || "",
        "발급주체": a.issuer || "",
        "사본 파일명": a.fileName || "미첨부"
      }));
      sheetName = `${selectedYear}차년도 상장 발급 목록`;
      cols = [{ wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 35 }];
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = cols;
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      const b64out = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
      setExcelDownloadUrl(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${b64out}`);
    } catch (err) {
      console.error("Excel generation error:", err);
      setExcelDownloadUrl("");
    }
  }, [sortedAgreements, sortedCertificates, sortedAwards, selectedYear, agreementsSubTab]);

  // 엑셀 서식 다운로드 (템플릿)
  const handleDownloadTemplate = () => {
    let templateData = [];
    let fileName = "";

    if (agreementsSubTab === "agreements") {
      templateData = [
        {
          "체결일자": "2025-05-15",
          "관련 센터": "ECC센터",
          "협약 대상기관": "HD현대중공업, 정테크",
          "대학 측 협약주체(UC)": "기계공학과 홍길동",
          "기관 측 협약주체": "HD현대중공업(대표이사), 정테크(대표)",
          "관련 단위과제": "A1",
          "협약유형": "프리미엄",
          "협약내용 범주": "주문식교육, R&BD"
        }
      ];
      fileName = `UC_ANCHOR_협약서_업로드_서식.xlsx`;
    } else if (agreementsSubTab === "certificates") {
      templateData = [
        {
          "발급번호": "제 2025-001 호",
          "발급대상 소속": "게임영상학과",
          "발급대상 성명": "홍길동",
          "발급일자": "2025-06-20",
          "발급주체": "사업단장"
        }
      ];
      fileName = `UC_ANCHOR_이수증_업로드_서식.xlsx`;
    } else if (agreementsSubTab === "awards") {
      templateData = [
        {
          "발급번호": "제 2025-002 호",
          "발급대상 소속": "기계시스템전공",
          "발급대상 성명": "이순신",
          "발급일자": "2025-07-05",
          "발급주체": "사업단장"
        }
      ];
      fileName = `UC_ANCHOR_상장_업로드_서식.xlsx`;
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "업로드템플릿");
    ws["!cols"] = Array(agreementsSubTab === "agreements" ? 8 : 7).fill({ wch: 25 });

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
    const a = document.createElement("a");
    a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 엑셀 업로드 (가져오기)
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

        if (agreementsSubTab === "agreements") {
          rawRows.forEach((row, index) => {
            const dateVal = row["체결일자"];
            const centerVal = row["관련 센터"];
            const orgsVal = row["협약 대상기관"];

            if (!dateVal || !centerVal || !orgsVal) {
              return;
            }

            const orgList = String(orgsVal).split(",").map(o => o.trim()).filter(Boolean);
            const rawSubjects = row["기관 측 협약주체"] || "";
            const subjectsList = String(rawSubjects).split(",").map(s => s.trim()).filter(Boolean);

            const organizations = orgList.map((name, i) => {
              let subject = "";
              const match = name.match(/([^\(]+)\(([^)]+)\)/);
              let finalName = name;
              if (match) {
                finalName = match[1].trim();
                subject = match[2].trim();
              } else if (subjectsList[i]) {
                const subMatch = subjectsList[i].match(/([^\(]+)\(([^)]+)\)/);
                if (subMatch && subMatch[1].trim() === name) {
                  subject = subMatch[2].trim();
                } else {
                  subject = subjectsList[i];
                }
              }
              return { name: finalName, subject };
            });

            const contentsVal = row["협약내용 범주"] || "";
            const contents = String(contentsVal).split(",")
              .map(c => c.trim())
              .filter(c => AGREEMENT_CONTENTS_OPTIONS.includes(c));

            const typeVal = row["협약유형"] ? String(row["협약유형"]).trim() : "-";
            const finalType = ["프리미엄", "무료", "-"].includes(typeVal) ? typeVal : "-";

            const calculatedYear = getYearFromDate(String(dateVal).trim());
            const newAgr = {
              year: calculatedYear || selectedYear,
              date: String(dateVal).trim(),
              center: CENTERS_LIST.includes(String(centerVal).trim()) ? String(centerVal).trim() : "ECC센터",
              organizations,
              subjectUniversity: row["대학 측 협약주체(UC)"] ? String(row["대학 측 협약주체(UC)"]).trim() : "단장",
              unitId: row["관련 단위과제"] ? String(row["관련 단위과제"]).trim() : "",
              agreementType: finalType,
              contents,
              fileName: "",
              fileData: ""
            };

            onAddAgreement(newAgr);
            importedCount++;
          });
          alert(`${importedCount}개의 협약서 정보가 성공적으로 적재되었습니다.`);

        } else if (agreementsSubTab === "certificates") {
          rawRows.forEach((row, index) => {
            const certNoVal = row["발급번호"];
            const deptVal = row["발급대상 소속"];
            const nameVal = row["발급대상 성명"];
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
              issuer: row["발급주체"] ? String(row["발급주체"]).trim() : "사업단장",
              fileName: "",
              fileData: ""
            };

            onAddCertificate(newCert);
            importedCount++;
          });
          alert(`${importedCount}개의 이수증 발급 정보가 성공적으로 적재되었습니다.`);

        } else if (agreementsSubTab === "awards") {
          rawRows.forEach((row, index) => {
            const awardNoVal = row["발급번호"];
            const deptVal = row["발급대상 소속"];
            const nameVal = row["발급대상 성명"];
            const dateVal = row["발급일자"];

            if (!awardNoVal || !deptVal || !nameVal || !dateVal) {
              return;
            }

            const calculatedYear = getYearFromDate(String(dateVal).trim());
            const newAward = {
              year: calculatedYear || selectedYear,
              awardNo: String(awardNoVal).trim(),
              recipientDept: String(deptVal).trim(),
              recipientName: String(nameVal).trim(),
              issueDate: String(dateVal).trim(),
              issuer: row["발급주체"] ? String(row["발급주체"]).trim() : "사업단장",
              fileName: "",
              fileData: ""
            };

            onAddAward(newAward);
            importedCount++;
          });
          alert(`${importedCount}개의 상장 발급 정보가 성공적으로 적재되었습니다.`);
        }

      } catch (err) {
        console.error("Excel Import Error:", err);
        alert("엑셀 파일 파싱 중 에러가 발생했습니다. 규정된 서식 파일과 컬럼 헤더가 일치하는지 확인해 주세요.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  // 사본 파일명 기반 일괄 자동 매핑 핸들러
  const handleBatchFileImport = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (currentRole.id === "GUEST") {
      alert("게스트(방문자) 계정은 읽기 전용으로만 이용하실 수 있습니다.");
      return;
    }

    const results = [];
    const cleanName = (name) => {
      if (!name) return "";
      // 1) 공백 선제적 소거
      let temp = name.replace(/\s/g, "");
      // 2) 정규식 대신 백슬래시 탈락이 없는 안전한 replaceAll 순회
      const keywords = ["(주)", "(유)", "(합)", "(합자)", "(재)", "(사)", "(재단)", "(사단)", "주식회사", "유한회사", "㈜", "㈔", "㈎"];
      keywords.forEach(kw => {
        temp = temp.replaceAll(kw, "");
      });
      return temp.replace(/[\(\)]/g, ""); // 남은 괄호 완벽 제거
    };

    // 파일명에서 끝 괄호 안의 성명 정밀 추출 (예: (김지수) -> 김지수)
    const extractNameInParentheses = (str) => {
      const match = str.match(/\(([^)]+)\)$/);
      return match ? match[1].trim() : null;
    };

    // 파일명에서 언더바(_) 뒤, 괄호 앞의 기관명 정밀 추출
    const extractOrgName = (str) => {
      // 1) 공백 선제적 소거
      let temp = str.replace(/\s/g, "");
      const parenIndex = temp.lastIndexOf("(");
      if (parenIndex !== -1) {
        temp = temp.substring(0, parenIndex);
      }
      const underIndex = temp.lastIndexOf("_");
      if (underIndex !== -1) {
        temp = temp.substring(underIndex + 1);
      }
      const keywords = ["(주)", "(유)", "(합)", "(합자)", "(재)", "(사)", "(재단)", "(사단)", "주식회사", "유한회사", "㈜", "㈔", "㈎"];
      keywords.forEach(kw => {
        temp = temp.replaceAll(kw, "");
      });
      return temp.replace(/[\(\)]/g, "");
    };

    for (const file of files) {
      const fileName = file.name;
      const fileBaseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

      // 1) 날짜 판별 정규식 (YY.MM.DD 또는 YYYY.MM.DD)
      const dateRegex = /(20\d{2}|\d{2})[-.]?(0[1-9]|1[0-2])[-.]?(0[1-9]|[12]\d|3[01])/;
      const dateMatch = fileBaseName.match(dateRegex);
      let parsedDate = null;
      if (dateMatch) {
        let yr = dateMatch[1];
        if (yr.length === 2) yr = "20" + yr;
        const mo = dateMatch[2];
        const dy = dateMatch[3];
        parsedDate = `${yr}-${mo}-${dy}`;
      }

      // 연도 키워드 감지 (예: 2025, 2026, 25, 26)
      const has2025 = fileBaseName.includes("2025") || fileBaseName.includes("25") || fileBaseName.includes("1차");
      const has2026 = fileBaseName.includes("2026") || fileBaseName.includes("26") || fileBaseName.includes("2차");

      const extractedOrg = extractOrgName(fileBaseName);
      const extractedName = extractNameInParentheses(fileBaseName);

      let bestScore = 0;
      let matchedTarget = null;
      let targetType = ""; // "agreement" | "certificate" | "award"
      let bestScoreDetails = {
        extractedOrg: extractedOrg || "없음",
        extractedName: extractedName || "없음",
        orgScore: 0,
        nameScore: 0,
        yearScore: 0,
        dateScore: 0,
        breakdown: "매칭 실패"
      };

      if (agreementsSubTab === "agreements") {
        targetType = "agreement";
        // filteredAgreements가 아닌 agreements 전체 데이터베이스 대상 순회로 누락 방지!
        agreements.forEach(item => {
          let orgMatch = false;
          let nameMatch = false;

          // A. 기관명 포함 검증 (파일명 추출 기관이 대시보드 데이터에 포함되거나 그 반대)
          const compareOrg = (orgInput) => {
            if (!orgInput) return;
            const orgsArray = Array.isArray(orgInput) ? orgInput : [orgInput];

            orgsArray.forEach(org => {
              const rawOrgName = typeof org === "object" && org !== null ? org.name : org;
              const orgClean = cleanName(rawOrgName);
              const fileOrgClean = cleanName(extractedOrg);
              if ((orgClean.includes(fileOrgClean) || fileOrgClean.includes(orgClean))) {
                orgMatch = true;
              }
            });
          };
          compareOrg(item.organizations);

          // B. 성명 포함 검증 (추출된 이름이 협약주체의 '학과+이름'에 포함되면 OK)
          if (item.subjectUniversity && extractedName) {
            const subClean = cleanName(item.subjectUniversity);
            const nameClean = cleanName(extractedName);
            if (subClean && nameClean && subClean.includes(nameClean)) {
              nameMatch = true;
            }
          }

          // C. 연도/날짜 비교 (가산용)
          const itemYear = getYearFromDate(item.date);
          const yearMatch = (itemYear === 1 && has2025) || (itemYear === 2 && has2026);
          const dateMatchCheck = parsedDate && item.date === parsedDate;

          // 두 핵심 조건이 모두 충족되면 매칭 성공(100점) 처리
          const isMatched = orgMatch && nameMatch;
          const score = isMatched ? 100 : 0;

          if (score > bestScore || (score === bestScore && score === 100)) {
            bestScore = score;
            matchedTarget = item;

            bestScoreDetails = {
              extractedOrg: extractedOrg || "없음",
              extractedName: extractedName || "없음",
              orgScore: orgMatch ? 50 : 0,
              nameScore: nameMatch ? 50 : 0,
              yearScore: yearMatch ? 30 : 0,
              dateScore: dateMatchCheck ? 10 : 0,
              breakdown: `기관명:${orgMatch ? "일치" : "불일치"} + 성명:${nameMatch ? "일치" : "불일치"} (${yearMatch ? "연도부합" : "연도교차"})`
            };
          }
        });
      } else if (agreementsSubTab === "certificates") {
        targetType = "certificate";
        // filteredCertificates가 아닌 certificates 전체 데이터베이스 대상 순회로 누락 방지!
        certificates.forEach(item => {
          let orgMatch = false;
          let nameMatch = false;

          // A. 발급번호 매핑
          if (item.certNo && (fileBaseName.includes(item.certNo) || (extractedOrg && extractedOrg.includes(item.certNo)))) {
            orgMatch = true;
          }

          // B. 성명 포함 검증 (추출 성명이 대시보드 수급자에 포함되면 인정)
          if (item.recipientName && extractedName) {
            const recClean = cleanName(item.recipientName);
            const nameClean = cleanName(extractedName);
            if (recClean && nameClean && recClean.includes(nameClean)) {
              nameMatch = true;
            }
          }

          const itemYear = getYearFromDate(item.issueDate);
          const yearMatch = (itemYear === 1 && has2025) || (itemYear === 2 && has2026);

          const isMatched = orgMatch && nameMatch;
          const score = isMatched ? 100 : 0;

          if (score > bestScore || (score === bestScore && score === 100)) {
            bestScore = score;
            matchedTarget = item;

            bestScoreDetails = {
              extractedOrg: extractedOrg || "없음",
              extractedName: extractedName || "없음",
              orgScore: orgMatch ? 50 : 0,
              nameScore: nameMatch ? 50 : 0,
              yearScore: yearMatch ? 30 : 0,
              dateScore: 0,
              breakdown: `발급번호:${orgMatch ? "일치" : "불일치"} + 성명:${nameMatch ? "일치" : "불일치"}`
            };
          }
        });
      } else if (agreementsSubTab === "awards") {
        targetType = "award";
        // filteredAwards가 아닌 awards 전체 데이터베이스 대상 순회로 누락 방지!
        awards.forEach(item => {
          let orgMatch = false;
          let nameMatch = false;

          // A. 발급번호 매핑
          if (item.awardNo && (fileBaseName.includes(item.awardNo) || (extractedOrg && extractedOrg.includes(item.awardNo)))) {
            orgMatch = true;
          }

          // B. 성명 포함 검증 (추출 성명이 대시보드 수급자에 포함되면 인정)
          if (item.recipientName && extractedName) {
            const recClean = cleanName(item.recipientName);
            const nameClean = cleanName(extractedName);
            if (recClean && nameClean && recClean.includes(nameClean)) {
              nameMatch = true;
            }
          }

          const itemYear = getYearFromDate(item.issueDate);
          const yearMatch = (itemYear === 1 && has2025) || (itemYear === 2 && has2026);

          const isMatched = orgMatch && nameMatch;
          const score = isMatched ? 100 : 0;

          if (score > bestScore || (score === bestScore && score === 100)) {
            bestScore = score;
            matchedTarget = item;

            bestScoreDetails = {
              extractedOrg: extractedOrg || "없음",
              extractedName: extractedName || "없음",
              orgScore: orgMatch ? 50 : 0,
              nameScore: nameMatch ? 50 : 0,
              yearScore: yearMatch ? 30 : 0,
              dateScore: 0,
              breakdown: `발급번호:${orgMatch ? "일치" : "불일치"} + 성명:${nameMatch ? "일치" : "불일치"}`
            };
          }
        });
      }

      const fileData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

      // 컷오프 한계선을 70점 이상으로 설정 (성공 점수는 100점이므로 조건 충족 시 무조건 매핑완료)
      if (bestScore >= 70 && matchedTarget) {
        results.push({
          fileName,
          fileData,
          status: "success",
          targetId: matchedTarget.id,
          targetDesc: targetType === "agreement"
            ? `${matchedTarget.organizations.map(o => o.name).join(", ")} (${matchedTarget.date})`
            : `${matchedTarget.recipientName} [${matchedTarget.recipientDept}] (${matchedTarget.issueDate || matchedTarget.date})`,
          score: bestScore,
          details: bestScoreDetails
        });
      } else {
        results.push({
          fileName,
          fileData,
          status: "fail",
          targetId: null,
          targetDesc: "일치하는 데이터를 찾지 못함 (기관명 또는 성명 불일치)",
          score: 0,
          details: {
            extractedOrg: extractedOrg || "없음",
            extractedName: extractedName || "없음",
            orgScore: 0,
            nameScore: 0,
            yearScore: 0,
            dateScore: 0,
            breakdown: "조건 미달 (기관명 또는 성명 불일치)"
          }
        });
      }
    }

    setBatchFileResults(results);
    setIsBatchFileModalOpen(true);
    e.target.value = "";
  };

  // 일괄 매핑 반영 핸들러
  const handleApplyBatchFiles = () => {
    let appliedCount = 0;

    const successMap = new Map();
    batchFileResults.forEach(res => {
      if (res.status === "success" && res.targetId) {
        successMap.set(res.targetId, res);
      }
    });

    if (successMap.size === 0) return;

    if (agreementsSubTab === "agreements") {
      setAgreements(prev =>
        prev.map(item => {
          const match = successMap.get(item.id);
          if (match) {
            appliedCount++;
            return {
              ...item,
              fileName: match.fileName,
              fileData: match.fileData
            };
          }
          return item;
        })
      );
    } else if (agreementsSubTab === "certificates") {
      setCertificates(prev =>
        prev.map(item => {
          const match = successMap.get(item.id);
          if (match) {
            appliedCount++;
            return {
              ...item,
              fileName: match.fileName,
              fileData: match.fileData
            };
          }
          return item;
        })
      );
    } else if (agreementsSubTab === "awards") {
      setAwards(prev =>
        prev.map(item => {
          const match = successMap.get(item.id);
          if (match) {
            appliedCount++;
            return {
              ...item,
              fileName: match.fileName,
              fileData: match.fileData
            };
          }
          return item;
        })
      );
    }

    alert(`${appliedCount}개의 사본 파일이 일치하는 데이터에 성공적으로 매핑 및 적재되었습니다.`);
    setIsBatchFileModalOpen(false);
    setBatchFileResults([]);
  };

  // 1-1. 협약기관 동적 추가/제거
  const handleAddOrgField = () => {
    setInputOrganizations([...inputOrganizations, { name: "", subject: "" }]);
  };

  const handleRemoveOrgField = (index) => {
    if (inputOrganizations.length <= 1) return;
    setInputOrganizations(inputOrganizations.filter((_, i) => i !== index));
  };

  const handleOrgChange = (index, field, value) => {
    const updated = [...inputOrganizations];
    updated[index] = { ...updated[index], [field]: value };
    setInputOrganizations(updated);
  };

  const handleToggleContent = (content) => {
    if (inputContents.includes(content)) {
      setInputContents(inputContents.filter(c => c !== content));
    } else {
      setInputContents([...inputContents, content]);
    }
  };

  // 모의 파일 업로드 (Base64 변환)
  const handleFileChange = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === "agreement") {
          setInputFileName(file.name);
          setInputFileData(reader.result);
        } else if (target === "certificate") {
          setCertFileName(file.name);
          setCertFileData(reader.result);
        } else if (target === "award") {
          setAwardFileName(file.name);
          setAwardFileData(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 사본 뷰어 팝업 연동
  const handleViewFile = (fileData) => {
    try {
      if (!fileData) {
        window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank");
        return;
      }
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
    } catch (e) {
      window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank");
    }
  };

  // 1-2. 협약 등록 폼 초기화
  const resetForm = () => {
    setEditingId(null);
    setInputDate("");
    setInputCenter("ECC센터");
    setInputOrganizations([{ name: "", subject: "" }]);
    setInputSubjectUniv("단장");
    setUnivSubjectType("단장");
    setInputSubjectUnivDept("");
    setInputSubjectUnivName("");
    setInputUnitId(availableUnits[0]?.id || "");
    setInputContents([]);
    setInputFileName("");
    setInputFileData("");
    setInputAgreementType("-");
  };

  // 2-1. 이수증 폼 초기화
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

  // 3-1. 상장 폼 초기화
  const resetAwardForm = () => {
    setEditingAwardId(null);
    setAwardNo("");
    setAwardDept("");
    setAwardName("");
    setAwardDate("");
    setAwardIssuer("사업단장");
    setAwardFileName("");
    setAwardFileData("");
  };

  // 1-3. 협약 저장 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputDate) return alert("협약 체결일자를 선택해 주세요.");

    const calculatedYear = getYearFromDate(inputDate);
    if (!calculatedYear || calculatedYear < 1 || calculatedYear > 5) {
      alert("유효한 RISE 사업 기간 내의 날짜를 선택해 주세요. (2025년 3월 이후)");
      return;
    }

    const cleanOrgs = inputOrganizations.map(o => ({ name: o.name.trim(), subject: o.subject.trim() })).filter(o => o.name);
    if (cleanOrgs.length === 0) return alert("협약 대상기관을 입력해 주세요.");
    if (cleanOrgs.some(o => !o.subject)) return alert("기관 측 협약주체를 입력해 주세요.");
    if (!inputUnitId) return alert("관련 단위과제를 선택해 주세요.");
    if (inputContents.length === 0) return alert("협약내용 범주를 선택해 주세요.");

    let finalSubjectUniv = inputSubjectUniv;
    if (univSubjectType === "기타") {
      if (!inputSubjectUnivDept.trim() || !inputSubjectUnivName.trim()) {
        return alert("대학 측 협약주체의 학과와 성명을 모두 입력해 주세요.");
      }
      finalSubjectUniv = `${inputSubjectUnivDept.trim()} ${inputSubjectUnivName.trim()}`;
    }

    const combinedSubjectOrg = cleanOrgs.map(o => `${o.name} (${o.subject})`).join(", ");
    const payload = {
      year: calculatedYear,
      date: inputDate,
      center: inputCenter,
      organizations: cleanOrgs,
      subjectUniversity: finalSubjectUniv,
      subjectOrganization: combinedSubjectOrg,
      unitId: inputUnitId,
      contents: inputContents,
      fileName: inputFileName,
      fileData: inputFileData,
      agreementType: inputAgreementType
    };

    if (editingId) {
      onUpdateAgreement(editingId, payload);
    } else {
      onAddAgreement(payload);
    }
    setIsModalOpen(false);
    resetForm();
  };

  // 2-2. 이수증 저장 핸들러
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

  // 3-2. 상장 저장 핸들러
  const handleAwardSubmit = (e) => {
    e.preventDefault();
    if (!awardNo.trim()) return alert("발급번호를 입력해 주세요.");
    if (!awardDept.trim()) return alert("발급대상 소속을 입력해 주세요.");
    if (!awardName.trim()) return alert("발급대상 성명을 입력해 주세요.");
    if (!awardDate) return alert("발급일을 선택해 주세요.");

    const calculatedYear = getYearFromDate(awardDate);
    if (!calculatedYear || calculatedYear < 1 || calculatedYear > 5) {
      alert("유효한 RISE 사업 기간 내의 날짜를 선택해 주세요. (2025년 3월 이후)");
      return;
    }

    const payload = {
      year: calculatedYear,
      awardNo: awardNo.trim(),
      recipientDept: awardDept.trim(),
      recipientName: awardName.trim(),
      issueDate: awardDate,
      issuer: awardIssuer,
      fileName: awardFileName,
      fileData: awardFileData
    };

    if (editingAwardId) {
      onUpdateAward(editingAwardId, payload);
    } else {
      onAddAward(payload);
    }
    setIsAwardModalOpen(false);
    resetAwardForm();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* 탭 헤더 컨트롤 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => onChangeAgreementsSubTab("agreements")}
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: "0.75rem",
              borderRadius: "0.3rem 0.3rem 0 0",
              border: "none",
              background: agreementsSubTab === "agreements" ? "var(--accent-color)" : "transparent",
              color: "white",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            ⚓ 협약 관리
          </button>
          <button
            onClick={() => onChangeAgreementsSubTab("certificates")}
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: "0.75rem",
              borderRadius: "0.3rem 0.3rem 0 0",
              border: "none",
              background: agreementsSubTab === "certificates" ? "var(--accent-color)" : "transparent",
              color: "white",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            📄 이수증 관리
          </button>
          <button
            onClick={() => onChangeAgreementsSubTab("awards")}
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: "0.75rem",
              borderRadius: "0.3rem 0.3rem 0 0",
              border: "none",
              background: agreementsSubTab === "awards" ? "var(--accent-color)" : "transparent",
              color: "white",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            🏆 상장 관리
          </button>
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
                background: "rgba(255, 255, 255, 0.05)",
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
                onChange={handleBatchFileImport}
                style={{ display: "none" }}
              />
            </label>

            {/* 엑셀 다운로드 */}
            <a
              href={excelDownloadUrl || "#"}
              download={excelDownloadUrl ? `${agreementsSubTab === "agreements" ? "Agreement" : agreementsSubTab === "certificates" ? "Certificate" : "Award"}_List_Year_${selectedYear}.xlsx` : undefined}
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
            {currentRole.id !== "GUEST" && agreementsSubTab === "agreements" && (
              <button className="btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }} style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.7rem", fontSize: "0.7rem" }}>
                <Plus size={14} /> 신규 협약서 등록
              </button>
            )}
            {currentRole.id !== "GUEST" && agreementsSubTab === "certificates" && (
              <button className="btn-primary" onClick={() => { resetCertForm(); setIsCertModalOpen(true); }} style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.7rem", fontSize: "0.7rem" }}>
                <Plus size={14} /> 신규 이수증 등록
              </button>
            )}
            {currentRole.id !== "GUEST" && agreementsSubTab === "awards" && (
              <button className="btn-primary" onClick={() => { resetAwardForm(); setIsAwardModalOpen(true); }} style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.7rem", fontSize: "0.7rem" }}>
                <Plus size={14} /> 신규 상장 등록
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. 협약 관리 View */}
      {agreementsSubTab === "agreements" && (
        <>
          <div>
            <h2 style={{ fontSize: "1.0rem", fontWeight: "800", color: "white" }}>⚓ {selectedYear}차년도 협약서 통합 관리</h2>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)" }}>단위과제별 가족회사 및 기관과의 대외 협약 체결 내용을 연차별로 영속 보존합니다.</p>
          </div>

          {filteredAgreements.filter(a => !isDateValidForYear(a.date, selectedYear)).length > 0 && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "0.375rem", padding: "0.6rem 0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle color="#ef4444" size={14} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "0.72rem", color: "#fca5a5" }}>
                <strong>⚠️ 사업기간 불일치 협약서 감지:</strong> 선택하신 차년도의 정식 사업기간을 벗어난 체결 건이 있습니다. 수정 아이콘을 통해 일자를 조정하십시오.
              </span>
            </div>
          )}

          <div className="table-container" style={{ background: "var(--card-bg-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "0.5rem", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", color: "white" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color-dark)" }}>
                  <th onClick={() => requestSort("date")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "10%", cursor: "pointer" }}>
                    날짜 {sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th onClick={() => requestSort("center")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "10%", cursor: "pointer" }}>
                    관련 센터 {sortConfig.key === "center" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th onClick={() => requestSort("organizations")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "16%", cursor: "pointer" }}>
                    협약기관 {sortConfig.key === "organizations" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "22%" }}>협약주체 (UC & 타기관)</th>
                  <th onClick={() => requestSort("unitId")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "8%", cursor: "pointer" }}>
                    단위과제 {sortConfig.key === "unitId" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th onClick={() => requestSort("agreementType")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "10%", cursor: "pointer" }}>
                    협약유형 {sortConfig.key === "agreementType" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "14%" }}>협약내용 범주</th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "5%" }}>사본</th>
                  {(currentRole.rank <= 2) && <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "5%" }}>제어</th>}
                </tr>
              </thead>
              <tbody>
                {sortedAgreements.length === 0 ? (
                  <tr>
                    <td colSpan={currentRole.rank <= 2 ? 9 : 8} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary-dark)" }}>
                      등록된 협약서 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedAgreements.map((agr) => {
                    const hasInvalidDate = !isDateValidForYear(agr.date, selectedYear);
                    return (
                      <tr key={agr.id} style={{ borderBottom: "1px solid var(--border-color-dark)", background: hasInvalidDate ? "rgba(239, 68, 68, 0.03)" : "rgba(255,255,255,0.01)" }}>
                        <td style={{ padding: "0.6rem 0.8rem" }}>{agr.date}</td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>
                          <span style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", padding: "0.15rem 0.35rem", borderRadius: "0.25rem", fontSize: "0.65rem", fontWeight: "700" }}>{agr.center}</span>
                        </td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>
                          {Array.isArray(agr.organizations) ? (
                            agr.organizations.map((org, i) => (
                              <span key={i} style={{ background: "#27272a", padding: "0.15rem 0.35rem", borderRadius: "0.25rem", color: "#e4e4e7", marginRight: "0.2rem" }}>
                                {typeof org === "object" ? org.name : org}
                              </span>
                            ))
                          ) : (
                            <span style={{ background: "#27272a", padding: "0.15rem 0.35rem", borderRadius: "0.25rem", color: "#e4e4e7" }}>{agr.organizations}</span>
                          )}
                        </td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                            <span style={{ color: "#a1a1aa" }}>🏫 UC: {agr.subjectUniversity}</span>
                            <span style={{ color: "#38bdf8" }}>🤝 타기관: {agr.subjectOrganization}</span>
                          </div>
                        </td>
                        <td style={{ padding: "0.6rem 0.8rem", fontWeight: "700" }}>{agr.unitId}</td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>
                          <span style={{
                            background: agr.agreementType === "프리미엄" ? "rgba(236,72,153,0.15)" : agr.agreementType === "무료" ? "rgba(59,130,246,0.15)" : "transparent",
                            color: agr.agreementType === "프리미엄" ? "#ec4899" : agr.agreementType === "무료" ? "#3b82f6" : "#a1a1aa",
                            padding: agr.agreementType !== "-" ? "0.15rem 0.35rem" : "0",
                            borderRadius: "0.25rem",
                            fontSize: "0.65rem",
                            fontWeight: agr.agreementType !== "-" ? "700" : "normal"
                          }}>
                            {agr.agreementType || "-"}
                          </span>
                        </td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>
                          {Array.isArray(agr.contents) && agr.contents.map((c, i) => (
                            <span key={i} style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", padding: "0.1rem 0.3rem", borderRadius: "0.2rem", fontSize: "0.65rem", marginRight: "0.2rem" }}>{c}</span>
                          ))}
                        </td>
                        <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                          {agr.fileName ? (
                            <FileText size={16} style={{ color: "#60a5fa", cursor: "pointer" }} onClick={() => handleViewFile(agr.fileData)} />
                          ) : "-"}
                        </td>
                        {(currentRole.rank <= 2) && (
                          <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                              {currentRole.id !== "GUEST" && (
                                <>
                                  <button onClick={() => {
                                    setEditingId(agr.id);
                                    setInputDate(agr.date || "");
                                    setInputCenter(agr.center || "ECC센터");
                                    setInputOrganizations(Array.isArray(agr.organizations) ? agr.organizations.map(o => typeof o === "object" ? { name: o.name || "", subject: o.subject || "" } : { name: o, subject: "" }) : [{ name: "", subject: "" }]);

                                    const subUniv = agr.subjectUniversity || "단장";
                                    setInputSubjectUniv(subUniv);
                                    if (["단장", "센터장"].includes(subUniv)) {
                                      setUnivSubjectType(subUniv);
                                      setInputSubjectUnivDept("");
                                      setInputSubjectUnivName("");
                                    } else {
                                      setUnivSubjectType("기타");
                                      const parts = subUniv.trim().split(/\s+/);
                                      if (parts.length >= 2) {
                                        setInputSubjectUnivName(parts[parts.length - 1]);
                                        setInputSubjectUnivDept(parts.slice(0, parts.length - 1).join(" "));
                                      } else {
                                        setInputSubjectUnivDept("");
                                        setInputSubjectUnivName(subUniv);
                                      }
                                    }

                                    setInputUnitId(agr.unitId || "");
                                    setInputContents(Array.isArray(agr.contents) ? [...agr.contents] : []);
                                    setInputFileName(agr.fileName || "");
                                    setInputFileData(agr.fileData || "");
                                    setInputAgreementType(agr.agreementType || "-");
                                    setIsModalOpen(true);
                                  }} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }} title="수정">
                                    <Edit size={14} />
                                  </button>
                                  <button onClick={() => { if (confirm("이 협약서를 삭제하시겠습니까?")) onDeleteAgreement(agr.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} title="삭제">
                                    <Trash size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 2. 이수증 관리 View */}
      {agreementsSubTab === "certificates" && (
        <>
          <div>
            <h2 style={{ fontSize: "1.0rem", fontWeight: "800", color: "white" }}>📄 {selectedYear}차년도 이수증 발급 내역</h2>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)" }}>교육과정 및 세미나 이수증 발급 대장을 영속 보존합니다.</p>
          </div>

          <div className="table-container" style={{ background: "var(--card-bg-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "0.5rem", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", color: "white" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color-dark)" }}>
                  <th onClick={() => requestCertSort("certNo")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "20%", cursor: "pointer" }}>
                    발급번호 {certSortConfig.key === "certNo" ? (certSortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "35%" }}>발급대상 인적사항</th>
                  <th onClick={() => requestCertSort("date")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "15%", cursor: "pointer" }}>
                    발급일 {certSortConfig.key === "date" ? (certSortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "18%" }}>발급주체</th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "6%" }}>사본</th>
                  {(currentRole.rank <= 2) && <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "6%" }}>제어</th>}
                </tr>
              </thead>
              <tbody>
                {sortedCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={currentRole.rank <= 2 ? 6 : 5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary-dark)" }}>
                      등록된 이수증 발급 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedCertificates.map((cert) => (
                    <tr key={cert.id} style={{ borderBottom: "1px solid var(--border-color-dark)", background: "rgba(255,255,255,0.01)" }}>
                      <td style={{ padding: "0.6rem 0.8rem", fontWeight: "700" }}>{cert.certNo}</td>
                      <td style={{ padding: "0.6rem 0.8rem" }}>
                        <span style={{ color: "#a1a1aa", marginRight: "0.4rem" }}>[{cert.recipientDept}]</span>
                        <strong style={{ color: "white" }}>{cert.recipientName}</strong>
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
                      {(currentRole.rank <= 2) && (
                        <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                            {currentRole.id !== "GUEST" && (
                              <>
                                <button onClick={() => {
                                  setEditingCertId(cert.id);
                                  setCertNo(cert.certNo || "");
                                  setCertDept(cert.recipientDept || "");
                                  setCertName(cert.recipientName || "");
                                  setCertDate(cert.issueDate || "");
                                  setCertIssuer(cert.issuer || "사업단장");
                                  setCertFileName(cert.fileName || "");
                                  setCertFileData(cert.fileData || "");
                                  setIsCertModalOpen(true);
                                }} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }} title="수정">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => { if (confirm("이 이수증을 삭제하시겠습니까?")) onDeleteCertificate(cert.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} title="삭제">
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
        </>
      )}

      {/* 3. 상장 관리 View */}
      {agreementsSubTab === "awards" && (
        <>
          <div>
            <h2 style={{ fontSize: "1.0rem", fontWeight: "800", color: "white" }}>🏆 {selectedYear}차년도 상장 발급 내역</h2>
            <p style={{ fontSize: "0.72rem", color: "var(--text-secondary-dark)" }}>공모전 및 경진대회 상장 발급 대장을 영속 보존합니다.</p>
          </div>

          <div className="table-container" style={{ background: "var(--card-bg-dark)", border: "1px solid var(--border-color-dark)", borderRadius: "0.5rem", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", color: "white" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color-dark)" }}>
                  <th onClick={() => requestAwardSort("awardNo")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "20%", cursor: "pointer" }}>
                    발급번호 {awardSortConfig.key === "awardNo" ? (awardSortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "35%" }}>발급대상 인적사항</th>
                  <th onClick={() => requestAwardSort("date")} style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "15%", cursor: "pointer" }}>
                    발급일 {awardSortConfig.key === "date" ? (awardSortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "18%" }}>발급주체</th>
                  <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "6%" }}>사본</th>
                  {(currentRole.rank <= 2) && <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "6%" }}>제어</th>}
                </tr>
              </thead>
              <tbody>
                {sortedAwards.length === 0 ? (
                  <tr>
                    <td colSpan={currentRole.rank <= 2 ? 6 : 5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary-dark)" }}>
                      등록된 상장 발급 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedAwards.map((award) => (
                    <tr key={award.id} style={{ borderBottom: "1px solid var(--border-color-dark)", background: "rgba(255,255,255,0.01)" }}>
                      <td style={{ padding: "0.6rem 0.8rem", fontWeight: "700" }}>{award.awardNo}</td>
                      <td style={{ padding: "0.6rem 0.8rem" }}>
                        <span style={{ color: "#a1a1aa", marginRight: "0.4rem" }}>[{award.recipientDept}]</span>
                        <strong style={{ color: "white" }}>{award.recipientName}</strong>
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem" }}>{award.issueDate}</td>
                      <td style={{ padding: "0.6rem 0.8rem" }}>
                        <span style={{ background: "rgba(167,139,250,0.1)", color: "#c084fc", padding: "0.15rem 0.4rem", borderRadius: "0.25rem", fontSize: "0.65rem", fontWeight: "700" }}>{award.issuer}</span>
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                        {award.fileName ? (
                          <AwardIcon size={16} style={{ color: "#f59e0b", cursor: "pointer" }} onClick={() => handleViewFile(award.fileData)} />
                        ) : "-"}
                      </td>
                      {(currentRole.rank <= 2) && (
                        <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                            {currentRole.id !== "GUEST" && (
                              <>
                                <button onClick={() => {
                                  setEditingAwardId(award.id);
                                  setAwardNo(award.awardNo || "");
                                  setAwardDept(award.recipientDept || "");
                                  setAwardName(award.recipientName || "");
                                  setAwardDate(award.issueDate || "");
                                  setAwardIssuer(award.issuer || "사업단장");
                                  setAwardFileName(award.fileName || "");
                                  setAwardFileData(award.fileData || "");
                                  setIsAwardModalOpen(true);
                                }} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }} title="수정">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => { if (confirm("이 상장을 삭제하시겠습니까?")) onDeleteAward(award.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} title="삭제">
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
        </>
      )}

      {/* A. 협약서 등록 및 수정 모달 */}
      {isModalOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", overflowY: "auto", padding: "2rem 1rem" }}>
          <div style={{ background: "#18181b", border: "1px solid var(--border-color-dark)", borderRadius: "0.75rem", width: "100%", maxWidth: "550px", maxHeight: "85vh", display: "flex", flexDirection: "column", color: "white", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color-dark)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800" }}>⚓ {editingId ? "협약서 정보 수정" : "신규 협약서 등록"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>협약 체결일자</label>
                  <input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련 센터</label>
                  <select value={inputCenter} onChange={(e) => setInputCenter(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}>
                    {CENTERS_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.65rem", color: "var(--text-secondary-dark)" }}>협약 대상기관 및 기관 측 협약주체 목록</label>
                  <button type="button" onClick={handleAddOrgField} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "0.1rem" }}>
                    <Plus size={12} /> 기관 추가
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.40rem" }}>
                  {inputOrganizations.map((org, index) => (
                    <div key={index} style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                      <input type="text" placeholder={`협약 대상기관 ${index + 1}`} value={org.name || ""} onChange={(e) => handleOrgChange(index, "name", e.target.value)} style={{ flex: 1.3, padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                      <input type="text" placeholder="직위/성명 (예: 총장 오연천)" value={org.subject || ""} onChange={(e) => handleOrgChange(index, "subject", e.target.value)} style={{ flex: 1, padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                      {inputOrganizations.length > 1 && (
                        <button type="button" onClick={() => handleRemoveOrgField(index)} style={{ background: "#3f3f46", border: "none", color: "#ef4444", borderRadius: "0.25rem", padding: "0.25rem", cursor: "pointer" }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.4rem" }}>대학 측 협약주체 (UC)</label>
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: univSubjectType === "기타" ? "0.4rem" : "0" }}>
                  {["단장", "센터장", "기타"].map((t) => {
                    const isSelected = univSubjectType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setUnivSubjectType(t);
                          if (t !== "기타") {
                            setInputSubjectUniv(t);
                          } else {
                            setInputSubjectUniv("");
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: "0.35rem 0.5rem",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          borderRadius: "0.25rem",
                          border: isSelected ? "1px solid #38bdf8" : "1px solid #52525b",
                          background: isSelected ? "rgba(56, 189, 248, 0.15)" : "#27272a",
                          color: isSelected ? "#38bdf8" : "#d4d4d8",
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                {univSubjectType === "기타" && (
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <input
                      type="text"
                      placeholder="학과 입력 (예: 기계공학과)"
                      value={inputSubjectUnivDept}
                      onChange={(e) => setInputSubjectUnivDept(e.target.value)}
                      style={{
                        flex: 1.3,
                        padding: "0.35rem 0.5rem",
                        fontSize: "0.75rem",
                        background: "#27272a",
                        color: "white",
                        border: "1px solid var(--border-color-dark)",
                        borderRadius: "0.25rem"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="성명 (예: 홍길동 교수)"
                      value={inputSubjectUnivName}
                      onChange={(e) => setInputSubjectUnivName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "0.35rem 0.5rem",
                        fontSize: "0.75rem",
                        background: "#27272a",
                        color: "white",
                        border: "1px solid var(--border-color-dark)",
                        borderRadius: "0.25rem"
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>관련 단위과제</label>
                <select value={inputUnitId} onChange={(e) => setInputUnitId(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}>
                  <option value="">-- 관련 단위과제 선택 --</option>
                  {availableUnits.map((u) => (
                    <option key={u.id} value={u.id}>{u.id}. {u.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.4rem" }}>협약유형</label>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  {["프리미엄", "무료", "-"].map((t) => {
                    const isSelected = inputAgreementType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setInputAgreementType(t)}
                        style={{
                          flex: 1,
                          padding: "0.35rem 0.5rem",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          borderRadius: "0.25rem",
                          border: isSelected ? "1px solid #ec4899" : "1px solid #52525b",
                          background: isSelected ? "rgba(236, 72, 153, 0.15)" : "#27272a",
                          color: isSelected ? "#ec4899" : "#d4d4d8",
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.4rem" }}>협약 내용 범주 (다중 선택)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                  {AGREEMENT_CONTENTS_OPTIONS.map((c) => {
                    const isSelected = inputContents.includes(c);
                    return (
                      <button key={c} type="button" onClick={() => handleToggleContent(c)} style={{ padding: "0.25rem 0.5rem", fontSize: "0.65rem", borderRadius: "2rem", border: isSelected ? "1px solid #34d399" : "1px solid #52525b", background: isSelected ? "rgba(52,211,153,0.15)" : "#27272a", color: isSelected ? "#34d399" : "#d4d4d8", cursor: "pointer" }}>
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>협약서 사본 업로드</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.6rem", fontSize: "0.7rem", background: "#3f3f46", color: "white", borderRadius: "0.25rem", cursor: "pointer", border: "1px solid var(--border-color-dark)" }}>
                    <Upload size={14} /> 파일 선택
                    <input type="file" onChange={(e) => handleFileChange(e, "agreement")} style={{ display: "none" }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                  </label>
                  <span style={{ fontSize: "0.7rem", color: "#a1a1aa" }}>{inputFileName ? `📁 ${inputFileName}` : "선택된 파일 없음"}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>취소</button>
                <button type="submit" className="btn-primary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>저장하기</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* B. 이수증 등록 및 수정 모달 */}
      {isCertModalOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", overflowY: "auto", padding: "2rem 1rem" }}>
          <div style={{ background: "#18181b", border: "1px solid var(--border-color-dark)", borderRadius: "0.75rem", width: "100%", maxWidth: "500px", maxHeight: "85vh", display: "flex", flexDirection: "column", color: "white", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color-dark)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800" }}>📄 {editingCertId ? "이수증 정보 수정" : "신규 이수증 등록"}</h3>
              <button onClick={() => setIsCertModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCertSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급번호</label>
                <input type="text" placeholder="예: 제 2026-이수-0001 호" value={certNo} onChange={(e) => setCertNo(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급대상 소속</label>
                  <input type="text" placeholder="예: 울산과학대학교" value={certDept} onChange={(e) => setCertDept(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급대상 성명</label>
                  <input type="text" placeholder="예: 홍길동" value={certName} onChange={(e) => setCertName(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급일자</label>
                  <input type="date" value={certDate} onChange={(e) => setCertDate(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급주체</label>
                  <select value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}>
                    <option value="사업단장">사업단장</option>
                    <option value="늘봄누리센터장">늘봄누리센터장</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>증서 사본 업로드</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.6rem", fontSize: "0.7rem", background: "#3f3f46", color: "white", borderRadius: "0.25rem", cursor: "pointer", border: "1px solid var(--border-color-dark)" }}>
                    <Upload size={14} /> 파일 선택
                    <input type="file" onChange={(e) => handleFileChange(e, "certificate")} style={{ display: "none" }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                  </label>
                  <span style={{ fontSize: "0.7rem", color: "#a1a1aa" }}>{certFileName ? `📁 ${certFileName}` : "선택된 파일 없음"}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsCertModalOpen(false)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>취소</button>
                <button type="submit" className="btn-primary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>저장하기</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* C. 상장 등록 및 수정 모달 */}
      {isAwardModalOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", overflowY: "auto", padding: "2rem 1rem" }}>
          <div style={{ background: "#18181b", border: "1px solid var(--border-color-dark)", borderRadius: "0.75rem", width: "100%", maxWidth: "500px", maxHeight: "85vh", display: "flex", flexDirection: "column", color: "white", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color-dark)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800" }}>🏆 {editingAwardId ? "상장 정보 수정" : "신규 상장 등록"}</h3>
              <button onClick={() => setIsAwardModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAwardSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급번호</label>
                <input type="text" placeholder="예: 제 2026-상장-0001 호" value={awardNo} onChange={(e) => setAwardNo(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급대상 소속</label>
                  <input type="text" placeholder="예: 울산과학대학교" value={awardDept} onChange={(e) => setAwardDept(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급대상 성명</label>
                  <input type="text" placeholder="예: 홍길동" value={awardName} onChange={(e) => setAwardName(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급일자</label>
                  <input type="date" value={awardDate} onChange={(e) => setAwardDate(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>발급주체</label>
                  <select value={awardIssuer} onChange={(e) => setAwardIssuer(e.target.value)} style={{ width: "100%", padding: "0.35rem 0.5rem", fontSize: "0.75rem", background: "#27272a", color: "white", border: "1px solid var(--border-color-dark)", borderRadius: "0.25rem" }}>
                    <option value="사업단장">사업단장</option>
                    <option value="늘봄누리센터장">늘봄누리센터장</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary-dark)", marginBottom: "0.25rem" }}>상장 사본 업로드</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.35rem 0.6rem", fontSize: "0.7rem", background: "#3f3f46", color: "white", borderRadius: "0.25rem", cursor: "pointer", border: "1px solid var(--border-color-dark)" }}>
                    <Upload size={14} /> 파일 선택
                    <input type="file" onChange={(e) => handleFileChange(e, "award")} style={{ display: "none" }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                  </label>
                  <span style={{ fontSize: "0.7rem", color: "#a1a1aa" }}>{awardFileName ? `📁 ${awardFileName}` : "선택된 파일 없음"}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color-dark)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAwardModalOpen(false)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>취소</button>
                <button type="submit" className="btn-primary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>저장하기</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {isBatchFileModalOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", overflowY: "auto", padding: "2rem 1rem" }}>
          <div style={{ background: "#18181b", border: "1px solid var(--border-color-dark)", borderRadius: "0.75rem", width: "100%", maxWidth: "680px", maxHeight: "85vh", display: "flex", flexDirection: "column", color: "white", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color-dark)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FileCheck size={18} style={{ color: "#10B981" }} /> 사본 파일명 자동 매핑 결과 리포트
              </h3>
              <button onClick={() => setIsBatchFileModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "1.25rem", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#a1a1aa", background: "#27272a", padding: "0.75rem", borderRadius: "0.35rem", border: "1px solid var(--border-color-dark)" }}>
                💡 파일 이름에서 추출된 기관명/발급번호 및 성명이 대시보드의 데이터 정보에 포함되면 매칭 대상(100점)으로 판정하여 자동 연결해 줍니다.
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "700" }}>
                <span>분석 대상 파일: {batchFileResults.length}개</span>
                <span style={{ color: "#34D399" }}>매칭 성공: {batchFileResults.filter(r => r.status === "success").length}개</span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse", border: "1px solid var(--border-color-dark)" }}>
                  <thead>
                    <tr style={{ background: "#27272a", borderBottom: "1px solid var(--border-color-dark)" }}>
                      <th style={{ padding: "0.5rem", textAlign: "left", border: "1px solid var(--border-color-dark)", width: "32%" }}>파일명</th>
                      <th style={{ padding: "0.5rem", textAlign: "left", border: "1px solid var(--border-color-dark)", width: "38%" }}>추출 정보 및 매칭 점수 내역</th>
                      <th style={{ padding: "0.5rem", textAlign: "left", border: "1px solid var(--border-color-dark)", width: "20%" }}>매칭된 데이터 대상</th>
                      <th style={{ padding: "0.5rem", textAlign: "center", border: "1px solid var(--border-color-dark)", width: "10%" }}>매칭 상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchFileResults.map((res, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border-color-dark)", background: res.status === "success" ? "rgba(16,185,129,0.03)" : "rgba(239,68,68,0.03)" }}>
                        <td style={{ padding: "0.5rem", color: "#e4e4e7", fontWeight: "500", border: "1px solid var(--border-color-dark)" }}>
                          <div style={{ wordBreak: "break-all" }}>📁 {res.fileName}</div>
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid var(--border-color-dark)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <div style={{ fontSize: "0.68rem", color: "#a1a1aa" }}>
                              🏢 추출기관: <span style={{ color: "white", fontWeight: "700" }}>{res.details?.extractedOrg || "없음"}</span> |
                              👤 추출성명: <span style={{ color: "white", fontWeight: "700" }}>{res.details?.extractedName || "없음"}</span>
                            </div>
                            <div style={{
                              fontSize: "0.62rem",
                              color: res.status === "success" ? "#34d399" : "#f87171",
                              background: "rgba(255,255,255,0.02)",
                              padding: "0.15rem 0.35rem",
                              borderRadius: "0.2rem",
                              display: "inline-block",
                              width: "fit-content",
                              border: "1px solid rgba(255,255,255,0.05)"
                            }}>
                              ⚡ 판정식: {res.details?.breakdown || "매칭 실패"} ({res.score}점)
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid var(--border-color-dark)" }}>
                          {res.status === "success" ? (
                            <span style={{ color: "#38bdf8", fontWeight: "600" }}>🟢 {res.targetDesc}</span>
                          ) : (
                            <span style={{ color: "#ef4444" }}>❌ {res.targetDesc}</span>
                          )}
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center", border: "1px solid var(--border-color-dark)" }}>
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
              <button type="button" className="btn-secondary" onClick={() => setIsBatchFileModalOpen(false)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>취소</button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleApplyBatchFiles}
                disabled={batchFileResults.filter(r => r.status === "success").length === 0}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.75rem",
                  background: batchFileResults.filter(r => r.status === "success").length === 0 ? "#52525b" : "var(--primary-color)",
                  cursor: batchFileResults.filter(r => r.status === "success").length === 0 ? "not-allowed" : "pointer"
                }}
              >
                일괄 적용 및 저장하기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
