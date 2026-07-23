import React, { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Plus, Trash2, Edit, Search, Download, Upload, X, Globe, ArrowUpDown } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "../supabaseClient";
import type { TablesInsert } from "../types/supabase";

type PartnerRecord = TablesInsert<"partner_institutions">;
type PartnerSortField = "name" | "category" | "sub_category" | "location";

// 협력 내용 범주 목록 (협약 관리와 통일)
const SECTOR_OPTIONS = [
  "주문식교육", "창업", "글로벌", "R&BD", "AIDX", "탄소중립",
  "복합재난", "평생교육", "늘봄", "지역현안해결", "보건복지서비스", "에코컬처", "도시재생"
];

// 대분류 옵션
const CATEGORY_OPTIONS = [
  "공공기관", "유관기관", "산업체", "대학", "지역사회"
];

// 세부분류 매핑
const SUB_CATEGORY_OPTIONS: Record<string, string[]> = {
  "공공기관": ["시청", "구청", "군청", "교육청", "기타"],
  "유관기관": ["진흥원", "테크노파크", "센터", "협회", "기타"],
  "산업체": ["대기업", "중견기업", "중소기업", "스타트업", "외투기업"],
  "대학": ["일반대학", "전문대학", "석사과정", "협의체", "해외대학"],
  "지역사회": ["주민자치회", "사회공헌단체", "복지관", "기타"]
};

