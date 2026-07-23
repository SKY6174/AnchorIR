import React, { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, Edit, Trash, FileText, Upload, X, AlertTriangle, Download, FileCheck } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "../supabaseClient"; // Supabase 클라이언트 연동 추가

const AGREEMENT_CONTENTS_OPTIONS = [
  "주문식교육", "창업", "글로벌", "R&BD", "AIDX", "탄소중립",
  "복합재난", "평생교육", "늘봄", "지역현안해결", "보건복지서비스", "에코컬처", "도시재생"
];

const CENTERS_LIST = [
  "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "사업운영팀"
];

export interface AgreementOrg {
  name: string;
  subject?: string;
}

export interface AgreementItem {
  id?: number | string;
  year?: number | string;
  date: string;
  center: string;
  organizations: AgreementOrg[] | string[];
  subjectUniversity: string;
  subjectOrganization?: string;
  unitId: string;
  contents: string[];
  fileName?: string | null;
  fileData?: string | null;
  agreementType?: string | null;
  created_at?: string;
}

interface ProgramPlan {
  years?: Record<string, unknown>;
}

interface ProjectUnit {
  id: string;
  title: string;
  programs?: ProgramPlan[];
}

interface AgreementProject {
  units?: ProjectUnit[];
}

type AgreementSortKey = "date" | "center" | "organizations" | "unitId" | "agreementType";

export interface AgreementManagerProps {
  projects?: AgreementProject[];
  agreements?: AgreementItem[];
  selectedYear?: number | string;
  onAddAgreement?: (agreement: AgreementItem) => void;
  onUpdateAgreement?: (id: number | string, agreement: AgreementItem) => void;
  onDeleteAgreement?: (id: number | string) => void;
  setAgreements?: React.Dispatch<React.SetStateAction<AgreementItem[]>>;
  currentRole?: any;
  darkMode?: boolean;
  currentUser?: any;
}