// 2차년도 기본 모의 데이터셋 (데이터가 비어있을 시 자동 폴백 적재용)
const MOCK_PARTNERS: PartnerRecord[] = [
  { name: "울산광역시청", category: "공공기관", sub_category: "시청", location: "울산", sectors: ["지역현안해결", "도시재생", "AIDX"], contact_person: "정민우 서기관", contact_phone: "052-229-2000", remarks: "울산 앵커 기획 기본 수립 및 예산 배분 총괄" },
  { name: "울산동구청", category: "공공기관", sub_category: "구청", location: "울산", sectors: ["지역현안해결", "창업", "평생교육"], contact_person: "한서진 팀장", contact_phone: "052-209-3000", remarks: "동구 청년친화도시 조성 및 T:IM 1219 청소년 벽화 공동 추진" },
  { name: "울산남구청", category: "공공기관", sub_category: "구청", location: "울산", sectors: ["지역현안해결", "늘봄"], contact_person: "이진아 주무관", contact_phone: "052-226-0000", remarks: "남구 아동 돌봄 및 늘봄학교 지역 연계 모델 협력" },
  { name: "울산북구청", category: "공공기관", sub_category: "구청", location: "울산", sectors: ["지역현안해결", "평생교육"], contact_person: "최재원 팀장", contact_phone: "052-241-0000", remarks: "북구 평생학습관 프로그램 및 정주 여건 개선 협력" },
  { name: "울산중구청", category: "공공기관", sub_category: "구청", location: "울산", sectors: ["지역현안해결", "도시재생"], contact_person: "박동현 주무관", contact_phone: "052-290-0000", remarks: "중구 구도심 도시재생 활성화 프로젝트 공동 기획" },
  { name: "울산울주군청", category: "공공기관", sub_category: "군청", location: "울산", sectors: ["지역현안해결", "보건복지서비스"], contact_person: "김영희 과장", contact_phone: "052-204-0000", remarks: "울주군 농어촌 의료 취약지역 방문 간호/보건 실습 연계" },
  { name: "울산정보산업진흥원", category: "유관기관", sub_category: "진흥원", location: "울산", sectors: ["AIDX", "R&BD"], contact_person: "이승호 연구원", contact_phone: "052-210-0200", remarks: "AIDX 재학생/재직자 40시간 현장 융합 교육 장비 공동 운영" },
  { name: "울산TP", category: "유관기관", sub_category: "테크노파크", location: "울산", sectors: ["R&BD", "AIDX"], contact_person: "김재호 본부장", contact_phone: "052-219-0000", remarks: "지산학 핵심 장비 구축 심의 및 신산업 육성 R&D 매칭" },
  { name: "울산청년지원센터", category: "유관기관", sub_category: "센터", location: "울산", sectors: ["창업", "평생교육"], contact_person: "이지훈 센터장", contact_phone: "052-229-0000", remarks: "청년 창업 생태계 활성화 및 취창업 특강 교류" },
  { name: "울산경제일자리진흥원", category: "유관기관", sub_category: "진흥원", location: "울산", sectors: ["창업", "주문식교육"], contact_person: "강민구 팀장", contact_phone: "052-283-0000", remarks: "청년 및 중장년 일자리 매칭, 기업 맞춤형 직무 훈련 연계" },
  { name: "HD현대중공업", category: "산업체", sub_category: "대기업", location: "울산", sectors: ["주문식교육", "글로벌"], contact_person: "김두환 실장", contact_phone: "052-202-2114", remarks: "조선해양 미래 전문기술인재 채용연계 맞춤형 주문식 트랙 가동" },
  { name: "HD현대이엔티", category: "산업체", sub_category: "대기업", location: "울산", sectors: ["주문식교육", "AIDX"], contact_person: "이성민 파트장", contact_phone: "052-202-0000", remarks: "기계시스템전공 HD현대이엔티 공동 맞춤형 주문식 교육 트랙" },
  { name: "SK AX", category: "산업체", sub_category: "대기업", location: "울산", sectors: ["AIDX", "R&BD"], contact_person: "정지우 수석", contact_phone: "052-270-0000", remarks: "인공지능 전환(AX) 신기술 기반 산학 공동 연구 및 훈련 지원" },
  { name: "SK이노베이션", category: "산업체", sub_category: "대기업", location: "울산", sectors: ["탄소중립", "R&BD"], contact_person: "한승우 부장", contact_phone: "052-208-0000", remarks: "정밀 화학공정 고도화 및 탄소배출 저감 친환경 화공 기술 개발 협력" },
  { name: "S-OIL", category: "산업체", sub_category: "대기업", location: "울산", sectors: ["주문식교육", "R&BD"], contact_person: "박현철 실장", contact_phone: "052-231-0000", remarks: "S-OIL 정유공정 전문 직무 연수 및 장학 지원 협약 기업" },
  { name: "AWS", category: "산업체", sub_category: "대기업", location: "서울", sectors: ["AIDX", "주문식교육"], contact_person: "윤준호 이사", contact_phone: "02-3430-0000", remarks: "AWS C3 클라우드 컴퓨팅 국제 자격 과정 공동 교육 및 AI 솔루션 실증" },
  { name: "대한유화", category: "산업체", sub_category: "중견기업", location: "울산", sectors: ["주문식교육", "R&BD"], contact_person: "최만호 공장장", contact_phone: "052-231-0114", remarks: "화학공학과 정밀화학 공정 기술 전문 인력 양성 주문식 트랙 기업" },
  { name: "정테크", category: "산업체", sub_category: "중소기업", location: "울산", sectors: ["주문식교육", "R&BD"], contact_person: "정민규 대표", contact_phone: "052-289-0000", remarks: "기계 가공 및 정밀 PLC 제어 장비 학내 공동 기술 활용 협력사" },
  { name: "HHS", category: "산업체", sub_category: "스타트업", location: "울산", sectors: ["창업", "R&BD"], contact_person: "한형섭 대표", contact_phone: "052-911-3000", remarks: "안전 헬멧 스마트 바이오 센서 기술이전 및 산학공동 R&D 과제 협력" },
  { name: "제주한라대학교", category: "대학", sub_category: "전문대학", location: "제주", sectors: ["글로벌", "AIDX"], contact_person: "고지혁 처장", contact_phone: "064-741-7500", remarks: "AI 인재양성 및 초광역 앵커 협력 추진 협약 체결 대학" },
  { name: "울산대학교", category: "대학", sub_category: "일반대학", location: "울산", sectors: ["R&BD", "지역현안해결"], contact_person: "정지원 팀장", contact_phone: "052-259-2000", remarks: "지산학 공유대학 U-Spoke 얼라이언스 주관대학 공동 연구 개발 협력" },
  { name: "국립부경대학교", category: "대학", sub_category: "일반대학", location: "부산", sectors: ["글로벌", "R&BD"], contact_person: "최재혁 교수", contact_phone: "051-629-5114", remarks: "동남권 초광역 지산학 제조 혁신 공동 포럼 및 해양 바이오 공동 연구" },
  { name: "춘해보건대학교", category: "대학", sub_category: "전문대학", location: "울산", sectors: ["보건복지서비스", "늘봄"], contact_person: "이지안 센터장", contact_phone: "052-270-0100", remarks: "지역사회 통합 돌봄 및 초등 늘봄 융합 보건케어 인력풀 매칭 공동 협력" },
  { name: "연암공과대학교", category: "대학", sub_category: "전문대학", location: "경남", sectors: ["주문식교육", "AIDX"], contact_person: "박민수 실장", contact_phone: "055-751-3000", remarks: "스마트 팩토리 및 모빌리티 연계 공동 주문식 트랙 벤치마킹 파트너십" },
  { name: "마산대학교", category: "대학", sub_category: "전문대학", location: "경남", sectors: ["주문식교육", "보건복지서비스"], contact_person: "강은주 처장", contact_phone: "055-230-1100", remarks: "보건의료 시뮬레이션 공동 인프라 활용 및 현장 임상 실습 교류" },
  { name: "동의과학대학교", category: "대학", sub_category: "전문대학", location: "부산", sectors: ["주문식교육", "AIDX"], contact_person: "김영호 팀장", contact_phone: "051-860-3114", remarks: "동남권 지산학 융합 기술 사관생도 양성 협력 대학" },
  { name: "경남정보대학교", category: "대학", sub_category: "전문대학", location: "부산", sectors: ["창업", "주문식교육"], contact_person: "서동현 실장", contact_phone: "051-320-1200", remarks: "경남·울산권 창업교육혁신선도대학(SCOUT) 협의체 공동 스타트업 인재 육성" },
  { name: "연성대학교", category: "대학", sub_category: "전문대학", location: "경기", sectors: ["주문식교육", "AIDX"], contact_person: "오세현 교수", contact_phone: "031-441-1100", remarks: "수도권 지산학 우수 교육과정 모델 교류 및 디지털 융합 실증 협력" },
  { name: "인하공업전문대학", category: "대학", sub_category: "전문대학", location: "인천", sectors: ["주문식교육", "글로벌"], contact_person: "조윤오 실장", contact_phone: "032-870-2114", remarks: "조선·항공 정밀 제조 전문 기술 교육과정 표준화 벤치마킹 네트워크" },
  { name: "영진전문대학교", category: "대학", sub_category: "전문대학", location: "대구", sectors: ["주문식교육", "창업"], contact_person: "윤현우 처장", contact_phone: "053-940-5114", remarks: "국내 최고 수준 주문식 교육 트랙 모델 수립 및 공유 얼라이언스 파트너" },
  { name: "조선이공대학교", category: "대학", sub_category: "전문대학", location: "광주", sectors: ["주문식교육", "R&BD"], contact_person: "송태일 팀장", contact_phone: "062-230-8114", remarks: "광주-울산 스마트 모빌리티 및 기계 정밀 가공 분야 정보 네트워크 교류" },
  { name: "대림대학교", category: "대학", sub_category: "전문대학", location: "경기", sectors: ["주문식교육", "AIDX"], contact_person: "황인성 센터장", contact_phone: "031-467-4700", remarks: "수도권 전문기술석사 마이크로디그리 운영 모델 공유 및 AI 트랙 실증" },
  { name: "디지텍고등직업교육협의회", category: "대학", sub_category: "협의체", location: "서울", sectors: ["주문식교육", "AIDX"], contact_person: "이영수 사무국장", contact_phone: "02-500-1000", remarks: "전국 전문대학 디지털 전환 및 직업교육 공동 가치 창출 거버넌스 협의체" },
  { name: "WCC협의체", category: "대학", sub_category: "협의체", location: "전국", sectors: ["글로벌", "창업"], contact_person: "김태영 회장", contact_phone: "02-600-2000", remarks: "세계 수준의 전문대학(World Class College) 글로벌 역량 고도화 네트워크 얼라이언스" }
];

export interface PartnerManagerProps {
  selectedYear?: number | string;
  darkMode?: boolean;
  currentUser?: any;
  currentRole?: any;
}

export default function PartnerManager({ selectedYear }: PartnerManagerProps) {
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerRecord | null>(null);

  // 정렬 관련 상태
  const [sortField, setSortField] = useState<PartnerSortField>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // 폼 입력 상태
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("공공기관");
  const [formSubCategory, setFormSubCategory] = useState("");
  const [formLocation, setFormLocation] = useState("울산");
  const [formSectors, setFormSectors] = useState<string[]>([]);
  const [formContactPerson, setFormContactPerson] = useState("");
  const [formContactPhone, setFormContactPhone] = useState("");
  const [formRemarks, setFormRemarks] = useState("");

  // Supabase 또는 로컬 스토리지로부터 파트너 목록 불러오기
  const loadPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("partner_institutions")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setPartners(data);
      } else {
        // 데이터가 아예 없는 초기 시점에는 샘플 데이터 적재
        setPartners(MOCK_PARTNERS);
        // Supabase에 대용량 인서트 시도
        await supabase.from("partner_institutions").insert(MOCK_PARTNERS);
      }
    } catch (e) {
      console.warn("Failed to load partners from Supabase, loading fallback mock:", e);
      // 로컬 스토리지 캐시 백업
      const cached = localStorage.getItem("anchor_partner_institutions");
      if (cached) {
        try { setPartners(JSON.parse(cached) as PartnerRecord[]); } catch { setPartners(MOCK_PARTNERS); }
      } else {
        setPartners(MOCK_PARTNERS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  // 로컬 변경 사항 있을 때 로컬 스토리지 백업
  useEffect(() => {
    if (partners.length > 0) {
      localStorage.setItem("anchor_partner_institutions", JSON.stringify(partners));
    }
  }, [partners]);

  // 카테고리 대분류 변경 시 세부분류 초기값 설정
  useEffect(() => {
    const subOptions = SUB_CATEGORY_OPTIONS[formCategory] || [];
    if (subOptions.length > 0 && !subOptions.includes(formSubCategory)) {
      setFormSubCategory(subOptions[0]);
    }
  }, [formCategory]);

  // 모달 열기/닫기 제어
  const openAddModal = () => {
    setEditingPartner(null);
    setFormName("");
    setFormCategory("공공기관");
    setFormSubCategory("시청");
    setFormLocation("울산");
    setFormSectors([]);
    setFormContactPerson("");
    setFormContactPhone("");
    setFormRemarks("");
    setIsModalOpen(true);
  };

  const openEditModal = (partner: PartnerRecord) => {
    setEditingPartner(partner);
    setFormName(partner.name);
    setFormCategory(partner.category);
    setFormSubCategory(partner.sub_category || "");
    setFormLocation(partner.location);
    setFormSectors(partner.sectors || []);
    setFormContactPerson(partner.contact_person || "");
    setFormContactPhone(partner.contact_phone || "");
    setFormRemarks(partner.remarks || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
  };

  // 다중선택 분야 토글
  const toggleSector = (sector: string) => {
    if (formSectors.includes(sector)) {
      setFormSectors(formSectors.filter(s => s !== sector));
    } else {
      setFormSectors([...formSectors, sector]);
    }
  };

  // C.R.U.D 처리 핸들러
  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formName || !formLocation) {
      alert("기관명과 지역은 필수 입력값입니다.");
      return;
    }

    const payload = {
      name: formName,
      category: formCategory,
      sub_category: formSubCategory,
      location: formLocation,
      sectors: formSectors,
      contact_person: formContactPerson,
      contact_phone: formContactPhone,
      remarks: formRemarks
    };

    try {
      if (editingPartner) {
        // UPDATE
        if (editingPartner.id) {
          const { error } = await supabase
            .from("partner_institutions")
            .update(payload)
            .eq("id", editingPartner.id);
          if (error) throw error;
        }
        // 로컬 상태 수정
        setPartners(partners.map(p => p.id === editingPartner.id ? { ...p, ...payload } : p));
      } else {
        // CREATE
        const { data, error } = await supabase
          .from("partner_institutions")
          .insert([payload])
          .select();
        if (error) throw error;
        // 로컬 상태 추가
        const newRecord = data && data[0] ? data[0] : { ...payload, id: Date.now() };
        setPartners([newRecord, ...partners]);
      }
      closeModal();
    } catch (err) {
      console.error("Error saving partner:", err);
      alert("DB 저장 도중 오류가 발생했습니다. 로컬 임시본에 반영합니다.");
      // 오프라인/로컬 폴백 처리
      if (editingPartner) {
        setPartners(partners.map(p => p.name === editingPartner.name ? { ...p, ...payload } : p));
      } else {
        setPartners([{ ...payload, id: Date.now() }, ...partners]);
      }
      closeModal();
    }
  };

  const handleDelete = async (partner: PartnerRecord) => {
    if (!confirm(`정말로 '${partner.name}' 파트너기관을 목록에서 삭제하시겠습니까?`)) return;

    try {
      if (partner.id) {
        const { error } = await supabase
          .from("partner_institutions")
          .delete()
          .eq("id", partner.id);
        if (error) throw error;
      }
      setPartners(partners.filter(p => p.id !== partner.id && p.name !== partner.name));
    } catch (err) {
      console.error("Error deleting partner:", err);
      alert("DB 삭제에 실패했습니다. 로컬 목록에서 우선 차단합니다.");
      setPartners(partners.filter(p => p.id !== partner.id && p.name !== partner.name));
    }
  };

  // 엑셀 다운로드 (XLSX)
  const handleExcelExport = () => {
    const dataToExport = filteredPartners.map((p, idx) => ({
      번호: idx + 1,
      기관명: p.name,
      대분류: p.category,
      세부분류: p.sub_category || "-",
      지역: p.location,
      협력분야: (p.sectors || []).join(", "),
      담당자: p.contact_person || "-",
      연락처: p.contact_phone || "-",
      주요메모: p.remarks || "-"
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "파트너기관_대장");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
    const a = document.createElement("a");
    a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    a.download = `UC_ANCHOR_파트너기관_대장_${selectedYear}차년도.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 엑셀 서식 다운로드 (템플릿)
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "기관명": "울산대학교 (예시)",
        "대분류": "대학 (공공기관/유관기관/산업체/대학/지역사회 중 택1)",
        "세부분류": "일반대학 (전문대학/협의체/대기업/중견기업 등 선택)",
        "지역": "울산 (예시)",
        "협력분야": "주문식교육, R&BD (쉼표로 나열)",
        "담당자": "홍길동 팀장",
        "연락처": "052-123-4567",
        "주요메모": "앵커 사업 정밀 가공 공동 훈련 교류"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "파트너적재템플릿");
    
    // 열 너비 설정
    ws["!cols"] = Array(8).fill({ wch: 25 });

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
    const a = document.createElement("a");
    a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
    a.download = "UC_ANCHOR_파트너기관_업로드_서식.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 엑셀 업로드 (가져오기)
  const handleExcelImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const ws = workbook.Sheets[sheetName];
        const excelRows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

        // 로우 가공 및 검증
        const importedPartners = excelRows.map((row) => {
          const sectorsStr = row["협력분야"] || row["분야"] || "";
          const sectorsArr = sectorsStr ? sectorsStr.split(",").map(s => s.trim()) : [];
          return {
            name: row["기관명"] || row["파트너명"] || "무명기관",
            category: row["대분류"] || row["분류"] || "산업체",
            sub_category: row["세부분류"] || row["세부"] || "중소기업",
            location: row["지역"] || "울산",
            sectors: sectorsArr.filter(s => SECTOR_OPTIONS.includes(s)),
            contact_person: row["담당자"] || "",
            contact_phone: row["연락처"] || "",
            remarks: row["주요메모"] || row["메모"] || ""
          };
        });

        if (importedPartners.length > 0) {
          // Supabase 일괄 삽입 시도
          const { data: insData, error } = await supabase
            .from("partner_institutions")
            .insert(importedPartners)
            .select();
          
          if (error) throw error;
          
          setPartners([...(insData || importedPartners), ...partners]);
          alert(`엑셀 파일로부터 ${importedPartners.length}개의 파트너기관 정보를 성공적으로 업로드하여 적재했습니다!`);
        }
      } catch (err) {
        console.error("Excel Import Error:", err);
        alert("엑셀 구조 분석 중 에러가 발생했거나 필수 컬럼('기관명', '대분류', '지역')이 누락되었습니다.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // 필터링 및 검색 로직
  const filteredPartners = partners.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.contact_person || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.location || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // 정렬 핸들러
  const handleSort = (field: PartnerSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // 정렬 아이콘 렌더러
  const renderSortIcon = (field: PartnerSortField) => {
    const isActive = sortField === field;
    return (
      <ArrowUpDown 
        size={13} 
        style={{ 
          marginLeft: "0.4rem", 
          verticalAlign: "middle",
          color: isActive ? "var(--accent-color)" : "rgba(255,255,255,0.2)",
          transform: isActive && sortDirection === "desc" ? "rotate(180deg)" : "none",
          transition: "all 0.2s ease"
        }} 
      />
    );
  };

  // 정렬 적용된 최종 데이터
  const sortedPartners = [...filteredPartners].sort((a, b) => {
    const valA = String(a[sortField] || "");
    const valB = String(b[sortField] || "");

    return sortDirection === "asc"
      ? valA.localeCompare(valB, "ko")
      : valB.localeCompare(valA, "ko");
  });

  // 통계 계산
  const categoryStats = CATEGORY_OPTIONS.reduce<Record<string, number>>((acc, curr) => {
    acc[curr] = partners.filter(p => p.category === curr).length;
    return acc;
  }, {});

  return (
    <div className="partner-manager-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      {/* 1. 상단 안내 */}
      <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Globe size={22} />
          협력기관 정보 관리 (지·산·학 파트너십 CRM)
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
          울산과학대학교 앵커 사업의 핵심 동반자인 지자체, 공공기관, 유관 협회, 주요 산업체 및 교류 대학들의 협력기관 정보를 집중 보존하고 관리합니다.
          협약 관리 대장과도 유기적으로 연동하여 분야별 협력 역량을 통합 조회합니다.
        </p>
      </div>

      {/* 2. 분류별 파트너 수 요약 배지 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
        {CATEGORY_OPTIONS.map((cat) => (
          <div
            key={cat}
            onClick={() => setFilterCategory(filterCategory === cat ? "all" : cat)}
            className="glass-card clickable"
            style={{
              padding: "1rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: filterCategory === cat ? "rgba(59, 130, 246, 0.15)" : "var(--background-card, rgba(255, 255, 255, 0.02))",
              border: filterCategory === cat ? "1px solid var(--accent-color)" : "1px solid var(--border-color, rgba(255, 255, 255, 0.05))"
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "700" }}>{cat}</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", marginTop: "0.25rem", color: filterCategory === cat ? "var(--accent-color)" : "var(--text-primary)" }}>
              {categoryStats[cat] || 0} <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>개소</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. 테이블 컨트롤바 (검색, 등록, 엑셀 다운/업) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="기관명, 지역, 담당자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "0.5rem 1rem 0.5rem 2.5rem",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                background: "var(--background-card, rgba(0, 0, 0, 0.05))",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                width: "240px"
              }}
            />
          </div>

          {filterCategory !== "all" && (
            <button
              onClick={() => setFilterCategory("all")}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "none",
                background: "var(--input-bg)",
                color: "white",
                fontSize: "0.8rem",
                cursor: "pointer"
              }}
            >
              필터 해제
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          {/* 엑셀 서식 다운로드 (Template) */}
          <button
            onClick={handleDownloadTemplate}
            className="action-btn download-btn"
            style={{
              background: "var(--bg-tertiary)",
              cursor: "pointer"
            }}
          >
            <Download size={16} />
            엑셀 서식
          </button>

          {/* 엑셀 업로드 (Upload) */}
          <label
            className="action-btn upload-btn"
            style={{
              cursor: "pointer",
              margin: 0
            }}
          >
            <Upload size={16} />
            엑셀 업로드
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelImport}
              style={{ display: "none" }}
            />
          </label>

          {/* 엑셀 다운로드 (Export) */}
          <button
            onClick={handleExcelExport}
            className="action-btn download-btn"
            style={{
              background: "var(--bg-tertiary)",
              cursor: "pointer"
            }}
          >
            <Download size={16} />
            엑셀 다운로드
          </button>

          {/* 신규 등록 */}
          <button
            onClick={openAddModal}
            className="action-btn"
            style={{
              padding: "0.5rem 1.2rem",
              background: "var(--accent-color)",
              color: "white",
              border: "none",
              borderRadius: "9999px",
              fontSize: "0.85rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
          >
            <Plus size={16} />
            신규 파트너 등록
          </button>
        </div>
      </div>

      {/* 4. 파트너 대장 테이블 */}
      <div className="glass-card" style={{ padding: "0.5rem", overflowX: "auto" }}>
        <table className="mini-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "center" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color-dark)", color: "var(--text-secondary)" }}>
              <th 
                onClick={() => handleSort("name")}
                style={{ padding: "0.75rem 1rem", cursor: "pointer", userSelect: "none", textAlign: "center", verticalAlign: "middle" }}
              >
                기관명{renderSortIcon("name")}
              </th>
              <th 
                onClick={() => handleSort("category")}
                style={{ padding: "0.75rem 1rem", cursor: "pointer", userSelect: "none", textAlign: "center", verticalAlign: "middle" }}
              >
                분류{renderSortIcon("category")}
              </th>
              <th 
                onClick={() => handleSort("sub_category")}
                style={{ padding: "0.75rem 1rem", cursor: "pointer", userSelect: "none", textAlign: "center", verticalAlign: "middle" }}
              >
                세부분류{renderSortIcon("sub_category")}
              </th>
              <th 
                onClick={() => handleSort("location")}
                style={{ padding: "0.75rem 1rem", cursor: "pointer", userSelect: "none", textAlign: "center", verticalAlign: "middle" }}
              >
                지역{renderSortIcon("location")}
              </th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", verticalAlign: "middle" }}>협력 분야</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", verticalAlign: "middle" }}>담당자 (연락처)</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", verticalAlign: "middle" }}>주요 성과 / 메모</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", verticalAlign: "middle" }}>제어</th>
            </tr>
          </thead>
          <tbody>
            {sortedPartners.length > 0 ? (
              sortedPartners.map((p) => (
                <tr
                  key={p.id || p.name}
                  style={{
                    borderBottom: "1px solid var(--border-color, rgba(255, 255, 255, 0.04))",
                    transition: "all 0.15s ease",
                    cursor: "pointer"
                  }}
                  className="hover-row"
                >
                  <td style={{ padding: "0.85rem 1rem", fontWeight: "800", textAlign: "center", verticalAlign: "middle" }}>{p.name}</td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "center", verticalAlign: "middle" }}>
                    <span className={`badge ${
                      p.category === "대학" ? "badge-blue" :
                      p.category === "산업체" ? "badge-orange" :
                      p.category === "연구기관" ? "badge-purple" :
                      p.category === "지자체/공공기관" ? "badge-green" : "badge-outline"
                    }`}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--text-secondary)", textAlign: "center", verticalAlign: "middle" }}>
                    {p.sub_category || "-"}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "center", verticalAlign: "middle" }}>{p.location}</td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", maxWidth: "240px", justifyContent: "center", margin: "0 auto" }}>
                      {(p.sectors || []).map((sec) => (
                        <span key={sec} className="badge-tag">
                          {sec}
                        </span>
                      ))}
                      {(p.sectors || []).length === 0 && <span style={{ color: "var(--text-secondary)" }}>-</span>}
                    </div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "center", verticalAlign: "middle" }}>
                    {p.contact_person ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontWeight: "700" }}>{p.contact_person}</span>
                        {p.contact_phone && (
                          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            {p.contact_phone}
                          </span>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-secondary)", textAlign: "center", verticalAlign: "middle" }} title={p.remarks || undefined}>
                    {p.remarks || "-"}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(p); }}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}
                        title="수정"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p); }}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "#EF4444" }}
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                  검색 조건에 부합하는 파트너기관 정보가 존재하지 않습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. 신규 등록 / 수정 팝업 모달 */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          padding: "2rem 1rem"
        }}>
          <div style={{
            background: "var(--modal-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "0.75rem",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            color: "var(--text-primary)",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            margin: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)" }}>
                {editingPartner ? "🛠️ 파트너기관 정보 수정" : "➕ 신규 파트너기관 등록"}
              </h3>
              <button type="button" onClick={closeModal} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.2rem", flex: 1, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* 기관명 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>기관명 *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* 지역 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>지역/도시 *</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* 대분류 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>기관 대분류</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="form-select"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt} value={opt} style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* 세부분류 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>세부 분류</label>
                  <select
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    className="form-select"
                  >
                    {(SUB_CATEGORY_OPTIONS[formCategory] || []).map(opt => (
                      <option key={opt} value={opt} style={{ background: "var(--modal-bg)", color: "var(--text-primary)" }}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* 담당자 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>담당자 성명</label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* 연락처 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>연락처 (전화번호)</label>
                  <input
                    type="text"
                    value={formContactPhone}
                    onChange={(e) => setFormContactPhone(e.target.value)}
                    placeholder="052-000-0000"
                    className="form-input"
                  />
                </div>
              </div>

              {/* 협력 분야 다중 선택 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>협력분야 (다중선택)</label>
                <div className="form-chips-container" style={{ maxHeight: "120px", overflowY: "auto" }}>
                  {SECTOR_OPTIONS.map((sec) => {
                    const isSelected = formSectors.includes(sec);
                    return (
                      <button
                        type="button"
                        key={sec}
                        onClick={() => toggleSector(sec)}
                        style={{
                          padding: "0.35rem 0.75rem",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          background: isSelected ? "rgba(59, 130, 246, 0.15)" : "var(--input-bg)",
                          color: isSelected ? "var(--accent-color)" : "var(--text-secondary)",
                          border: isSelected ? "1.5px solid var(--accent-color)" : "1.5px solid var(--border-color)"
                        }}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 메모 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>주요 협력 메모 / 추진 실적</label>
                <textarea
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  rows={3}
                  className="form-textarea"
                  style={{ resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem" }}
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