export default function AgreementManager({
  projects = [],
  agreements = [],
  selectedYear,
  onAddAgreement,
  onUpdateAgreement,
  onDeleteAgreement,
  setAgreements,
  currentRole
}: AgreementManagerProps) {
  // 💡 라이트/다크 테마 전환 시 모달 내부의 시인성을 완벽히 조율하기 위해 HTML 클래스 감지
  const isLight = document.documentElement.classList.contains("light-mode");

  // 1. 기존 협약서 모달 및 입력 폼 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [inputDate, setInputDate] = useState<string>("");
  const [inputCenter, setInputCenter] = useState<string>("ECC센터");
  const [inputOrganizations, setInputOrganizations] = useState<AgreementOrg[]>([{ name: "", subject: "" }]);
  const [inputSubjectUniv, setInputSubjectUniv] = useState<string>("단장");
  const [univSubjectType, setUnivSubjectType] = useState<string>("단장");
  const [inputSubjectUnivDept, setInputSubjectUnivDept] = useState<string>("");
  const [inputSubjectUnivName, setInputSubjectUnivName] = useState<string>("");
  const [inputUnitId, setInputUnitId] = useState<string>("");
  const [inputContents, setInputContents] = useState<string[]>([]);
  const [inputFileName, setInputFileName] = useState<string>("");
  const [inputFileData, setInputFileData] = useState<string>("");
  const [inputAgreementType, setInputAgreementType] = useState<string>("-");

  // 2. 사본 일괄 매핑 모달 상태 (이수증, 상장 관련 상태 삭제 후 협약서만 남김)
  const [isAgreementBatchModalOpen, setIsAgreementBatchModalOpen] = useState<boolean>(false);
  const [batchAgreementResults, setBatchAgreementResults] = useState<any[]>([]);

  // 스토리지 파일 대량 업로드 로딩 상태 관리
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatusText, setUploadStatusText] = useState<string>("");

  // 단위과제 다중 선택 필터링 상태 추가
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  // 정렬 상태 관리 (협약서만 유지)
  const [sortConfig, setSortConfig] = useState<{ key: AgreementSortKey; direction: "asc" | "desc" }>({ key: "date", direction: "asc" });

  // 엑셀 다운로드 URL 상태
  const [excelDownloadUrl, setExcelDownloadUrl] = useState("");

  // 단위과제 로드 (기존 동일)
  const getAvailableUnits = () => {
    const unitsMap = new Map<string, { id: string; title: string }>();
    const y1Mapping: Record<string, { id: string; title: string }> = {
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
      if (p.units && Array.isArray(p.units)) {
        p.units.forEach((u) => {
          const hasYearPlan = u.programs?.some(prog => prog.years && prog.years[String(selectedYear ?? 2)]);
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
    }
  });

    return Array.from(unitsMap.values()).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  };

  const availableUnits = getAvailableUnits();

  // 단위과제 다중 선택 필터 토글 핸들러
  const handleToggleUnitFilter = (unitId: string) => {
    setSelectedUnits((prev) => {
      if (prev.includes(unitId)) {
        return prev.filter((id) => id !== unitId);
      } else {
        return [...prev, unitId];
      }
    });
  };

  // 단위과제 필터 전체 해제 핸들러
  const handleClearUnitFilter = () => {
    setSelectedUnits([]);
  };

  // 날짜 기준 앵커 사업 연차(1~5) 자동 계산기
  const getYearFromDate = (dateStr: string): number | null => {
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

  // 💡 날짜 문자열 안전 정화기 (PostgreSQL DATE 타입 호환 보장 및 오입력 데이터 정제)
  const sanitizeDateStr = (dateStr: unknown, fallbackYear: number | string | undefined): string => {
    if (!dateStr) return `${fallbackYear === 1 ? 2025 : 2026}-05-15`;
    
    let clean = String(dateStr).trim().replace(/[^0-9-]/g, ""); // 숫자와 대시만 필터링
    
    // 만약 YYYY-MM-DD 정밀 규격이면 그대로 통과
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      return clean;
    }

    // "2025.05.15" 이나 "2025/05/15" 대시로 치환
    const dottedMatch = String(dateStr).trim().match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})$/);
    if (dottedMatch) {
      const y = dottedMatch[1];
      const m = dottedMatch[2].padStart(2, '0');
      const d = dottedMatch[3].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    // "20250515" 형식 대시 삽입
    if (/^\d{8}$/.test(clean)) {
      return `${clean.substring(0, 4)}-${clean.substring(4, 6)}-${clean.substring(6, 8)}`;
    }

    // "25-05-15" 이나 "250515" 2000년대 연도 복원
    if (/^\d{2}-\d{2}-\d{2}$/.test(clean)) {
      return `20${clean}`;
    }
    if (/^\d{6}$/.test(clean)) {
      return `20${clean.substring(0, 2)}-${clean.substring(2, 4)}-${clean.substring(4, 6)}`;
    }

    // 깨진 포맷(예: "610-98-81") -> 연차별 기본 날짜 부여
    const baseYear = fallbackYear === 1 ? 2025 : (fallbackYear === 2 ? 2026 : (fallbackYear === 3 ? 2027 : (fallbackYear === 4 ? 2028 : 2029)));
    return `${baseYear}-05-15`;
  };

  // 날짜 범위 검증 (Y차년도: (2024 + Y)년 3월 1일 ~ (2024 + Y + 1)년 2월 말일)
  const isDateValidForYear = (dateStr: string, year: number): boolean => {
    if (!dateStr) return false;
    const startYear = 2024 + year;
    const endYear = startYear + 1;
    const minDate = new Date(`${startYear}-03-01T00:00:00`);
    const maxDate = new Date(`${endYear}-03-01T00:00:00`);
    maxDate.setMilliseconds(-1);

    const selectedDate = new Date(`${dateStr}T00:00:00`);
    return selectedDate >= minDate && selectedDate <= maxDate;
  };

  // 필터링 목록 도출 (협약서만 유지)
  const filteredAgreements = agreements.filter(a => a.year === selectedYear);

  // 정렬 요청 핸들러 (협약)
  const requestSort = (key: AgreementSortKey) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
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
          const getCleanOrgName = (orgs: AgreementItem["organizations"]) => {
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

  const sortedAgreements = getSortedAgreements();

  // 단위과제 다중 선택 필터가 적용된 최종 협약서 목록
  const displayAgreements = selectedUnits.length > 0
    ? sortedAgreements.filter(a => selectedUnits.includes(a.unitId))
    : sortedAgreements;

  // 엑셀 다운로드 pre-generation 캐싱 (협약서 전용으로 축소)
  useEffect(() => {
    if (displayAgreements.length === 0) {
      setExcelDownloadUrl("");
      return;
    }
    const excelData = displayAgreements.map((agr) => {
      let orgsStr = "";
      let orgSubjectsStr = "";
      if (Array.isArray(agr.organizations)) {
        if (typeof agr.organizations[0] === "object" && agr.organizations[0] !== null) {
          orgsStr = agr.organizations.map(o => typeof o === "object" ? o.name : o).join(", ");
          orgSubjectsStr = agr.organizations.map(o => typeof o === "object" ? `${o.name}(${o.subject || "주체없음"})` : o).join(", ");
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
    const sheetName = `${selectedYear}차년도 협약서 목록`;
    const cols = [{ wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 35 }];

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
  }, [displayAgreements, selectedYear]);

  // 엑셀 서식 다운로드 (템플릿)
  const handleDownloadTemplate = () => {
    const templateData = [
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
    const fileName = `UC_ANCHOR_협약서_업로드_서식.xlsx`;

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "업로드템플릿");
    ws["!cols"] = Array(8).fill({ wch: 25 });

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
    const a = document.createElement("a");
    a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 엑셀 업로드 (가져오기)
  const handleExcelImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        if (!binaryStr) return;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

        if (rawRows.length === 0) {
          alert("엑셀 파일에 데이터가 존재하지 않습니다.");
          return;
        }

        let importedCount = 0;
        const partnerPayloads: Array<{
          name: string;
          category: string;
          sub_category: string;
          location: string;
          sectors: string[];
        }> = [];

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
          const cleanDate = sanitizeDateStr(String(dateVal).trim(), calculatedYear || selectedYear);
          const finalYear = getYearFromDate(cleanDate) || calculatedYear || selectedYear;
          const newAgr = {
            year: finalYear,
            date: cleanDate,
            center: CENTERS_LIST.includes(String(centerVal).trim()) ? String(centerVal).trim() : "ECC센터",
            organizations,
            subjectUniversity: row["대학 측 협약주체(UC)"] ? String(row["대학 측 협약주체(UC)"]).trim() : "단장",
            unitId: row["관련 단위과제"] ? String(row["관련 단위과제"]).trim() : "",
            agreementType: finalType,
            contents,
            fileName: "",
            fileData: ""
          };

          // 파트너 Payload 수집
          organizations.forEach(org => {
            if (org.name) {
              partnerPayloads.push({
                name: org.name,
                category: "산업체",         // 기본 대분류
                sub_category: org.subject || "",
                location: "울산",          // 기본 지역
                sectors: contents         // 협력 분야 연동
              });
            }
          });

          onAddAgreement?.(newAgr);
          importedCount++;
        });

        // 엑셀 업로드 시 추출한 모든 파트너 일괄 upsert
        if (partnerPayloads.length > 0) {
          const uniquePartners = Array.from(new Map(partnerPayloads.map(p => [p.name, p])).values());
          supabase.from("partner_institutions")
            .upsert(uniquePartners, { onConflict: "name" })
            .then(({ error }) => {
              if (error) console.error("Excel import partner upsert fail:", error);
              else console.log("Excel import partner upsert success.");
            }, err => console.error("Excel import partner upsert error:", err));
        }

        alert(`${importedCount}개의 협약서 정보가 성공적으로 적재되었습니다.`);
      } catch (err) {
        console.error("Excel Import Error:", err);
        alert("엑셀 파일 파싱 중 에러가 발생했습니다. 규정된 서식 파일과 컬럼 헤더가 일치하는지 확인해 주세요.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  /**
   * cleanName: 파일명이나 대시보드 항목명에서 불필요한 회사 수식어(주식회사, ㈜ 등)와 공백을 지워
   * 순수한 텍스트 비교가 가능하도록 정화하는 공통 헬퍼 함수입니다.
   */
  const cleanName = (name: string) => {
    if (!name) return "";
    // 1) 모든 공백을 제거합니다.
    let temp = name.replace(/\s/g, "");
    // 2) 법인 및 단체 지시어들을 일괄 교체하여 뗍니다.
    const keywords = ["(주)", "(유)", "(합)", "(합자)", "(재)", "(사)", "(재단)", "(사단)", "주식회사", "유한회사", "㈜", "㈔", "㈎"];
    keywords.forEach(kw => {
      temp = temp.replaceAll(kw, "");
    });
    // 3) 남은 괄호기호()를 완벽히 소거하여 최종 정화된 이름만 리턴합니다.
    return temp.replace(/[\(\)]/g, "");
  };

  // ==========================================
  // [1] 협약(Agreements) 탭 사본 일괄 매핑 핸들러 및 반영 함수
  // ==========================================

  // 1-1. 협약 사본 파일명 기반 일괄 자동 매핑 핸들러
  const handleBatchAgreementImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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

      let matchedTarget: AgreementItem | null = null;
      let maxScore = 0;
      let bestDetails: {
        extractedOrg: string;
        extractedName: string;
        orgScore: number;
        nameScore: number;
        dateScore: number;
        breakdown: string;
      } | null = null;

      // 전체 협약 목록을 순회하며 매칭 점수를 산출합니다.
      agreements.forEach(item => {
        let orgScore = 0;
        let nameScore = 0;
        let dateScore = 0;

        // A. 기관명 비교 (40점): 대시보드의 기관명이 파일명에 포함되는가?
        if (item.organizations) {
          const orgsArray = Array.isArray(item.organizations) ? item.organizations : [item.organizations];
          orgsArray.forEach(org => {
            const rawOrgName = typeof org === "object" && org !== null ? org.name : org;
            const orgClean = cleanName(rawOrgName);
            if (orgClean && fileClean.includes(orgClean)) {
              orgScore = 40;
            }
          });
        }

        // B. 성명 비교 (30점): 대시보드의 협약주체(교수 성명)가 파일명에 포함되는가?
        if (item.subjectUniversity) {
          const subClean = cleanName(item.subjectUniversity);
          if (subClean && fileClean.includes(subClean)) {
            nameScore = 30;
          } else {
            const nameParts = item.subjectUniversity.trim().split(/\s+/).map(p => cleanName(p)).filter(Boolean);
            const extractedName = nameParts[nameParts.length - 1];
            if (extractedName && extractedName.length >= 2 && fileClean.includes(extractedName)) {
              nameScore = 30;
            }
          }
        }

        // C. 협약일 비교 (30점): 협약일 YYYYMMDD가 파일명에 포함되는가?
        if (item.date) {
          const dateYmd = item.date.replace(/-/g, ""); // YYYYMMDD
          if (fileBaseName.includes(dateYmd)) {
            dateScore = 30;
          }
        }

        const totalScore = orgScore + nameScore + dateScore;

        // 70점 이상이면서, 이전 매칭보다 높은 점수를 얻은 대상을 선정
        if (totalScore >= 70 && totalScore > maxScore) {
          maxScore = totalScore;
          matchedTarget = item;
          bestDetails = {
            extractedOrg: item.organizations.map(o => typeof o === "object" ? o.name : o).join(", "),
            extractedName: item.subjectUniversity || "없음",
            orgScore,
            nameScore,
            dateScore,
            breakdown: `${orgScore > 0 ? "기관명(" + orgScore + "점) " : ""}${nameScore > 0 ? "교수명(" + nameScore + "점) " : ""}${dateScore > 0 ? "협약일(" + dateScore + "점) " : ""}`
          };
        }
      });

      const fileData = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(typeof ev.target?.result === "string" ? ev.target.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

      const selectedMatch = matchedTarget as AgreementItem | null;
      if (maxScore >= 70 && selectedMatch) {
        results.push({
          fileName,
          file,
          fileData,
          status: "success",
          targetId: selectedMatch.id,
          targetDesc: `${selectedMatch.organizations.map(o => typeof o === "object" ? o.name : o).join(", ")} (${selectedMatch.date})`,
          score: maxScore,
          details: bestDetails
        });
      } else {
        results.push({
          fileName,
          file,
          fileData,
          status: "fail",
          targetId: null,
          targetDesc: "일치하는 협약 데이터를 찾지 못함 (매칭 점수 70점 미만)",
          score: maxScore,
          details: {
            extractedOrg: "없음",
            extractedName: "없음",
            orgScore: 0,
            nameScore: 0,
            dateScore: 0,
            breakdown: "조건 미달 (70점 미만)"
          }
        });
      }
    }

    setBatchAgreementResults(results);
    setIsAgreementBatchModalOpen(true);
    e.target.value = "";
  };

  // 1-2. 협약 사본 일괄 적용 핸들러 (Supabase Storage 버킷 순차 업로드 및 로딩 Progress 제공)
  const handleApplyBatchAgreements = async () => {
    const successItems = batchAgreementResults.filter(res => res.status === "success" && res.targetId);
    if (successItems.length === 0) return;

    let appliedCount = 0;
    
    // 업로드 시각 피드백 알림
    const isConfirmed = window.confirm(`매칭 성공된 ${successItems.length}개의 파일을 Supabase Storage 저장소에 순서대로 업로드하고 동기화할까요?`);
    if (!isConfirmed) return;

    setIsUploading(true);
    setUploadStatusText(`업로드 대기 중... (0 / ${successItems.length})`);

    const uploadResults = [];
    
    // 병목 및 타임아웃을 예방하기 위해 1건씩 안전하게 순차적으로 업로드합니다.
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
          .from("agreements")
          .upload(storagePath, targetFile);

        if (error) throw error;

        // 공개 읽기 주소(Public URL) 획득
        const { data: { publicUrl } } = supabase.storage
          .from("agreements")
          .getPublicUrl(data.path);

        uploadResults.push({
          targetId: res.targetId,
          fileName: normalizedName,
          publicUrl
        });
      } catch (err) {
        console.error("Storage upload failed for file:", res.fileName, err);
      }
      
      // 서버 과부하를 막기 위한 미세한 시간 지연
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

    setAgreements?.(prev =>
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

    alert(`총 ${appliedCount}건의 협약 사본 파일이 스토리지 업로드 및 반영 완료되었습니다.`);
    setIsAgreementBatchModalOpen(false);
    setBatchAgreementResults([]);
  };



  // 1-1. 협약기관 동적 추가/제거
  const handleAddOrgField = () => {
    setInputOrganizations([...inputOrganizations, { name: "", subject: "" }]);
  };

  const handleRemoveOrgField = (index: number) => {
    if (inputOrganizations.length <= 1) return;
    setInputOrganizations(inputOrganizations.filter((_, i) => i !== index));
  };

  const handleOrgChange = (index: number, field: keyof AgreementOrg, value: string) => {
    const updated = [...inputOrganizations];
    updated[index] = { ...updated[index], [field]: value };
    setInputOrganizations(updated);
  };

  const handleToggleContent = (content: string) => {
    if (inputContents.includes(content)) {
      setInputContents(inputContents.filter(c => c !== content));
    } else {
      setInputContents([...inputContents, content]);
    }
  };

  // 모의 파일 업로드 (Supabase Storage 버킷 업로드 연동)
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, _kind?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const normalizedName = file.name.normalize("NFC");
      setInputFileName("업로드 중...");
      try {
        // 한글 깨짐 및 Storage 특수기호 에러(Invalid key) 방지를 위해 물리 파일명은 영문/숫자 고유 ID로 치환
        const fileExt = normalizedName.substring(normalizedName.lastIndexOf(".")).toLowerCase();
        const storagePath = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${fileExt}`; // agreements 전용 버킷 루트에 업로드
        const { data, error } = await supabase.storage
          .from("agreements") // agreements 버킷명 반영
          .upload(storagePath, file);

        if (error) throw error;

        // 업로드 완료 후 공개 읽기 주소(Public URL) 획득
        const { data: { publicUrl } } = supabase.storage
          .from("agreements")
          .getPublicUrl(data.path);

        setInputFileName(normalizedName);
        setInputFileData(publicUrl); // DB 및 상태값에 URL 저장
      } catch (err) {
        console.error("Storage upload error:", err);
        alert("사본 파일 업로드에 실패했습니다. Storage 버킷 상태와 정책을 확인해 주세요.");
        setInputFileName("");
        setInputFileData("");
      }
    }
  };

  // 사본 뷰어 팝업 연동 (원격 URL 및 Base64 하이브리드 지원)
  const handleViewFile = (fileData?: string | null, _fileName?: string | null) => {
    try {
      if (!fileData) {
        alert("⚠️ 등록된 사본 파일 데이터(URL)가 존재하지 않습니다. 사본 일괄 매핑 등을 통해 파일을 먼저 등록해 주세요.");
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
    } catch (e) {
      alert("⚠️ 사본 파일을 여는 중에 오류가 발생했습니다. 파일이 손상되었거나 브라우저 권한을 확인해 주세요.");
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

  // 1-3. 협약 저장 핸들러
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputDate) return alert("협약 체결일자를 선택해 주세요.");

    const calculatedYear = getYearFromDate(inputDate);
    if (!calculatedYear || calculatedYear < 1 || calculatedYear > 5) {
      alert("유효한 앵커 사업 기간 내의 날짜를 선택해 주세요. (2025년 3월 이후)");
      return;
    }

    const cleanOrgs = inputOrganizations.map(o => ({ name: o.name.trim(), subject: (o.subject || "").trim() })).filter(o => o.name);
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
      onUpdateAgreement?.(editingId, payload);
    } else {
      onAddAgreement?.(payload);
    }

    // [지산학 파트너십 CRM 연계 적재]
    // 협약 대상기관(cleanOrgs) 목록을 파트너기관 테이블(partner_institutions)에 자동 upsert 연동합니다.
    if (cleanOrgs.length > 0) {
      const partnerPayloads = cleanOrgs.map(org => ({
        name: org.name,
        category: "산업체",         // 기본 대분류 설정
        sub_category: org.subject || "", // 세부분류로 직책 정보 전달
        location: "울산",          // 기본 지역 설정
        sectors: inputContents      // 협약내용 범주를 파트너 협력분야로 자동 연계
      }));

      supabase.from("partner_institutions")
        .upsert(partnerPayloads, { onConflict: "name" })
        .then(({ error }) => {
          if (error) console.error("Failed to auto-upsert partner institutions from agreement:", error);
          else console.log("Successfully auto-upserted partner institutions from agreement.");
        }, err => console.error("Error in auto-upsert partner:", err));
    }

    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* 툴바 제어부 (협약서 전용으로 축소) */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", borderBottom: "1px solid var(--border-color-dark)", paddingBottom: "0.5rem" }}>

        {/* 신규 등록 & 엑셀 다운로드 제어부 */}
        {(currentRole.rank <= 2) && (
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            {/* 엑셀 서식 다운로드 */}
            <button
              onClick={handleDownloadTemplate}
              className="action-btn download-btn"
              style={{
                background: "var(--bg-tertiary)"
              }}
            >
              <FileText size={16} /> 엑셀 서식
            </button>

            {/* 엑셀 업로드 */}
            <label
              className="action-btn upload-btn"
              style={{
                cursor: "pointer"
              }}
            >
              <Upload size={16} /> 엑셀 업로드
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelImport}
                style={{ display: "none" }}
              />
            </label>

            {/* 사본 일괄 매핑 */}
            <label
              className="action-btn"
              style={{
                background: !isLight ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5",
                color: !isLight ? "#34d399" : "#059669",
                border: !isLight ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid #10b981",
                cursor: "pointer"
              }}
            >
              <FileCheck size={16} /> 사본 일괄 매핑
              <input
                type="file"
                multiple
                accept=".pdf, .hwp, .hwpx, .jpg, .jpeg, .png"
                onChange={handleBatchAgreementImport}
                style={{ display: "none" }}
              />
            </label>

            {/* 엑셀 다운로드 */}
            <a
              href={excelDownloadUrl || "#"}
              download={excelDownloadUrl ? `Agreement_List_Year_${selectedYear}.xlsx` : undefined}
              onClick={(e) => {
                if (!excelDownloadUrl) {
                  e.preventDefault();
                  alert("다운로드할 데이터가 없습니다.");
                }
              }}
              className="action-btn download-btn"
              style={{
                cursor: excelDownloadUrl ? "pointer" : "not-allowed",
                textDecoration: "none"
              }}
            >
              <Download size={16} /> 엑셀 다운로드
            </a>

            {/* 신규 추가 (모양은 캡슐 형태를 유지하고 크기는 엑셀 버튼과 통일) */}
            {currentRole.id !== "GUEST" && (
              <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }} 
                className="action-btn"
                style={{ 
                  borderRadius: "9999px", 
                  background: "var(--accent-color)", 
                  border: "none", 
                  color: "white", 
                  fontWeight: "700", 
                  padding: "0.5rem 1.2rem" 
                }}
              >
                <Plus size={16} /> 신규 등록
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. 협약 관리 View */}
      <>
        {/* 단위과제 필터링 다중 선택 제어부 */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          background: "var(--background-card, rgba(30, 41, 59, 0.05))",
          padding: "0.85rem 1.25rem",
          borderRadius: "0.5rem",
          border: "1px solid var(--border-color)",
          marginBottom: "0.25rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)" }}>
              🔍 단위과제 다중 선택 필터
            </span>
            {selectedUnits.length > 0 && (
              <button
                onClick={handleClearUnitFilter}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-color)",
                  fontSize: "0.68rem",
                  cursor: "pointer",
                  fontWeight: "600",
                  padding: 0
                }}
              >
                필터 초기화
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <button
              onClick={handleClearUnitFilter}
              style={{
                padding: "0.3rem 0.65rem",
                fontSize: "0.7rem",
                fontWeight: "700",
                borderRadius: "0.25rem",
                cursor: "pointer",
                border: "1px solid " + (selectedUnits.length === 0 ? "var(--accent-color)" : "var(--border-color)"),
                background: selectedUnits.length === 0 ? "var(--accent-color)" : "transparent",
                color: selectedUnits.length === 0 ? "white" : "var(--text-primary)",
                transition: "all 0.15s ease"
              }}
            >
              전체
            </button>
            {availableUnits.map((unit) => {
              const isSelected = selectedUnits.includes(unit.id);
              return (
                <button
                  key={unit.id}
                  onClick={() => handleToggleUnitFilter(unit.id)}
                  title={unit.title}
                  style={{
                    padding: "0.3rem 0.65rem",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    border: "1px solid " + (isSelected ? "var(--accent-color)" : "var(--border-color)"),
                    background: isSelected ? "rgba(59, 130, 246, 0.15)" : "var(--background-card, rgba(255, 255, 255, 0.5))",
                    color: isSelected ? "var(--accent-color)" : "var(--text-primary)",
                    transition: "all 0.15s ease"
                  }}
                >
                  {unit.id}
                </button>
              );
            })}
          </div>
        </div>

        {filteredAgreements.filter(a => !isDateValidForYear(a.date, Number(selectedYear ?? 1))).length > 0 && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "0.375rem", padding: "0.6rem 0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle color="#ef4444" size={14} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "0.72rem", color: "#fca5a5" }}>
              <strong>⚠️ 사업기간 불일치 협약서 감지:</strong> 선택하신 차년도의 정식 사업기간을 벗어난 체결 건이 있습니다. 수정 아이콘을 통해 일자를 조정하십시오.
            </span>
          </div>
        )}

        <div className="table-container" style={{ border: "1px solid var(--border-color)", borderRadius: "0.5rem", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", color: "var(--text-primary)" }}>
            <thead>
              <tr style={{ background: isLight ? "rgba(0, 0, 0, 0.02)" : "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid var(--border-color-dark)" }}>
                <th onClick={() => requestSort("date")} style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "10%", cursor: "pointer" }}>
                  날짜 {sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                </th>
                <th onClick={() => requestSort("center")} style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "10%", cursor: "pointer" }}>
                  관련 센터 {sortConfig.key === "center" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                </th>
                <th onClick={() => requestSort("organizations")} style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "16%", cursor: "pointer" }}>
                  협약기관 {sortConfig.key === "organizations" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                </th>
                <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", width: "22%" }}>협약주체 (UC & 타기관)</th>
                <th onClick={() => requestSort("unitId")} style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "8%", cursor: "pointer" }}>
                  단위과제 {sortConfig.key === "unitId" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                </th>
                <th onClick={() => requestSort("agreementType")} style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "10%", cursor: "pointer" }}>
                  협약유형 {sortConfig.key === "agreementType" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "⇅"}
                </th>
                <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "14%" }}>협약내용 범주</th>
                <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "5%" }}>사본</th>
                {(currentRole.rank <= 2) && <th style={{ padding: "0.6rem 0.8rem", textAlign: "center", width: "5%" }}>제어</th>}
              </tr>
            </thead>
            <tbody>
              {displayAgreements.length === 0 ? (
                <tr>
                  <td colSpan={currentRole.rank <= 2 ? 9 : 8} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    등록된 협약서 내역이 없거나 필터 조건에 맞는 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                displayAgreements.map((agr) => {
                  const hasInvalidDate = !isDateValidForYear(agr.date, Number(selectedYear ?? 1));
                  return (
                    <tr key={agr.id} style={{ borderBottom: "1px solid var(--border-color-dark)", background: hasInvalidDate ? "rgba(239, 68, 68, 0.05)" : "transparent" }}>
                      <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>{agr.date}</td>
                      <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                        <span style={{ 
                          background: isLight ? "#eff6ff" : "rgba(96,165,250,0.1)", 
                          color: isLight ? "#1e40af" : "#60a5fa", 
                          border: isLight ? "1px solid #bfdbfe" : "1px solid rgba(96,165,250,0.2)",
                          padding: "0.15rem 0.4rem", 
                          borderRadius: "0.25rem", 
                          fontSize: "0.65rem", 
                          fontWeight: "700" 
                        }}>{agr.center}</span>
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                        {Array.isArray(agr.organizations) ? (
                          agr.organizations.map((org, i) => (
                            <span key={i} style={{ 
                              background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.06)", 
                              border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.15)",
                              padding: "0.15rem 0.4rem", 
                              borderRadius: "0.25rem", 
                              color: isLight ? "#334155" : "#e2e8f0", 
                              fontWeight: "700",
                              marginRight: "0.2rem",
                              display: "inline-block"
                            }}>
                              {typeof org === "object" ? org.name : org}
                            </span>
                          ))
                        ) : (
                          <span style={{ 
                            background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.06)", 
                            border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(255, 255, 255, 0.15)",
                            padding: "0.15rem 0.4rem", 
                            borderRadius: "0.25rem", 
                            color: isLight ? "#334155" : "#e2e8f0",
                            fontWeight: "700"
                          }}>{agr.organizations}</span>
                        )}
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem", textAlign: "left" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                          <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>🏫 UC: {agr.subjectUniversity}</span>
                          <span style={{ color: isLight ? "#2563eb" : "var(--accent-color)", fontWeight: "700" }}>🤝 타기관: {agr.subjectOrganization}</span>
                        </div>
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem", fontWeight: "700", textAlign: "center" }}>{agr.unitId}</td>
                      <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                        <span style={{
                          background: agr.agreementType === "프리미엄" ? (isLight ? "#fdf2f8" : "rgba(236,72,153,0.15)") : agr.agreementType === "무료" ? (isLight ? "#eff6ff" : "rgba(59,130,246,0.15)") : "transparent",
                          color: agr.agreementType === "프리미엄" ? "#db2777" : agr.agreementType === "무료" ? "#2563eb" : "var(--text-secondary)",
                          border: agr.agreementType === "프리미엄" ? (isLight ? "1px solid #fbcfe8" : "none") : agr.agreementType === "무료" ? (isLight ? "1px solid #bfdbfe" : "none") : "none",
                          padding: agr.agreementType !== "-" ? "0.15rem 0.35rem" : "0",
                          borderRadius: "0.25rem",
                          fontSize: "0.65rem",
                          fontWeight: agr.agreementType !== "-" ? "700" : "normal"
                        }}>
                          {agr.agreementType || "-"}
                        </span>
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                        {Array.isArray(agr.contents) && agr.contents.map((c, i) => (
                          <span key={i} style={{ 
                            background: isLight ? "#ecfdf5" : "rgba(52,211,153,0.1)", 
                            color: isLight ? "#059669" : "#34d399", 
                            border: isLight ? "1px solid #a7f3d0" : "1px solid rgba(52,211,153,0.2)",
                            padding: "0.1rem 0.3rem", 
                            borderRadius: "0.2rem", 
                            fontSize: "0.65rem", 
                            fontWeight: "700",
                            marginRight: "0.2rem" 
                          }}>{c}</span>
                        ))}
                      </td>
                      <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                        {agr.fileName ? (
                          <FileText size={16} style={{ color: "#60a5fa", cursor: "pointer" }} onClick={() => handleViewFile(agr.fileData, agr.fileName)} />
                        ) : "-"}
                      </td>
                      {(currentRole.rank <= 2) && (
                        <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                            {currentRole.id !== "GUEST" && (
                              <>
                                <button onClick={() => {
                                  setEditingId(agr.id ?? null);
                                  setInputDate(agr.date || "");
                                  setInputCenter(agr.center || "ECC센터");
                                  setInputOrganizations(Array.isArray(agr.organizations) ? agr.organizations.map(o => typeof o === "object" ? { name: o.name || "", subject: o.subject || "" } : { name: o, subject: "" }) : [{ name: "", subject: "" }]);

                                  const subUniv = agr.subjectUniversity || "단장";
                                  setInputSubjectUniv(subUniv);
                                  // 대학 측 협약주체가 고정 유형('총장', '단장', '센터장')에 해당하는지 검사하여 해당 버튼을 활성화합니다.
                                  if (["총장", "단장", "센터장"].includes(subUniv)) {
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
                                }} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }} title="수정">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => { if (confirm("이 협약서를 삭제하시겠습니까?") && agr.id !== undefined) onDeleteAgreement?.(agr.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} title="삭제">
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

      {/* A. 협약서 등록 및 수정 모달 */}
      {isModalOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", overflowY: "auto", padding: "2rem 1rem" }}>
          <div style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", width: "100%", maxWidth: "550px", maxHeight: "85vh", display: "flex", flexDirection: "column", color: "var(--text-primary)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800" }}>⚓ {editingId ? "협약서 정보 수정" : "신규 등록"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>협약 체결일자</label>
                  <input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} className="form-input" style={{ fontSize: "0.78rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>관련 센터</label>
                  <select value={inputCenter} onChange={(e) => setInputCenter(e.target.value)} className="form-select" style={{ fontSize: "0.78rem" }}>
                    {CENTERS_LIST.map((c) => (
                      <option key={c} value={c} style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>협약 대상기관 및 기관 측 협약주체 목록</label>
                  <button type="button" onClick={handleAddOrgField} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.1rem", fontWeight: "600" }}>
                    <Plus size={12} /> 기관 추가
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.40rem" }}>
                  {inputOrganizations.map((org, index) => (
                    <div key={index} style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                      <input type="text" placeholder={`협약 대상기관 ${index + 1}`} value={org.name || ""} onChange={(e) => handleOrgChange(index, "name", e.target.value)} className="form-input" style={{ flex: 1.3, fontSize: "0.78rem" }} />
                      <input type="text" placeholder="직위/성명 (예: 총장 오연천)" value={org.subject || ""} onChange={(e) => handleOrgChange(index, "subject", e.target.value)} className="form-input" style={{ flex: 1, fontSize: "0.78rem" }} />
                      {inputOrganizations.length > 1 && (
                        <button type="button" onClick={() => handleRemoveOrgField(index)} style={{ background: "#3f3f46", border: "none", color: "#ef4444", borderRadius: "0.25rem", padding: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "30px", minWidth: "30px" }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: "600" }}>대학 측 협약주체 (UC)</label>
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: univSubjectType === "기타" ? "0.4rem" : "0" }}>
                  {["총장", "단장", "센터장", "기타"].map((t) => {
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
                          padding: "0.45rem 0.5rem",
                          fontSize: "0.65rem",
                          fontWeight: "700",
                          borderRadius: "0.25rem",
                          border: isSelected ? "1.5px solid var(--accent-color)" : "1.5px solid var(--border-color)",
                          background: isSelected ? "rgba(59, 130, 246, 0.15)" : "var(--input-bg)",
                          color: isSelected ? "var(--accent-color)" : "var(--text-secondary)",
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
                      className="form-input"
                      style={{ flex: 1.3, fontSize: "0.78rem" }}
                    />
                    <input
                      type="text"
                      placeholder="성명 (예: 홍길동 교수)"
                      value={inputSubjectUnivName}
                      onChange={(e) => setInputSubjectUnivName(e.target.value)}
                      className="form-input"
                      style={{ flex: 1, fontSize: "0.78rem" }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>관련 단위과제</label>
                <select value={inputUnitId} onChange={(e) => setInputUnitId(e.target.value)} className="form-select" style={{ fontSize: "0.78rem" }}>
                  <option value="" style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>-- 관련 단위과제 선택 --</option>
                  {availableUnits.map((u) => (
                    <option key={u.id} value={u.id} style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>{u.id}. {u.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: "600" }}>협약유형</label>
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
                          padding: "0.45rem 0.5rem",
                          fontSize: "0.65rem",
                          fontWeight: "700",
                          borderRadius: "0.25rem",
                          border: isSelected ? "1.5px solid #ec4899" : "1.5px solid var(--border-color)",
                          background: isSelected ? "rgba(236, 72, 153, 0.15)" : "var(--input-bg)",
                          color: isSelected ? "#ec4899" : "var(--text-secondary)",
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
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: "600" }}>협약 내용 범주 (다중 선택)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {AGREEMENT_CONTENTS_OPTIONS.map((c) => {
                    const isSelected = inputContents.includes(c);
                    return (
                      <button 
                        key={c} 
                        type="button" 
                        onClick={() => handleToggleContent(c)} 
                        style={{ 
                          padding: "0.3rem 0.65rem", 
                          fontSize: "0.6rem", 
                          borderRadius: "2rem", 
                          border: isSelected ? "1.5px solid #34d399" : "1.5px solid var(--border-color)", 
                          background: isSelected ? "rgba(52,211,153,0.15)" : "var(--input-bg)", 
                          color: isSelected ? "#34d399" : "var(--text-secondary)", 
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>협약서 사본 업로드</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.4rem 0.75rem", fontSize: "0.65rem", background: "var(--input-bg)", color: "var(--text-primary)", borderRadius: "6px", cursor: "pointer", border: "1.5px solid var(--border-color)", transition: "all 0.2s ease", fontWeight: "700" }}>
                    <Upload size={14} /> 파일 선택
                    <input type="file" onChange={(e) => handleFileChange(e, "agreement")} style={{ display: "none" }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                  </label>
                  <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>{inputFileName ? `📁 ${inputFileName}` : "선택된 파일 없음"}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}>취소</button>
                <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}>저장하기</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================== */}
      {/* [1] 협약(Agreements) 사본 일괄 매핑 결과 리포트 모달 */}
      {/* ========================================== */}
      {isAgreementBatchModalOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", overflowY: "auto", padding: "2rem 1rem" }}>
          <div style={{ background: "var(--modal-bg)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", width: "100%", maxWidth: "680px", maxHeight: "85vh", display: "flex", flexDirection: "column", color: "var(--text-primary)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FileCheck size={18} style={{ color: "#10B981" }} /> 협약서 사본 일괄 자동 매핑 리포트
              </h3>
              <button onClick={() => setIsAgreementBatchModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "1.25rem", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", background: "var(--input-bg)", padding: "0.75rem", borderRadius: "0.35rem", border: "1px solid var(--border-color)" }}>
                💡 [매칭 조건]: 파일명에 포함된 <b>기관명(40점)</b>, <b>교수성명(30점)</b>, <b>협약일 YYYYMMDD(30점)</b>의 가중치를 계산하여, 합산 점수가 <b>70점 이상</b>인 데이터를 자동 매칭 및 매핑합니다.
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "700" }}>
                <span>분석 대상 파일: {batchAgreementResults.length}개</span>
                <span style={{ color: "#34D399" }}>매칭 성공: {batchAgreementResults.filter(r => r.status === "success").length}개</span>
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
                    {batchAgreementResults.map((res, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border-color)", background: res.status === "success" ? "rgba(16,185,129,0.03)" : "rgba(239,68,68,0.03)" }}>
                        <td style={{ padding: "0.5rem", color: "var(--text-primary)", fontWeight: "500", border: "1px solid var(--border-color)" }}>
                          <div style={{ wordBreak: "break-all" }}>📁 {res.fileName}</div>
                        </td>
                        <td style={{ padding: "0.5rem", border: "1px solid var(--border-color)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>
                              🏢 기관명: <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>{res.details?.extractedOrg || "없음"} ({res.details?.orgScore || 0}점)</span> |
                              👤 교수명: <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>{res.details?.extractedName || "없음"} ({res.details?.nameScore || 0}점)</span> |
                              📅 협약일: <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>{res.details?.dateScore > 0 ? "일치" : "불일치"} ({res.details?.dateScore || 0}점)</span>
                            </div>
                            <div style={{
                              fontSize: "0.68rem",
                              color: "var(--text-primary)",
                              fontWeight: "700",
                              marginTop: "0.15rem"
                            }}>
                              🏆 총점: <span style={{ color: res.status === "success" ? "#34D399" : "#F87171" }}>{res.score}점</span> (기준: 70점 이상)
                            </div>
                            <div style={{
                              fontSize: "0.62rem",
                              color: res.status === "success"
                                ? (isLight ? "#059669" : "#34D399") // 성공 글자색 (라이트: 진한 초록, 다크: 밝은 민트)
                                : (isLight ? "#DC2626" : "#F87171"), // 실패 글자색 (라이트: 진한 빨간색, 다크: 밝은 핑크)
                              background: res.status === "success"
                                ? (isLight ? "rgba(16,185,129,0.08)" : "rgba(52,211,153,0.15)") // 성공 배경색
                                : (isLight ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.15)"), // 실패 배경색
                              padding: "0.15rem 0.35rem",
                              borderRadius: "0.2rem",
                              display: "inline-block",
                              width: "fit-content",
                              border: "1px solid var(--border-color)",
                              marginTop: "0.15rem"
                            }}>
                              ⚡ 득점 항목: {res.details?.breakdown || "조건 미달 (70점 미만)"}
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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", padding: "0.85rem 1.25rem", flexShrink: 0 }}>
              <button type="button" className="btn-secondary" onClick={() => setIsAgreementBatchModalOpen(false)} style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}>취소</button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleApplyBatchAgreements}
                disabled={batchAgreementResults.filter(r => r.status === "success").length === 0}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.75rem",
                  background: batchAgreementResults.filter(r => r.status === "success").length === 0 ? "#52525b" : "var(--accent-color)", // 💡 var(--primary-color)를 var(--accent-color)로 안전하게 교체
                  cursor: batchAgreementResults.filter(r => r.status === "success").length === 0 ? "not-allowed" : "pointer"
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
            background: "var(--modal-bg)",
            padding: "30px 40px",
            borderRadius: "0.75rem",
            textAlign: "center",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            border: "1px solid var(--border-color)",
            maxWidth: "400px",
            width: "90%",
            margin: "auto"
          }}>
            {/* 빙글빙글 도는 스피너 애니메이션 */}
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

      {/* ========================================== */}
    </div>
  );
}
