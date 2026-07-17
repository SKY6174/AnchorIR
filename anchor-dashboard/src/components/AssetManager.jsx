import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Plus, Trash2, Edit2, Calendar, Clipboard, CheckCircle, AlertTriangle, Search, Home, Laptop, Check, Clock, TrendingUp, Upload, Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function AssetManager({ currentRole, currentUser, activeSubTab, onChangeSubTab, darkMode, selectedYear }) {
  // 공통 로딩 상태
  const [loading, setLoading] = useState(false);

  // 승인권자 여부 판별 헬퍼 (심현미/김현수/송경영 등 관리자 롤 포함)
  const isApprover = (role) => {
    if (!role) return false;
    const rid = role.id || "";
    return ["ADMIN", "G_DIRECTOR", "HQ_HEAD", "MANAGER"].includes(rid);
  };

  // 공간별 승인 권한 판별 헬퍼 (송경영, 김현수, 심현미 기본 포함 + 공간별 담당자)
  const hasReservationApprovalPower = (spaceName) => {
    if (!currentUser) return false;
    const userName = currentUser.name || "";
    
    // 1. 디폴트 결재선 (송경영, 김현수, 심현미)
    const DEFAULT_APPROVERS = ["송경영", "김현수", "심현미"];
    if (DEFAULT_APPROVERS.some(appr => userName.includes(appr))) return true;
    
    // 2. 공간별 특화 승인선
    const SPACE_SPECIFIC_APPROVERS = {
      "AI∙DX다목적강의실": ["이규상", "임은애"],
      "AI∙DX강의실1": ["이규상", "임은애"],
      "AI∙DX강의실2": ["이규상", "임은애"],
      "울산늘봄누리센터": ["황수진", "최주명"],
      "앵커사업단회의실": ["이규상"]
    };
    
    const allowedList = SPACE_SPECIFIC_APPROVERS[spaceName];
    if (allowedList && allowedList.some(appr => userName.includes(appr))) return true;
    
    // 3. 최상위 시스템 관리자(ADMIN) 허용 가드
    if (currentRole && currentRole.id === "ADMIN") return true;
    
    return false;
  };

  // 취소/반려 가능 조건 판별 (신청자 본인 또는 해당 공간의 승인권자)
  const canCancelOrReject = (res) => {
    if (!currentUser) return false;
    if (hasReservationApprovalPower(res.space_name)) return true;
    const userName = currentUser.name || "";
    if (userName && res.reserver_name.includes(userName)) return true;
    return false;
  };

  // ==============================================================================
  // [1] 교육환경 관리 (공간 예약 시스템) 상태 및 핸들러
  // ==============================================================================
  const SPACES = ["AI∙DX다목적강의실", "AI∙DX강의실1", "AI∙DX강의실2", "울산늘봄누리센터", "앵커사업단회의실"];
  const SPACE_ROOMS = {
    "AI∙DX다목적강의실": "M-404",
    "AI∙DX강의실1": "M-402",
    "AI∙DX강의실2": "M-405",
    "울산늘봄누리센터": "1-108",
    "앵커사업단회의실": "앵커사업단"
  };
  const [selectedSpace, setSelectedSpace] = useState(SPACES[0]);
  const [reservations, setReservations] = useState([]);
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  
  // 예약 신청 시 사용되는 폼 상태
  const [resFormData, setResFormData] = useState({
    space_name: SPACES[0],
    reserved_date: new Date().toISOString().split("T")[0],
    start_time: "10:00",
    end_time: "12:00",
    dept: "사업운영팀",
    custom_dept: "",
    reserver_name: "",
    actual_user_name: "",
    purpose: "",
    status: "승인대기" // 신청 시 기본값은 '승인대기'
  });

  // 승인권자가 일시를 강제로 조정/수정할 때 쓰는 임시 상태
  const [isEditTimeModalOpen, setIsEditTimeModalOpen] = useState(false);
  const [editingRes, setEditingRes] = useState(null);
  const [editResFormData, setEditResFormData] = useState({
    reserved_date: "",
    start_time: "",
    end_time: ""
  });

  // 💡 [교육용 한글 주석] 캘린더 렌더링에 사용되는 년, 월, 선택된 날짜 상태변수를 주입합니다.
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date().toISOString().split("T")[0]);

  // 💡 [교육용 한글 주석] 선택된 연차(selectedYear)가 바뀌면 캘린더의 대상 년월을 최적화 동기화합니다.
  useEffect(() => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayFiscalYear = todayMonth < 2 ? todayYear - 1 : todayYear;
    const todaySelectedYear = todayFiscalYear - 2025 + 1;

    if (selectedYear === todaySelectedYear) {
      setCurrentYear(todayYear);
      setCurrentMonth(todayMonth);
      setSelectedCalendarDate(today.toISOString().split("T")[0]);
    } else {
      const targetFiscalYear = 2025 + (selectedYear - 1);
      setCurrentYear(targetFiscalYear);
      setCurrentMonth(2); // 3월 (0-indexed ➔ 2)
      setSelectedCalendarDate(`${targetFiscalYear}-03-01`);
    }
  }, [selectedYear]);

  // 공간 예약 목록 로드
  const fetchReservations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("asset_reservations")
        .select("*")
        .order("reserved_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      setReservations(data || []);
    } catch (err) {
      console.error("예약 목록 로드 실패:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 시간대 겹침 충돌 확인 헬퍼 함수
  const isTimeOverlapping = (newStart, newEnd, existStart, existEnd) => {
    const parseTimeToMinutes = (t) => {
      const parts = t.split(":");
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || 0, 10);
    };

    const ns = parseTimeToMinutes(newStart);
    const ne = parseTimeToMinutes(newEnd);
    const es = parseTimeToMinutes(existStart);
    const ee = parseTimeToMinutes(existEnd);

    // 겹침 여부: (ns < ee) && (ne > es)
    return ns < ee && ne > es;
  };

  // 공간 예약 신청 등록 (일반 및 대행 예약)
  const handleAddReservation = async (e) => {
    e.preventDefault();
    if (currentRole.id === "GUEST") {
      alert("⚠️ 게스트 계정은 예약을 신청할 수 없습니다.");
      return;
    }

    if (resFormData.dept === "직접입력" && !resFormData.custom_dept.trim()) {
      alert("⚠️ 외부 신청부서명을 직접 입력해 주세요.");
      return;
    }

    if (resFormData.dept === "직접입력" && !resFormData.actual_user_name.trim()) {
      alert("⚠️ 실제 이용자명을 입력해 주세요.");
      return;
    }

    if (!resFormData.reserver_name.trim()) {
      alert("⚠️ 신청자 (사업단 구성원) 이름을 입력해 주세요.");
      return;
    }

    // 시간 논리성 확인
    if (resFormData.start_time >= resFormData.end_time) {
      alert("⚠️ 종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    // 데이터베이스용 객체 합성 조립 (하위 호환성 및 무결성 확보)
    const insertData = {
      space_name: resFormData.space_name,
      reserved_date: resFormData.reserved_date,
      start_time: resFormData.start_time,
      end_time: resFormData.end_time,
      dept: resFormData.dept === "직접입력" ? resFormData.custom_dept : resFormData.dept,
      reserver_name: resFormData.dept === "직접입력"
        ? `${resFormData.actual_user_name} (대행: ${resFormData.reserver_name})`
        : resFormData.reserver_name,
      custom_dept: resFormData.dept === "직접입력" ? resFormData.custom_dept : "",
      actual_user_name: resFormData.dept === "직접입력" ? resFormData.actual_user_name : "",
      purpose: resFormData.purpose,
      status: "승인대기" // 💡 신청 시에는 항상 승인대기 상태로 제출
    };

    // 중복 충돌 실시간 검증 (기존 '승인완료'된 예약들과 겹치는지 체크)
    const duplicate = reservations.find((r) => {
      return (
        r.status === "승인완료" &&
        r.space_name === insertData.space_name &&
        r.reserved_date === insertData.reserved_date &&
        isTimeOverlapping(
          insertData.start_time,
          insertData.end_time,
          r.start_time,
          r.end_time
        )
      );
    });

    if (duplicate) {
      alert(
        `⚠️ 예약 대기 불가: 입력한 시간대에 이미 '승인완료'된 다른 예약이 선점되어 있습니다.\n(확정 예약: ${duplicate.dept} - ${duplicate.reserver_name} / ${duplicate.start_time.substring(0, 5)}~${duplicate.end_time.substring(0, 5)})`
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("asset_reservations").insert([insertData]);
      if (error) throw error;
      alert("✨ 공간 사용 예약 승인요청이 정상 등록되었습니다.");
      setIsResModalOpen(false);
      setResFormData({
        space_name: selectedSpace,
        reserved_date: new Date().toISOString().split("T")[0],
        start_time: "10:00",
        end_time: "12:00",
        dept: "사업운영팀",
        custom_dept: "",
        reserver_name: "",
        actual_user_name: "",
        purpose: "",
        status: "승인대기"
      });
      fetchReservations();
    } catch (err) {
      alert("예약 등록 에러: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 승인권자의 예약 승인 처리
  const handleApproveReservation = async (res) => {
    if (!hasReservationApprovalPower(res.space_name)) {
      alert(`⚠️ 승인 권한이 없습니다. (${res.space_name}의 지정 승인권자 또는 송경영, 김현수, 심현미만 승인 가능)`);
      return;
    }

    // 승인 대상 시간과 겹치는 기존 '승인완료' 건이 있는지 엄격 검사
    const duplicate = reservations.find((r) => {
      return (
        r.id !== res.id &&
        r.status === "승인완료" &&
        r.space_name === res.space_name &&
        r.reserved_date === res.reserved_date &&
        isTimeOverlapping(res.start_time, res.end_time, r.start_time, r.end_time)
      );
    });

    if (duplicate) {
      alert(
        `⚠️ 승인 불가: 해당 시간대에 이미 승인완료된 다른 예약이 선점되어 있습니다.\n(승인 확정된 예약: ${duplicate.dept} - ${duplicate.reserver_name} / ${duplicate.start_time.substring(0, 5)}~${duplicate.end_time.substring(0, 5)})\n\n[일시 변경]을 클릭해 예약 시간을 먼저 조율해 주세요.`
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("asset_reservations")
        .update({ status: "승인완료" })
        .eq("id", res.id);

      if (error) throw error;
      alert("✨ 예약이 최종 승인 완료되었습니다.");
      fetchReservations();
    } catch (err) {
      alert("예약 승인 에러: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 승인권자의 일시 변경 모달 기동
  const handleOpenEditTime = (res) => {
    setEditingRes(res);
    setEditResFormData({
      reserved_date: res.reserved_date,
      start_time: res.start_time.substring(0, 5),
      end_time: res.end_time.substring(0, 5)
    });
    setIsEditTimeModalOpen(true);
  };

  // 승인권자의 일시 변경 저장
  const handleSaveEditedTime = async (e) => {
    e.preventDefault();
    if (!hasReservationApprovalPower(editingRes?.space_name)) {
      alert("⚠️ 권한이 없습니다.");
      return;
    }

    if (editResFormData.start_time >= editResFormData.end_time) {
      alert("⚠️ 종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    // 수정한 시간으로 기존 승인완료된 건과 중복되는지 검증
    const duplicate = reservations.find((r) => {
      return (
        r.id !== editingRes.id &&
        r.status === "승인완료" &&
        r.space_name === editingRes.space_name &&
        r.reserved_date === editResFormData.reserved_date &&
        isTimeOverlapping(editResFormData.start_time, editResFormData.end_time, r.start_time, r.end_time)
      );
    });

    if (duplicate) {
      alert(
        `⚠️ 변경 불가: 수정하려는 시간대에 이미 승인완료된 다른 예약이 선점되어 있습니다.\n(승인 확정된 예약: ${duplicate.dept} - ${duplicate.reserver_name} / ${duplicate.start_time.substring(0, 5)}~${duplicate.end_time.substring(0, 5)})`
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("asset_reservations")
        .update({
          reserved_date: editResFormData.reserved_date,
          start_time: editResFormData.start_time,
          end_time: editResFormData.end_time
        })
        .eq("id", editingRes.id);

      if (error) throw error;
      alert("✨ 예약 일시가 성공적으로 조정되었습니다.");
      setIsEditTimeModalOpen(false);
      setEditingRes(null);
      fetchReservations();
    } catch (err) {
      alert("일시 조정 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 예약 취소 / 반려
  const handleDeleteReservation = async (id) => {
    if (currentRole.id === "GUEST") {
      alert("⚠️ 게스트 계정은 예약을 삭제할 수 없습니다.");
      return;
    }

    const targetRes = reservations.find(r => r.id === id);
    if (!targetRes) return;

    if (!canCancelOrReject(targetRes)) {
      alert("⚠️ 취소/반려 권한이 없습니다. (신청자 본인 또는 심현미, 김현수, 송경영 등 지정 결재권자만 취소 가능)");
      return;
    }

    if (!window.confirm("정말로 이 공간 예약 신청을 취소/반려하시겠습니까?")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("asset_reservations").delete().eq("id", id);
      if (error) throw error;
      alert("🗑️ 예약이 성공적으로 취소/반려되었습니다.");
      fetchReservations();
    } catch (err) {
      alert("예약 삭제 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==============================================================================
  // [2] 기자재 관리 (AI∙DX 및 기타 자산 현황) 상태 및 핸들러
  // ==============================================================================
  const [equipments, setEquipments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all"); // "all", "ai_dx", "other", or "scan"
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const DEFAULT_VISIBLE_COLUMNS = {
      asset_number: true,
      category_name: true,
      item_name: true,
      spec: true,
      inspect_date: true,
      price: true,
      dept_name: true,
      install_dept: true,
      room_no: true,
      item_type: true,
      pay_date: true,
      is_sw: true,
      vendor: true,
      ai_dx: true
    };
    try {
      const saved = localStorage.getItem("equip_visible_columns");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_VISIBLE_COLUMNS, ...parsed };
      }
    } catch (e) {
      console.warn("Failed to load saved column visibility options:", e);
    }
    return DEFAULT_VISIBLE_COLUMNS;
  });

  useEffect(() => {
    localStorage.setItem("equip_visible_columns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const [isColMenuOpen, setIsColMenuOpen] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [editingEquipId, setEditingEquipId] = useState(null);
  const [equipSearchQuery, setEquipSearchQuery] = useState("");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const renderSortArrow = (key) => {
    if (sortKey !== key) return " ↕";
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  // 구매 완료 기자재 목록을 보관할 상태
  const [completedProcuredItems, setCompletedProcuredItems] = useState([]);

  // 활용 실적 모달 관련 상태
  const [isUtilModalOpen, setIsUtilModalOpen] = useState(false);
  const [selectedUtilEquip, setSelectedUtilEquip] = useState(null);
  const [utilRecords, setUtilRecords] = useState([]);
  const [utilFormData, setUtilFormData] = useState({
    semester: "2026학년도 1학기",
    usage_details: ""
  });
  
  // 자산 바코드 실시간 스캔을 위한 추가 상태
  const [scanInput, setScanInput] = useState("");
  const [scannedAsset, setScannedAsset] = useState(null);
  const [scanError, setScanError] = useState("");
  const [scanSuccess, setScanSuccess] = useState(false);

  // Web Audio API를 활용한 바코드 비프(Beep) 효과음 발생기
  const playBeep = (type = "success") => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(type === "success" ? 880 : 330, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (type === "success" ? 0.12 : 0.35));
    } catch (e) {
      console.warn("AudioContext 재생 실패:", e);
    }
  };

  const USAGE_TYPES = ["정규교과", "비정규교과", "평생직업교육", "재직자과정", "기타"];
  const [equipFormData, setEquipFormData] = useState({
    asset_number: "",
    barcode_id: "",
    stock_location: "",
    category: "ai_dx",
    usage_type: USAGE_TYPES[0],
    item_name: "",
    memo: ""
  });

  // 구매 완료 기자재 로드 (검수일자 date_i가 존재하는 항목)
  const fetchCompletedProcuredItems = async () => {
    try {
      const { data, error } = await supabase
        .from("procurement_equipment")
        .select("*")
        .not("date_i", "is", null);

      if (error) throw error;
      setCompletedProcuredItems(data || []);
    } catch (err) {
      console.error("구매 완료 기자재 목록 로드 실패:", err.message);
    }
  };

  // 학기별 활용 실적 로드
  const fetchUtilizationRecords = async (equipId) => {
    try {
      const { data, error } = await supabase
        .from("equipment_utilization_records")
        .select("*")
        .eq("equipment_id", equipId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setUtilRecords(data || []);
    } catch (err) {
      console.error("실적 로드 실패:", err.message);
    }
  };

  // 실적 관리 모달 팝업 기동
  const handleOpenUtilizationModal = (item) => {
    setSelectedUtilEquip(item);
    setUtilFormData({
      semester: "2026학년도 1학기",
      usage_details: ""
    });
    fetchUtilizationRecords(item.id);
    setIsUtilModalOpen(true);
  };

  // 실적 저장 (추가)
  const handleSaveUtilization = async (e) => {
    e.preventDefault();
    if (!selectedUtilEquip) return;
    if (!utilFormData.usage_details.trim()) {
      alert("⚠️ 실적 세부사항을 입력해 주세요.");
      return;
    }

    try {
      const { error } = await supabase
        .from("equipment_utilization_records")
        .insert([{
          equipment_id: selectedUtilEquip.id,
          semester: utilFormData.semester,
          usage_details: utilFormData.usage_details
        }]);

      if (error) throw error;
      
      setUtilFormData(prev => ({ ...prev, usage_details: "" }));
      fetchUtilizationRecords(selectedUtilEquip.id);
    } catch (err) {
      alert("실적 저장 실패: " + err.message);
    }
  };

  // 실적 삭제
  const handleDeleteUtilization = async (recordId) => {
    if (!window.confirm("정말로 이 학기 실적을 삭제하시겠습니까?")) return;
    try {
      const { error } = await supabase
        .from("equipment_utilization_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;
      fetchUtilizationRecords(selectedUtilEquip.id);
    } catch (err) {
      alert("실적 삭제 실패: " + err.message);
    }
  };

  // 기자재 로드
  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("equipment_assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEquipments(data || []);
    } catch (err) {
      console.error("기자재 현황 로드 실패:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 기자재 추가/수정 저장
  const handleSaveEquipment = async (e) => {
    e.preventDefault();
    if (currentRole.id === "GUEST") {
      alert("⚠️ 게스트 계정은 기자재 정보를 수정할 수 없습니다.");
      return;
    }

    if (!equipFormData.item_name.trim() || !equipFormData.asset_number.trim() || !equipFormData.barcode_id.trim()) {
      alert("⚠️ 품명, 물품(기자재)번호, 바코드는 필수 입력 항목입니다.");
      return;
    }

    setLoading(true);
    try {
      // 💡 [교육용 한글 주석] 수동 입력 시 입력된 자산번호가 현재 선택된 연차의 기준 연도(예: 2차년도면 2026)로 시작하지 않으면 자동으로 보정하여 접두사를 맞춰줍니다.
      const targetYearStr = String(2024 + (Number(selectedYear) || 1));
      const currentYearPrefix = `${targetYearStr}-`;
      let finalAssetNumber = equipFormData.asset_number.trim();
      let finalBarcodeId = equipFormData.barcode_id.trim();

      if (!finalAssetNumber.startsWith(currentYearPrefix)) {
        const cleanNum = finalAssetNumber.replace(/^[0-9]{4}-/, "");
        finalAssetNumber = `${currentYearPrefix}${cleanNum}`;
      }
      if (!finalBarcodeId.startsWith(currentYearPrefix)) {
        const cleanNum = finalBarcodeId.replace(/^[0-9]{4}-/, "");
        finalBarcodeId = `${currentYearPrefix}${cleanNum}`;
      }

      // memo JSON 내부의 inspect_date 또는 pay_date 에도 현재 연도 정보가 매핑되도록 보강합니다.
      let memoObj = {};
      try {
        if (equipFormData.memo && equipFormData.memo.trim().startsWith("{")) {
          memoObj = JSON.parse(equipFormData.memo);
        }
      } catch (err) {}

      // 만약 memo에 기존 검수일자가 없거나 다른 연도로 기입되어 있다면 보정
      if (!memoObj.inspect_date || !memoObj.inspect_date.includes(targetYearStr)) {
        const todayStr = new Date().toISOString().split("T")[0];
        memoObj.inspect_date = todayStr.startsWith(targetYearStr) ? todayStr : `${targetYearStr}-03-01`; // 학기 개시월 디폴트
      }
      memoObj.asset_number = finalAssetNumber;
      memoObj.price = memoObj.price || 0;

      const payload = {
        item_name: equipFormData.item_name,
        asset_number: finalAssetNumber,
        barcode_id: finalBarcodeId,
        stock_location: equipFormData.stock_location,
        category: equipFormData.category,
        usage_type: equipFormData.usage_type,
        memo: JSON.stringify(memoObj)
      };

      if (editingEquipId) {
        // 수정 모드
        const { error } = await supabase
          .from("equipment_assets")
          .update(payload)
          .eq("id", editingEquipId);
        if (error) throw error;
        alert("✨ 기자재 정보가 성공적으로 수정되었습니다.");
      } else {
        // 신규 등록 또는 불러오기 (이미 바코드가 존재하면 덮어쓰기 업데이트)
        const { error } = await supabase
          .from("equipment_assets")
          .upsert(payload, { onConflict: "barcode_id" });
        if (error) throw error;
        alert("✨ 기자재 자산 등록이 성공적으로 완료되었습니다.");
      }
      setIsEquipModalOpen(false);
      setEditingEquipId(null);
      setEquipFormData({
        asset_number: "",
        barcode_id: "",
        stock_location: "",
        category: "ai_dx",
        usage_type: USAGE_TYPES[0],
        item_name: "",
        memo: ""
      });
      fetchEquipments();
    } catch (err) {
      alert("기자재 저장 에러: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 기자재 수정 모달 열기
  const handleOpenEditEquip = (equip) => {
    setEditingEquipId(equip.id);
    setEquipFormData({
      asset_number: equip.asset_number,
      barcode_id: equip.barcode_id,
      stock_location: equip.stock_location,
      category: equip.category,
      usage_type: equip.usage_type,
      item_name: equip.item_name,
      memo: equip.memo || ""
    });
    setIsEquipModalOpen(true);
  };

  // 기자재 삭제
  const handleDeleteEquipment = async (id) => {
    if (currentRole.id === "GUEST") {
      alert("⚠️ 게스트 계정은 기자재를 삭제할 수 없습니다.");
      return;
    }
    if (!window.confirm("정말로 이 기자재 정보를 삭제하시겠습니까?")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("equipment_assets").delete().eq("id", id);
      if (error) throw error;
      alert("🗑️ 기자재가 삭제되었습니다.");
      fetchEquipments();
    } catch (err) {
      alert("기자재 삭제 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 바코드 리더기 실시간 스캔 완료 처리
  const handleBarcodeScan = async (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    setLoading(true);
    setScanError("");
    setScanSuccess(false);

    try {
      // 1. Supabase equipment_assets 테이블에서 바코드 매칭 검색
      const { data, error } = await supabase
        .from("equipment_assets")
        .select("*")
        .eq("barcode_id", scanInput.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        playBeep("error");
        setScannedAsset(null);
        setScanError("⚠️ 등록되지 않은 자산 바코드입니다.");
        return;
      }

      // 2. 점검 시각 갱신
      const nowString = new Date().toISOString();
      const { data: updatedData, error: updateErr } = await supabase
        .from("equipment_assets")
        .update({ last_checked_at: nowString })
        .eq("barcode_id", scanInput.trim())
        .select()
        .single();

      if (updateErr) throw updateErr;

      // 3. 성공 피드백 작동
      playBeep("success");
      setScannedAsset(updatedData || data);
      setScanSuccess(true);
      setScanInput("");
      fetchEquipments(); // 목록 전체 리로드
    } catch (err) {
      console.error("바코드 스캔 오류:", err.message);
      setScanError("자산 검색 중 장애 발생: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 전체 기자재대장 엑셀 일괄 업로드 핸들러
  const handleExcelImportEquipment = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (currentRole.id === "GUEST") {
      alert("⚠️ 게스트 계정은 기자재 일괄 등록 권한이 없습니다.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawRows = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (rawRows.length === 0) {
          alert("⚠️ 업로드된 엑셀 파일 내에 데이터가 존재하지 않습니다.");
          setLoading(false);
          return;
        }

        // 💡 [교육용 한글 주석] 현재 활성화된 연차(selectedYear)의 기준 연도 정보(예: 2차년도면 2026)를 바탕으로 엑셀 내 자산번호와 검수일자의 연도를 자동 보정하여 일치화시킵니다.
        const targetYearStr = String(2024 + (Number(selectedYear) || 1));
        const currentYearPrefix = `${targetYearStr}-`;

        const upsertData = rawRows.map((row) => {
          let assetNumber = (row["자산번호"] || "").toString().trim();
          if (assetNumber && !assetNumber.startsWith(currentYearPrefix)) {
            const cleanNum = assetNumber.replace(/^[0-9]{4}-/, "");
            assetNumber = `${currentYearPrefix}${cleanNum}`;
          }

          const itemName = (row["품목명"] || "").toString().trim();
          const categoryName = (row["분류명"] || "").toString().trim();
          const rawPrice = (row["금액"] || "0").toString().replace(/[^0-9]/g, "");
          const unitPrice = parseInt(rawPrice, 10) || 0;
          const deptName = (row["관리부서"] || "").toString().trim();
          const roomNo = (row["호실"] || "").toString().trim();

          const installDept = (row["설치부서"] || "").toString().trim();
          const stockLocation = roomNo ? (installDept ? `${installDept} (${roomNo})` : roomNo) : installDept;

          // 엑셀 14번째 열 'AI∙DX 자산여부' 파싱
          const excelAiDx = (row["AI∙DX 자산여부"] || "").toString().trim();
          let category = "other";
          if (excelAiDx === "예" || excelAiDx === "yes" || excelAiDx === "1" || excelAiDx.toUpperCase() === "Y") {
            category = "ai_dx";
          } else if (excelAiDx === "아니오" || excelAiDx === "no" || excelAiDx === "0" || excelAiDx.toUpperCase() === "N") {
            category = "other";
          } else {
            // 값이 없는 경우 기존처럼 분류명 규칙 적용 (분류명에 AI 또는 DX가 포함되면 특화자산으로 지정)
            category = (categoryName.toUpperCase().includes("AI") || categoryName.toUpperCase().includes("DX"))
              ? "ai_dx" 
              : "other";
          }

          let rawInspectDate = (row["검수일자"] || "").toString().trim();
          if (rawInspectDate && !rawInspectDate.includes(targetYearStr)) {
            rawInspectDate = rawInspectDate.replace(/^[0-9]{4}/, targetYearStr);
          } else if (!rawInspectDate) {
            rawInspectDate = `${targetYearStr}-03-01`;
          }

          let rawPayDate = (row["지출일자"] || "").toString().trim();
          if (rawPayDate && !rawPayDate.includes(targetYearStr)) {
            rawPayDate = rawPayDate.replace(/^[0-9]{4}/, targetYearStr);
          }

          const originalMeta = {
            asset_number: assetNumber,
            category_name: categoryName,
            item_name: itemName,
            spec: (row["규격"] || "").toString().trim(),
            inspect_date: rawInspectDate,
            price: unitPrice,
            dept_name: deptName,
            install_dept: installDept,
            room_no: roomNo,
            item_type: (row["항목"] || "").toString().trim(),
            pay_date: rawPayDate,
            is_sw: (row["SW여부"] || "").toString().trim(),
            vendor: (row["구입업체"] || "").toString().trim(),
            ai_dx_yn: excelAiDx
          };

          return {
            barcode_id: assetNumber,
            asset_number: assetNumber,
            item_name: itemName,
            dept_name: deptName,
            unit_price: unitPrice,
            quantity: 1,
            stock_location: stockLocation,
            category: category,
            usage_type: originalMeta.item_type || "교육용",
            memo: JSON.stringify(originalMeta),
            last_checked_at: new Date().toISOString()
          };
        }).filter(item => item.asset_number !== "");

        if (upsertData.length === 0) {
          alert("⚠️ 유효한 자산번호를 가진 행이 존재하지 않습니다.");
          setLoading(false);
          return;
        }

        const { error } = await supabase
          .from("equipment_assets")
          .upsert(upsertData, { onConflict: "barcode_id" });

        if (error) throw error;
        alert(`✨ 총 ${upsertData.length}건의 기자재 대장이 성공적으로 일괄 등록/갱신되었습니다.`);
        fetchEquipments();
      } catch (err) {
        alert("Excel 파일 파싱 및 DB 업로드 실패: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      alert("파일 읽기 오류가 발생했습니다.");
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  // 14개 컬럼 양식 서식 다운로드 헬퍼
  const handleDownloadEquipTemplate = () => {
    const headers = [
      "자산번호",
      "분류명",
      "품목명",
      "규격",
      "검수일자",
      "금액",
      "관리부서",
      "설치부서",
      "호실",
      "항목",
      "지출일자",
      "SW여부",
      "구입업체",
      "AI∙DX 자산여부"
    ];
    const sampleData = [
      {
        "자산번호": "2025-30-00076-00",
        "분류명": "사다리",
        "품목명": "도배 우마사다리",
        "규격": "세굴 방지용 일체형 우마사다리",
        "검수일자": "2025-12-05",
        "금액": "130000",
        "관리부서": "교무팀",
        "설치부서": "실내건축디자인과",
        "호실": "2-211:강의실",
        "항목": "기계 교육용",
        "지출일자": "2025-12-17",
        "SW여부": "아니오",
        "구입업체": "한독앵글산업사",
        "AI∙DX 자산여부": "아니오"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "기자재 양식");
    XLSX.writeFile(workbook, "UC_ANCHOR_기자재대장_업로드_서식.xlsx");
  };

  // 💡 [교육용 한글 주석] 전체 기자재대장 목록을 엑셀 파일로 추출(내보내기)하는 핸들러
  const handleExportEquipExcel = () => {
    const excelData = equipments.map((eq) => ({
      "자산번호": eq.asset_number || "",
      "분류명": eq.category_name || "",
      "품목명": eq.item_name || "",
      "규격": eq.spec || "",
      "검수일자": eq.inspect_date || "",
      "금액": eq.price || 0,
      "관리부서": eq.dept_name || "",
      "설치부서": eq.install_dept || "",
      "호실": eq.room_no || "",
      "항목": eq.item_type || "",
      "지출일자": eq.pay_date || "",
      "SW여부": eq.is_sw || "N",
      "구입업체": eq.vendor || "",
      "AI∙DX 자산여부": eq.ai_dx || "N"
    }));
    const sheetName = "기자재 대장 목록";
    const fileName = `Anchor_기자재_대장_목록_Year_${selectedYear}.xlsx`;

    try {
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = Array(14).fill({ wch: 18 });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      const b64out = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });

      const a = document.createElement("a");
      a.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${b64out}`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Equipment Excel export error:", err);
      alert("엑셀 내보내기 중 오류가 발생했습니다: " + err.message);
    }
  };

  // AI∙DX 자산여부 체크박스 토글 핸들러
  const toggleEquipCategory = async (itemId, currentCategory) => {
    if (currentRole.id === "GUEST") {
      alert("⚠️ 게스트 계정은 자산 분류를 변경할 권한이 없습니다.");
      return;
    }

    try {
      const nextCategory = currentCategory === "ai_dx" ? "other" : "ai_dx";
      const { error } = await supabase
        .from("equipment_assets")
        .update({ category: nextCategory })
        .eq("id", itemId);

      if (error) throw error;
      fetchEquipments();
    } catch (err) {
      console.error("자산 분류 토글 오류:", err.message);
      alert("자산 분류 변경 중 오류가 발생했습니다: " + err.message);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchEquipments();
  }, [activeSubTab, selectedYear]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "var(--text-primary)" }}>
      
      {/* [A] 자산 관리 대분류 서브메뉴 가로 탭바 (첫번째 예산 탭바와 디자인 100% 동기화) */}
      <div style={{
        display: "flex",
        gap: "1.5rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        paddingBottom: "0.2rem",
        marginBottom: "0.5rem"
      }}>
        <button
          onClick={() => onChangeSubTab && onChangeSubTab("education_env")}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "1rem",
            fontWeight: "800",
            cursor: "pointer",
            padding: "0.5rem 1rem",
            color: activeSubTab === "education_env" ? "var(--accent-color)" : "var(--text-secondary)",
            borderBottom: activeSubTab === "education_env" ? "2px solid var(--accent-color)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          교육환경 사용예약 관리
        </button>
        <button
          onClick={() => onChangeSubTab && onChangeSubTab("equipment")}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "1rem",
            fontWeight: "800",
            cursor: "pointer",
            padding: "0.5rem 1rem",
            color: activeSubTab === "equipment" ? "var(--accent-color)" : "var(--text-secondary)",
            borderBottom: activeSubTab === "equipment" ? "2px solid var(--accent-color)" : "none",
            transition: "all 0.15s ease"
          }}
        >
          기자재 대장 관리
        </button>
      </div>

      {/* 본문 콘텐츠만 glass-card 로 감싸주어 가로형 탭바가 프레임 밖(위)에 오도록 적용 */}
      <div className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* 버튼 영역 (대시보드 타이틀 및 설명 텍스트 제거) */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "1.25rem" }}>
          {activeSubTab === "education_env" ? (
            <button
              onClick={() => {
                setResFormData(prev => ({ ...prev, space_name: selectedSpace }));
                setIsResModalOpen(true);
              }}
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
              <Plus size={16} /> 예약 신청 등록
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingEquipId(null);
                setEquipFormData({
                  asset_number: "",
                  barcode_id: "",
                  stock_location: "",
                  category: selectedCategory === "scan" ? "ai_dx" : selectedCategory,
                  usage_type: USAGE_TYPES[0],
                  item_name: "",
                  memo: ""
                });
                fetchCompletedProcuredItems();
                setIsEquipModalOpen(true);
              }}
              style={{
                padding: "0.45rem 0.85rem",
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
              }}
            >
              <Plus size={16} /> 기자재 불러오기
            </button>
          )}
        </div>

      {/* ============================================================================ */}
      {/* 탭 1: 교육환경 관리 */}
      {/* ============================================================================ */}
      {activeSubTab === "education_env" && (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "1.25rem", alignItems: "start" }}>
          
          {/* 🏫 좌측: 시설 리스트 (세로 배열) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "0.75rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              🏫 교육 시설 목록
            </h3>
            {SPACES.map((space) => {
              const count = reservations.filter(r => r.space_name === space && r.status === "승인대기").length;
              const isSelected = selectedSpace === space;
              
              // 💡 [교육용 한글 주석] 라이트 모드와 다크 모드에 맞는 대기 뱃지의 오렌지색 선명도 및 배경색을 설정합니다.
              const badgeBg = count > 0 
                ? (darkMode ? "rgba(249, 115, 22, 0.2)" : "rgba(234, 88, 12, 0.15)") 
                : (darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)");
              
              const badgeColor = count > 0 
                ? (darkMode ? "#FB923C" : "#C2410C") 
                : (darkMode ? "#94A3B8" : "#64748B");

              return (
                <div
                  key={space}
                  onClick={() => {
                    setSelectedSpace(space);
                  }}
                  style={{
                    padding: "0.75rem",
                    background: isSelected ? "rgba(139, 92, 246, 0.12)" : "transparent",
                    border: `1px solid ${isSelected ? "var(--accent-color)" : "transparent"}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                      {SPACE_ROOMS[space] && (
                        <span style={{ fontSize: "0.58rem", color: isSelected ? "var(--accent-color)" : "#94A3B8", fontWeight: "700" }}>
                          🚪 {SPACE_ROOMS[space]}
                        </span>
                      )}
                      <span style={{ fontSize: "0.75rem", fontWeight: isSelected ? "800" : "500", color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}>
                        {space}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.58rem", background: badgeBg, padding: "0.1rem 0.3rem", borderRadius: "3px", color: badgeColor, fontWeight: "700" }}>
                      대기 {count}건
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 📅 우측: 달력(Calendar) 및 예약 세부 현황 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* 1. 월간 캘린더 판넬 */}
            <div style={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                <h3 style={{ fontSize: "1.0rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Calendar size={18} /> 📅 {selectedSpace}{SPACE_ROOMS[selectedSpace] ? ` (${SPACE_ROOMS[selectedSpace]})` : ""} 예약 월간 현황
                </h3>
                
                {/* 년/월 제어 바 */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear(prev => prev - 1);
                      } else {
                        setCurrentMonth(prev => prev - 1);
                      }
                    }}
                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", border: "1px solid var(--border-color)", borderRadius: "4px", background: "transparent", color: "var(--text-primary)", cursor: "pointer" }}
                  >
                    이전달
                  </button>
                  <span style={{ fontSize: "0.78rem", fontWeight: "800", fontFamily: "var(--font-data)", minWidth: "75px", textAlign: "center" }}>
                    {currentYear}년 {currentMonth + 1}월
                  </span>
                  <button
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear(prev => prev + 1);
                      } else {
                        setCurrentMonth(prev => prev + 1);
                      }
                    }}
                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.7rem", border: "1px solid var(--border-color)", borderRadius: "4px", background: "transparent", color: "var(--text-primary)", cursor: "pointer" }}
                  >
                    다음달
                  </button>
                </div>
              </div>

              {/* 달력 그리드 헤더 (요일) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontSize: "0.68rem", fontWeight: "800", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.4rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>
                <div style={{ color: "#EF4444" }}>일</div>
                <div>월</div>
                <div>화</div>
                <div>수</div>
                <div>목</div>
                <div>금</div>
                <div style={{ color: "#60A5FA" }}>토</div>
              </div>

              {/* 달력 날짜 타일 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "1px",
                background: darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                border: `1px solid ${darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"}`,
                borderRadius: "4px",
                overflow: "hidden"
              }}>
                {(() => {
                  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
                  const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
                  const totalSlots = [];
                  
                  // 이전달 빈칸
                  for (let i = 0; i < firstDayIndex; i++) {
                    totalSlots.push(null);
                  }
                  // 이번달 날짜
                  for (let d = 1; d <= numDays; d++) {
                    totalSlots.push(d);
                  }

                  return totalSlots.map((day, idx) => {
                    if (day === null) {
                      return (
                        <div
                          key={`empty-${idx}`}
                          style={{
                            minHeight: "52px",
                            background: darkMode ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)"
                          }}
                        ></div>
                      );
                    }

                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayReservations = reservations.filter(r => r.space_name === selectedSpace && r.reserved_date === dateStr);
                    const pendingCount = dayReservations.filter(r => r.status === "승인대기").length;
                    const approvedCount = dayReservations.filter(r => r.status === "승인완료").length;
                    const isSelected = selectedCalendarDate === dateStr;

                    const isSunday = idx % 7 === 0;
                    const isSaturday = idx % 7 === 6;

                    // 💡 [교육용 한글 주석] 라이트/다크 모드별 대기 뱃지의 오렌지색 선명도 및 배경색 설정
                    const pendingBadgeBg = pendingCount > 0 
                      ? (darkMode ? "rgba(249, 115, 22, 0.2)" : "rgba(234, 88, 12, 0.15)") 
                      : "transparent";
                    const pendingBadgeColor = pendingCount > 0 
                      ? (darkMode ? "#FB923C" : "#C2410C") 
                      : "transparent";

                    return (
                      <div
                        key={`day-${day}`}
                        onClick={() => setSelectedCalendarDate(dateStr)}
                        style={{
                          minHeight: "52px",
                          padding: "0.3rem",
                          background: isSelected 
                            ? (darkMode ? "rgba(139, 92, 246, 0.2)" : "rgba(139, 92, 246, 0.08)") 
                            : (darkMode ? "var(--panel-bg)" : "#ffffff"),
                          border: isSelected ? "1.5px solid var(--accent-color)" : "none",
                          cursor: "pointer",
                          transition: "all 0.12s ease",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between"
                        }}
                      >
                        {/* 날짜 숫자 */}
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: "800",
                          fontFamily: "var(--font-data)",
                          color: isSunday ? "#F87171" : (isSaturday ? "#60A5FA" : "var(--text-primary)")
                        }}>
                          {day}
                        </span>

                        {/* 예약 상태 미니 시각화 */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", marginTop: "0.25rem" }}>
                          {approvedCount > 0 && (
                            <span style={{
                              fontSize: "0.58rem",
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "#34D399",
                              padding: "0.05rem 0.2rem",
                              borderRadius: "2px",
                              fontWeight: "700",
                              textAlign: "center",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              확정 {approvedCount}
                            </span>
                          )}
                          {pendingCount > 0 && (
                            <span style={{
                              fontSize: "0.58rem",
                              background: pendingBadgeBg,
                              color: pendingBadgeColor,
                              padding: "0.05rem 0.2rem",
                              borderRadius: "2px",
                              fontWeight: "700",
                              textAlign: "center",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              대기 {pendingCount}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* 2. 하단: 선택된 날짜의 세부 예약 테이블 */}
            <div style={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem" }}>
              <h3 style={{ fontSize: "0.82rem", fontWeight: "700", color: "#a78bfa", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                ⚡ [{selectedCalendarDate}] 예약 현황 목록 ({selectedSpace}{SPACE_ROOMS[selectedSpace] ? ` - ${SPACE_ROOMS[selectedSpace]}` : ""})
              </h3>

              {loading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontSize: "0.75rem" }}>데이터 로드 중...</div>
              ) : reservations.filter(r => r.space_name === selectedSpace && r.reserved_date === selectedCalendarDate).length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                  선택하신 일자({selectedCalendarDate})에 등록된 대여/예약 내역이 없습니다.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                        <th style={{ padding: "0.5rem" }}>사용시간</th>
                        <th style={{ padding: "0.5rem" }}>신청부서</th>
                        <th style={{ padding: "0.5rem" }}>신청자 (대행)</th>
                        <th style={{ padding: "0.5rem" }}>사용 목적</th>
                        <th style={{ padding: "0.5rem", textAlign: "center" }}>결재 상태</th>
                        <th style={{ padding: "0.5rem", textAlign: "center" }}>취소/반려</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations
                        .filter((r) => r.space_name === selectedSpace && r.reserved_date === selectedCalendarDate)
                        .map((res) => {
                          const isPending = res.status === "승인대기" || !res.status;
                          return (
                            <tr key={res.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.1s ease" }}>
                              <td style={{ padding: "0.5rem", color: "#60A5FA", fontWeight: "700" }}>
                                ⏱️ {res.start_time.substring(0, 5)} ~ {res.end_time.substring(0, 5)}
                              </td>
                              <td style={{ padding: "0.5rem" }}>{res.dept}</td>
                              <td style={{ padding: "0.5rem" }}>{res.reserver_name}</td>
                              <td style={{ padding: "0.5rem", color: "var(--text-secondary)" }}>{res.purpose || "-"}</td>
                              <td style={{ padding: "0.5rem", textAlign: "center" }}>
                                {isPending ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "center" }}>
                                    <span style={{ padding: "0.15rem 0.4rem", borderRadius: "4px", background: "rgba(251, 191, 36, 0.15)", border: "1px solid rgba(251, 191, 36, 0.3)", color: "#FBBF24", fontSize: "0.62rem", fontWeight: "800" }}>
                                      승인대기
                                    </span>
                                    {hasReservationApprovalPower(res.space_name) && (
                                      <button
                                        onClick={() => handleApproveReservation(res)}
                                        style={{
                                          marginTop: "0.2rem",
                                          padding: "0.2rem 0.5rem",
                                          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                                          color: "white",
                                          border: "none",
                                          borderRadius: "4px",
                                          fontSize: "0.6rem",
                                          fontWeight: "800",
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "0.1rem"
                                        }}
                                      >
                                        <Check size={10} /> 승인
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span style={{ padding: "0.15rem 0.4rem", borderRadius: "4px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34D399", fontSize: "0.62rem", fontWeight: "800" }}>
                                    승인완료
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: "0.5rem", textAlign: "center" }}>
                                {canCancelOrReject(res) ? (
                                  <button
                                    onClick={() => handleDeleteReservation(res.id)}
                                    style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer" }}
                                    title="예약 취소 / 반려"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                ) : (
                                  <span style={{ color: "var(--text-secondary)", fontSize: "0.65rem" }}>권한없음</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 탭 2: 기자재 관리 */}
      {/* ============================================================================ */}
      {activeSubTab === "equipment" && (
        <div>
          {/* AI∙DX vs 기타자산 서브서브 메뉴 알약형(Pill Tab) 구현 */}
          <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.6rem", marginBottom: "1rem", alignItems: "center" }}>
            <div style={{
              display: "flex",
              gap: "0.35rem",
              background: darkMode ? "rgba(0, 0, 0, 0.25)" : "rgba(0, 0, 0, 0.05)",
              padding: "0.25rem",
              borderRadius: "6px",
              border: darkMode ? "1px solid var(--border-color)" : "1px solid rgba(0, 0, 0, 0.08)",
              width: "fit-content"
            }}>
              <button
                onClick={() => setSelectedCategory("all")}
                style={{
                  padding: "0.45rem 1.2rem",
                  borderRadius: "4px",
                  border: "none",
                  background: selectedCategory === "all" ? "var(--accent-color)" : "transparent",
                  color: selectedCategory === "all" ? "white" : "var(--text-secondary)",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
              >
                📋 앵커 기자재 대장
              </button>
              <button
                onClick={() => setSelectedCategory("ai_dx")}
                style={{
                  padding: "0.45rem 1.2rem",
                  borderRadius: "4px",
                  border: "none",
                  background: selectedCategory === "ai_dx" ? "var(--accent-color)" : "transparent",
                  color: selectedCategory === "ai_dx" ? "white" : "var(--text-secondary)",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
              >
                ⚡ AI∙DX 특화 기자재
              </button>
              <button
                onClick={() => setSelectedCategory("scan")}
                style={{
                  padding: "0.45rem 1.2rem",
                  borderRadius: "4px",
                  border: "none",
                  background: selectedCategory === "scan" ? "var(--accent-color)" : "transparent",
                  color: selectedCategory === "scan" ? "white" : "var(--text-secondary)",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
              >
                📷 실시간 자산 스캔 점검
              </button>
            </div>

            {/* 검색창 & 업로드/다운로드 제어 도구 */}
            {selectedCategory !== "scan" && (
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Search size={14} style={{ position: "absolute", left: "0.4rem", color: "var(--text-secondary)" }} />
                  <input
                    type="text"
                    placeholder="품명, 번호, 바코드 검색..."
                    value={equipSearchQuery}
                    onChange={(e) => setEquipSearchQuery(e.target.value)}
                    style={{
                      padding: "0.35rem 0.5rem 0.35rem 1.4rem",
                      fontSize: "0.7rem",
                      borderRadius: "4px",
                      border: "1px solid var(--border-color)",
                      background: "var(--panel-bg)",
                      color: "var(--text-primary)",
                      width: "160px",
                      outline: "none"
                    }}
                  />
                </div>
                
                {/* 📋 전체 기자재대장용 엑셀 업로드/다운로드 추가 */}
                {selectedCategory === "all" && (
                  <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                    
                    {/* 필드 가시성 설정 드롭다운 */}
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() => setIsColMenuOpen(!isColMenuOpen)}
                        style={{
                          padding: "0.35rem 0.65rem",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "4px",
                          color: "var(--text-secondary)",
                          fontSize: "0.68rem",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          transition: "all 0.15s ease"
                        }}
                      >
                        ⚙️ 필드 선택
                      </button>
                      
                      {isColMenuOpen && (
                        <div style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          marginTop: "0.4rem",
                          background: "var(--panel-bg)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "8px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                          padding: "0.6rem",
                          zIndex: 99,
                          width: "160px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.35rem"
                        }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--accent-color)", fontWeight: "800", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.3rem", marginBottom: "0.2rem" }}>
                            표시할 필드 선택
                          </div>
                          {Object.keys(visibleColumns).map((colKey) => {
                            const label = {
                              asset_number: "자산번호",
                              category_name: "분류명",
                              item_name: "품목명",
                              spec: "규격",
                              inspect_date: "검수일자",
                              price: "금액",
                              dept_name: "관리부서",
                              install_dept: "설치부서",
                              room_no: "호실",
                              item_type: "항목",
                              pay_date: "지출일자",
                              is_sw: "SW여부",
                              vendor: "구입업체",
                              ai_dx: "AI∙DX 자산여부"
                            }[colKey];

                            return (
                              <label key={colKey} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.65rem", color: "var(--text-primary)", cursor: "pointer" }}>
                                <input
                                  type="checkbox"
                                  checked={visibleColumns[colKey]}
                                  onChange={() => setVisibleColumns({
                                    ...visibleColumns,
                                    [colKey]: !visibleColumns[colKey]
                                  })}
                                  style={{ accentColor: "var(--accent-color)" }}
                                />
                                {label}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 엑셀 서식 다운로드 (첫번째 그림의 스타일과 동기화) */}
                    <button
                      onClick={handleDownloadEquipTemplate}
                      className="action-btn download-btn"
                      style={{
                        background: "var(--bg-tertiary)",
                        cursor: "pointer"
                      }}
                      title="업로드 양식 서식(.xlsx) 다운로드"
                    >
                      <Download size={16} /> 엑셀 서식
                    </button>

                    {/* 엑셀 업로드 (첫번째 그림의 스타일과 동기화) */}
                    <label
                      className="action-btn upload-btn"
                      style={{
                        cursor: "pointer"
                      }}
                      title="엑셀 파일을 통한 자산 대량 업로드 등록"
                    >
                      <Upload size={16} /> 엑셀 업로드
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleExcelImportEquipment}
                        style={{ display: "none" }}
                      />
                    </label>

                    {/* 엑셀 다운로드 (첫번째 그림의 스타일과 동기화) */}
                    <button
                      onClick={handleExportEquipExcel}
                      className="action-btn download-btn"
                      style={{
                        background: "var(--bg-tertiary)",
                        cursor: "pointer"
                      }}
                      title="전체 기자재 목록을 엑셀 파일로 다운로드"
                    >
                      <Download size={16} /> 엑셀 다운로드
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 본문 레이아웃 분기 */}
          {selectedCategory === "scan" ? (
            /* [자산 실시간 스캔 점검 화면] */
            <div style={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "2rem" }}>
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#A78BFA", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                  📷 실시간 자산 스캔 점검 시스템
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                  바코드 리더기로 자산 바코드를 스캔(또는 수동 입력 후 Enter) 하시면, 자산 정보 검색 및 최종 실사 점검 시각이 자동 갱신됩니다.
                </p>
              </div>

              {/* 스캔 입력 폼 */}
              <form onSubmit={handleBarcodeScan} style={{ maxWidth: "500px", margin: "0 auto 2rem auto" }}>
                <div style={{ display: "flex", gap: "0.5rem", position: "relative" }}>
                  <input
                    type="text"
                    autoFocus
                    placeholder="바코드를 스캔해 주세요 (예: 8809123456789)"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "0.8rem 1rem",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      borderRadius: "8px",
                      border: "2px solid var(--accent-color)",
                      background: "rgba(0, 0, 0, 0.4)",
                      color: "white",
                      textAlign: "center",
                      letterSpacing: "1px"
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "0.8rem 1.5rem",
                      background: "linear-gradient(135deg, var(--accent-color) 0%, #7C3AED 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: "800",
                      cursor: "pointer"
                    }}
                  >
                    확인
                  </button>
                </div>
              </form>

              {/* 피드백 상태 박스 */}
              {scanError && (
                <div style={{ maxWidth: "600px", margin: "0 auto 1.5rem auto", padding: "1rem", borderRadius: "8px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#F87171", textAlign: "center", fontSize: "0.78rem", fontWeight: "700" }}>
                  {scanError}
                </div>
              )}

              {scanSuccess && (
                <div style={{ maxWidth: "600px", margin: "0 auto 1.5rem auto", padding: "0.85rem", borderRadius: "8px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#34D399", textAlign: "center", fontSize: "0.78rem", fontWeight: "700" }}>
                  🎉 [성공] 자산 점검 완료! (최종 점검 시각이 방금 전으로 갱신되었습니다)
                </div>
              )}

              {/* 자산 상세 보기 카드 */}
              {scannedAsset && (
                <div className="glass-card" style={{ maxWidth: "600px", margin: "0 auto", padding: "1.5rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "#10B981", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "0.85rem", display: "flex", justifyContent: "space-between" }}>
                    <span>🔍 점검 대상 자산 상세 정보</span>
                    <span style={{ fontSize: "0.68rem", background: "rgba(16, 185, 129, 0.2)", padding: "0.1rem 0.35rem", borderRadius: "4px" }}>
                      {scannedAsset.category === "ai_dx" ? "AI∙DX 자산" : "기타자산"}
                    </span>
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.75rem" }}>
                    <div>
                      <span style={{ color: "var(--text-secondary)", display: "block" }}>기자재 품명</span>
                      <strong style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>{scannedAsset.item_name}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)", display: "block" }}>물품(기자재)번호</span>
                      <strong style={{ fontFamily: "monospace", color: "var(--text-primary)" }}>{scannedAsset.asset_number}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)", display: "block" }}>바코드 ID</span>
                      <strong style={{ fontFamily: "monospace", color: "#60A5FA" }}>{scannedAsset.barcode_id}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)", display: "block" }}>재고(보관) 위치</span>
                      <strong style={{ color: "var(--text-primary)" }}>{scannedAsset.stock_location || "-"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)", display: "block" }}>사용 분야(목적)</span>
                      <strong style={{ color: "var(--text-primary)" }}>{scannedAsset.usage_type}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)", display: "block" }}>수량</span>
                      <strong style={{ color: "var(--text-primary)" }}>{scannedAsset.quantity}개</strong>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <span style={{ color: "var(--text-secondary)", display: "block" }}>최근 점검 시각 (last_checked_at)</span>
                      <strong style={{ color: "#FBBF24" }}>{scannedAsset.last_checked_at ? new Date(scannedAsset.last_checked_at).toLocaleString("ko-KR") : "미점검"}</strong>
                    </div>
                    {scannedAsset.memo && (
                      <div style={{ gridColumn: "span 2" }}>
                        <span style={{ color: "var(--text-secondary)", display: "block" }}>비고 및 특이사항</span>
                        <p style={{ margin: "0.15rem 0 0 0", color: "var(--text-secondary)" }}>{scannedAsset.memo}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* [기자재 현황 테이블] */
            <div style={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontSize: "0.75rem" }}>데이터 로드 중...</div>
              ) : (
                (() => {
                  // 💡 [교육용 한글 주석] 현재 선택된 연차(selectedYear)에 맞는 기자재 자산만 필터링하여 노출합니다. (자산번호의 접두사가 현재 기준 연도(예: 2025-, 2026-)로 시작하거나 검수일자가 기준 연도에 포함되는 경우에 해당)
                  const targetYearStr = String(2024 + (Number(selectedYear) || 1));
                  const filtered = equipments
                    .filter((e) => {
                      const assetNum = e.asset_number || "";
                      // 💡 [교육용 한글 주석] 연차 구분은 오직 자산번호 앞 4자리(예: 2025)만 기준으로 필터링합니다.
                      return assetNum.startsWith(targetYearStr);
                    })
                    .filter((e) => selectedCategory === "all" ? true : e.category === selectedCategory)
                    .filter((e) => {
                      if (!equipSearchQuery.trim()) return true;
                      const query = equipSearchQuery.toLowerCase();
                      
                      let memoObj = {};
                      try {
                        if (e.memo && e.memo.trim().startsWith("{")) {
                          memoObj = JSON.parse(e.memo);
                        }
                      } catch (err) {}

                      const specText = (memoObj.spec || "").toLowerCase();
                      const catText = (memoObj.category_name || (e.category === "ai_dx" ? "AI∙DX 특화" : "기타자산")).toLowerCase();
                      const installText = (memoObj.install_dept || "").toLowerCase();
                      const roomText = (memoObj.room_no || e.stock_location || "").toLowerCase();
                      const vendorText = (memoObj.vendor || "").toLowerCase();
                      const deptText = (e.dept_name || "").toLowerCase();
                      const isSwText = (memoObj.is_sw || "아니오").toLowerCase();
                      const itemTypeText = (memoObj.item_type || e.usage_type || "").toLowerCase();

                      return (
                        e.item_name.toLowerCase().includes(query) ||
                        e.asset_number.toLowerCase().includes(query) ||
                        (e.barcode_id || "").toLowerCase().includes(query) ||
                        specText.includes(query) ||
                        catText.includes(query) ||
                        installText.includes(query) ||
                        roomText.includes(query) ||
                        vendorText.includes(query) ||
                        deptText.includes(query) ||
                        isSwText.includes(query) ||
                        itemTypeText.includes(query)
                      );
                    });

                  const sortedData = [...filtered].sort((a, b) => {
                    if (!sortKey) return 0;
                    
                    let valA = "";
                    let valB = "";
                    
                    let metaA = {};
                    let metaB = {};
                    try {
                      if (a.memo && a.memo.trim().startsWith("{")) metaA = JSON.parse(a.memo);
                    } catch(e){}
                    try {
                      if (b.memo && b.memo.trim().startsWith("{")) metaB = JSON.parse(b.memo);
                    } catch(e){}

                    switch(sortKey) {
                      case "item_name":
                        valA = a.item_name || "";
                        valB = b.item_name || "";
                        break;
                      case "asset_number":
                        valA = a.asset_number || "";
                        valB = b.asset_number || "";
                        break;
                      case "barcode_id":
                        valA = a.barcode_id || "";
                        valB = b.barcode_id || "";
                        break;
                      case "stock_location":
                        valA = a.stock_location || "";
                        valB = b.stock_location || "";
                        break;
                      case "usage_type":
                        valA = a.usage_type || "";
                        valB = b.usage_type || "";
                        break;
                      case "last_checked_at":
                        valA = a.last_checked_at || "";
                        valB = b.last_checked_at || "";
                        break;
                      case "category_name":
                        valA = metaA.category_name || (a.category === "ai_dx" ? "AI∙DX 특화" : "기타자산");
                        valB = metaB.category_name || (b.category === "ai_dx" ? "AI∙DX 특화" : "기타자산");
                        break;
                      case "spec":
                        valA = metaA.spec || "";
                        valB = metaB.spec || "";
                        break;
                      case "inspect_date":
                        valA = metaA.inspect_date || "";
                        valB = metaB.inspect_date || "";
                        break;
                      case "price":
                        valA = a.unit_price || 0;
                        valB = b.unit_price || 0;
                        break;
                      case "dept_name":
                        valA = a.dept_name || "";
                        valB = b.dept_name || "";
                        break;
                      case "install_dept":
                        valA = metaA.install_dept || "";
                        valB = metaB.install_dept || "";
                        break;
                      case "room_no":
                        valA = metaA.room_no || a.stock_location || "";
                        valB = metaB.room_no || b.stock_location || "";
                        break;
                      case "item_type":
                        valA = metaA.item_type || a.usage_type || "";
                        valB = metaB.item_type || b.usage_type || "";
                        break;
                      case "pay_date":
                        valA = metaA.pay_date || "";
                        valB = metaB.pay_date || "";
                        break;
                      case "is_sw":
                        valA = metaA.is_sw || "아니오";
                        valB = metaB.is_sw || "아니오";
                        break;
                      case "vendor":
                        valA = metaA.vendor || "";
                        valB = metaB.vendor || "";
                        break;
                      case "ai_dx":
                        valA = a.category || "";
                        valB = b.category || "";
                        break;
                      default:
                        break;
                    }

                    if (typeof valA === "number" && typeof valB === "number") {
                      return sortDirection === "asc" ? valA - valB : valB - valA;
                    }
                    
                    valA = String(valA);
                    valB = String(valB);
                    return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                  });

                  if (sortedData.length === 0) {
                    return (
                      <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                        조회된 기자재가 존재하지 않습니다.
                      </div>
                    );
                  }

                  if (selectedCategory === "all") {
                    // 📋 앵커 기자재 대장 (13개 컬럼 전용 테이블 렌더링)
                    return (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.68rem", textAlign: "center" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", background: "rgba(255, 255, 255, 0.02)" }}>
                              {visibleColumns.asset_number && <th onClick={() => handleSort("asset_number")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "9%", cursor: "pointer", userSelect: "none" }}>자산번호{renderSortArrow("asset_number")}</th>}
                              {visibleColumns.category_name && <th onClick={() => handleSort("category_name")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "3%", cursor: "pointer", userSelect: "none" }}>분류명{renderSortArrow("category_name")}</th>}
                              {visibleColumns.item_name && <th onClick={() => handleSort("item_name")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "5%", cursor: "pointer", userSelect: "none" }}>품목명{renderSortArrow("item_name")}</th>}
                              {visibleColumns.spec && <th onClick={() => handleSort("spec")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "20%", cursor: "pointer", userSelect: "none" }}>규격{renderSortArrow("spec")}</th>}
                              {visibleColumns.inspect_date && <th onClick={() => handleSort("inspect_date")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "6%", cursor: "pointer", userSelect: "none" }}>검수일자{renderSortArrow("inspect_date")}</th>}
                              {visibleColumns.price && <th onClick={() => handleSort("price")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "8%", cursor: "pointer", userSelect: "none" }}>금액{renderSortArrow("price")}</th>}
                              {visibleColumns.dept_name && <th onClick={() => handleSort("dept_name")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "6%", cursor: "pointer", userSelect: "none" }}>관리부서{renderSortArrow("dept_name")}</th>}
                              {visibleColumns.install_dept && <th onClick={() => handleSort("install_dept")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "8%", cursor: "pointer", userSelect: "none" }}>설치부서{renderSortArrow("install_dept")}</th>}
                              {visibleColumns.room_no && <th onClick={() => handleSort("room_no")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "8%", cursor: "pointer", userSelect: "none" }}>호실{renderSortArrow("room_no")}</th>}
                              {visibleColumns.item_type && <th onClick={() => handleSort("item_type")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "6%", cursor: "pointer", userSelect: "none" }}>항목{renderSortArrow("item_type")}</th>}
                              {visibleColumns.pay_date && <th onClick={() => handleSort("pay_date")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "6%", cursor: "pointer", userSelect: "none" }}>지출일자{renderSortArrow("pay_date")}</th>}
                              {visibleColumns.is_sw && <th onClick={() => handleSort("is_sw")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "4%", cursor: "pointer", userSelect: "none" }}>SW여부{renderSortArrow("is_sw")}</th>}
                              {visibleColumns.vendor && <th onClick={() => handleSort("vendor")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "7%", cursor: "pointer", userSelect: "none" }}>구입업체{renderSortArrow("vendor")}</th>}
                              {visibleColumns.ai_dx && <th onClick={() => handleSort("ai_dx")} style={{ padding: "0.5rem 0.35rem", textAlign: "center", width: "4%", cursor: "pointer", userSelect: "none" }}>AI∙DX 자산여부{renderSortArrow("ai_dx")}</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {sortedData.map((item) => {
                              let originalMeta = {};
                              try {
                                if (item.memo && item.memo.trim().startsWith("{")) {
                                  originalMeta = JSON.parse(item.memo);
                                }
                              } catch (e) {
                                console.warn("Failed to parse original meta from memo:", e);
                              }

                              const assetNumber = item.asset_number || "-";
                              const categoryName = originalMeta.category_name || (item.category === "ai_dx" ? "AI∙DX 특화" : "기타자산");
                              const itemName = item.item_name || "-";
                              const spec = originalMeta.spec || "-";
                              const inspectDate = originalMeta.inspect_date || "-";
                              const price = item.unit_price ? item.unit_price.toLocaleString() : "0";
                              const deptName = item.dept_name || "-";
                              const installDept = originalMeta.install_dept || "-";
                              const roomNo = originalMeta.room_no || item.stock_location || "-";
                              const itemType = originalMeta.item_type || item.usage_type || "-";
                              const payDate = originalMeta.pay_date || "-";
                              const isSw = originalMeta.is_sw || "아니오";
                              const vendor = originalMeta.vendor || "-";

                              return (
                                <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                  {visibleColumns.asset_number && <td style={{ padding: "0.4rem 0.3rem", fontFamily: "monospace", textAlign: "center", width: "9%", whiteSpace: "nowrap" }}>{assetNumber}</td>}
                                  {visibleColumns.category_name && <td style={{ padding: "0.4rem 0.3rem", textAlign: "center", width: "3%", whiteSpace: "nowrap" }}>{categoryName}</td>}
                                  {visibleColumns.item_name && <td style={{ padding: "0.4rem 0.3rem", fontWeight: "700", color: "#34D399", textAlign: "center", width: "5%", whiteSpace: "nowrap" }}>{itemName}</td>}
                                  {visibleColumns.spec && <td style={{ padding: "0.4rem 0.3rem", textAlign: "left", width: "20%", maxWidth: "20vw", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={spec}>{spec}</td>}
                                  {visibleColumns.inspect_date && <td style={{ padding: "0.4rem 0.3rem", textAlign: "center", width: "6%", whiteSpace: "nowrap" }}>{inspectDate}</td>}
                                  {visibleColumns.price && <td style={{ padding: "0.4rem 0.3rem", textAlign: "right", fontWeight: "700", color: "#FBBF24", width: "8%", whiteSpace: "nowrap" }}>{price} 원</td>}
                                  {visibleColumns.dept_name && <td style={{ padding: "0.4rem 0.3rem", textAlign: "center", width: "6%", whiteSpace: "nowrap" }}>{deptName}</td>}
                                  {visibleColumns.install_dept && <td style={{ padding: "0.4rem 0.3rem", textAlign: "center", width: "8%", whiteSpace: "nowrap" }}>{installDept}</td>}
                                  {visibleColumns.room_no && <td style={{ padding: "0.4rem 0.3rem", textAlign: "center", width: "8%", whiteSpace: "nowrap" }}>{roomNo}</td>}
                                  {visibleColumns.item_type && <td style={{ padding: "0.4rem 0.3rem", textAlign: "center", width: "6%", whiteSpace: "nowrap" }}>{itemType}</td>}
                                  {visibleColumns.pay_date && <td style={{ padding: "0.4rem 0.3rem", textAlign: "center", width: "6%", whiteSpace: "nowrap" }}>{payDate}</td>}
                                  {visibleColumns.is_sw && <td style={{ padding: "0.4rem 0.3rem", textAlign: "center", width: "4%", whiteSpace: "nowrap" }}>{isSw}</td>}
                                  {visibleColumns.vendor && <td style={{ padding: "0.4rem 0.3rem", textAlign: "center", width: "7%", whiteSpace: "nowrap" }}>{vendor}</td>}
                                  {visibleColumns.ai_dx && (
                                    <td style={{ padding: "0.4rem 0.3rem", textAlign: "center", width: "4%" }}>
                                      <input
                                        type="checkbox"
                                        checked={item.category === "ai_dx"}
                                        disabled={currentRole.id === "GUEST"}
                                        onChange={() => toggleEquipCategory(item.id, item.category)}
                                        style={{
                                          cursor: currentRole.id === "GUEST" ? "not-allowed" : "pointer",
                                          transform: "scale(1.15)",
                                          accentColor: "#3B82F6"
                                        }}
                                      />
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  return (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "center" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                            <th onClick={() => handleSort("item_name")} style={{ padding: "0.5rem", textAlign: "center", cursor: "pointer", userSelect: "none" }}>기자재 품명{renderSortArrow("item_name")}</th>
                            <th onClick={() => handleSort("asset_number")} style={{ padding: "0.5rem", textAlign: "center", cursor: "pointer", userSelect: "none" }}>물품(기자재)번호{renderSortArrow("asset_number")}</th>
                            <th onClick={() => handleSort("barcode_id")} style={{ padding: "0.5rem", textAlign: "center", cursor: "pointer", userSelect: "none" }}>바코드{renderSortArrow("barcode_id")}</th>
                            <th onClick={() => handleSort("stock_location")} style={{ padding: "0.5rem", textAlign: "center", cursor: "pointer", userSelect: "none" }}>재고위치{renderSortArrow("stock_location")}</th>
                            <th onClick={() => handleSort("usage_type")} style={{ padding: "0.5rem", textAlign: "center", cursor: "pointer", userSelect: "none" }}>사용 분야(목적){renderSortArrow("usage_type")}</th>
                            <th onClick={() => handleSort("last_checked_at")} style={{ padding: "0.5rem", textAlign: "center", cursor: "pointer", userSelect: "none" }}>최근 점검 시각{renderSortArrow("last_checked_at")}</th>
                            <th style={{ padding: "0.5rem", textAlign: "center" }}>사용실적</th>
                            <th style={{ padding: "0.5rem", textAlign: "center" }}>관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedData.map((item) => (
                            <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                              <td style={{ padding: "0.5rem", fontWeight: "700", color: "#34D399", textAlign: "center" }}>{item.item_name}</td>
                              <td style={{ padding: "0.5rem", fontFamily: "monospace", textAlign: "center" }}>{item.asset_number}</td>
                              <td style={{ padding: "0.5rem", fontFamily: "monospace", textAlign: "center" }}>{item.barcode_id}</td>
                              <td style={{ padding: "0.5rem", textAlign: "center" }}>{item.stock_location}</td>
                              <td style={{ padding: "0.5rem", textAlign: "center" }}>
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                  <span style={{
                                    padding: "0.15rem 0.4rem",
                                    borderRadius: "4px",
                                    background: "rgba(59, 130, 246, 0.15)",
                                    border: "1px solid rgba(59, 130, 246, 0.3)",
                                    color: "#60A5FA",
                                    fontSize: "0.65rem",
                                    fontWeight: "700"
                                  }}>
                                    {item.usage_type}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: "0.5rem", color: "#FBBF24", fontWeight: "600", textAlign: "center" }}>
                                {item.last_checked_at ? new Date(item.last_checked_at).toLocaleString("ko-KR") : "-"}
                              </td>
                              <td style={{ padding: "0.5rem", textAlign: "center" }}>
                                <button
                                  onClick={() => handleOpenUtilizationModal(item)}
                                  title="학기별 실적 관리"
                                  style={{ background: "none", border: "none", color: "#10B981", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                >
                                  <TrendingUp size={13} />
                                </button>
                              </td>
                              <td style={{ padding: "0.5rem", textAlign: "center" }}>
                                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                                  <button
                                    onClick={() => handleOpenEditEquip(item)}
                                    title="수정"
                                    style={{ background: "none", border: "none", color: "#60A5FA", cursor: "pointer" }}
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEquipment(item.id)}
                                    title="삭제"
                                    style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer" }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>
      )}

      </div>

      {/* ============================================================================ */}
      {/* 모달 1: 공간 예약 신청 대화상자 */}
      {/* ============================================================================ */}
      {isResModalOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999
        }}>
          <div style={{
            background: "var(--modal-bg, #1e293b)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            width: "380px",
            padding: "1.25rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "0.85rem", color: "#a78bfa" }}>
              📅 공간 사용 예약 신청
            </h3>

            <form onSubmit={handleAddReservation} style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>예약 대상 공간</label>
                <select
                  value={resFormData.space_name}
                  onChange={(e) => setResFormData(prev => ({ ...prev, space_name: e.target.value }))}
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                >
                  {SPACES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>예약일자</label>
                <input
                  type="date"
                  value={resFormData.reserved_date}
                  onChange={(e) => setResFormData(prev => ({ ...prev, reserved_date: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>시작 시간</label>
                  <input
                    type="time"
                    value={resFormData.start_time}
                    onChange={(e) => setResFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>종료 시간</label>
                  <input
                    type="time"
                    value={resFormData.end_time}
                    onChange={(e) => setResFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>신청부서</label>
                <select
                  value={resFormData.dept}
                  onChange={(e) => setResFormData(prev => ({ ...prev, dept: e.target.value }))}
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                >
                  {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터", "직접입력"].map(d => (
                    <option key={d} value={d}>{d === "직접입력" ? "직접입력 (사업단 외 조직)" : d}</option>
                  ))}
                </select>
              </div>

              {resFormData.dept === "직접입력" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>신청부서 (사업단 외 조직명 직접 입력)</label>
                  <input
                    type="text"
                    placeholder="예: 울산대학교 행정처, OO협회"
                    value={resFormData.custom_dept}
                    onChange={(e) => setResFormData(prev => ({ ...prev, custom_dept: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                  {resFormData.dept === "직접입력" ? "예약대행자 (사업단 구성원)" : "신청자 (사업단 구성원)"}
                </label>
                <input
                  type="text"
                  placeholder="사업단 소속 구성원 이름 입력"
                  value={resFormData.reserver_name}
                  onChange={(e) => setResFormData(prev => ({ ...prev, reserver_name: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                />
              </div>

              {resFormData.dept === "직접입력" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>실제 이용자명 (외부 담당자)</label>
                  <input
                    type="text"
                    placeholder="공간을 이용할 실제 외부 담당자명"
                    value={resFormData.actual_user_name}
                    onChange={(e) => setResFormData(prev => ({ ...prev, actual_user_name: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>사용 목적</label>
                <input
                  type="text"
                  placeholder="예: 지산학 워크숍 개최 등"
                  value={resFormData.purpose}
                  onChange={(e) => setResFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsResModalOpen(false)}
                  style={{ flex: 1, padding: "0.45rem", background: "rgba(255,255,255,0.06)", border: "none", color: "var(--text-secondary)", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, padding: "0.45rem", background: "var(--accent-color)", border: "none", color: "white", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}
                >
                  {loading ? "등록 중..." : "승인요청"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 모달 3: 승인권자의 일시 조정/변경 모달 */}
      {/* ============================================================================ */}
      {isEditTimeModalOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999
        }}>
          <div style={{
            background: "var(--modal-bg, #1e293b)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            width: "350px",
            padding: "1.25rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "0.85rem", color: "#60A5FA", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Clock size={18} /> ⏱️ 예약 일시 변경 (조율 권한)
            </h3>
            <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginBottom: "0.85rem" }}>
              승인권자 권한으로 예약 신청 건의 사용 시간과 날짜를 조정합니다.
            </p>

            <form onSubmit={handleSaveEditedTime} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>예약일자</label>
                <input
                  type="date"
                  value={editResFormData.reserved_date}
                  onChange={(e) => setEditResFormData(prev => ({ ...prev, reserved_date: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>시작 시간</label>
                  <input
                    type="time"
                    value={editResFormData.start_time}
                    onChange={(e) => setEditResFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>종료 시간</label>
                  <input
                    type="time"
                    value={editResFormData.end_time}
                    onChange={(e) => setEditResFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditTimeModalOpen(false);
                    setEditingRes(null);
                  }}
                  style={{ flex: 1, padding: "0.45rem", background: "rgba(255,255,255,0.06)", border: "none", color: "var(--text-secondary)", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
                >
                  닫기
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, padding: "0.45rem", background: "#3b82f6", border: "none", color: "white", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}
                >
                  {loading ? "저장 중..." : "일시 조정 적용"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 모달 4: 기자재 추가/수정 대화상자 */}
      {/* ============================================================================ */}
      {isEquipModalOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999
        }}>
          <div style={{
            background: "var(--modal-bg, #1e293b)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            width: "380px",
            padding: "1.25rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "0.85rem", color: "#34D399" }}>
              {editingEquipId ? "📝 기자재 정보 수정" : "📦 구매 완료 기자재 불러오기"}
            </h3>

            <form onSubmit={handleSaveEquipment} style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {!editingEquipId && (
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#60A5FA", fontWeight: "800", marginBottom: "0.25rem" }}>
                    📥 구매 완료 기자재 선택 (불러오기)
                  </label>
                  <select
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) return;
                      const targetItem = completedProcuredItems.find(item => item.id.toString() === selectedId);
                      if (targetItem) {
                        setEquipFormData({
                          item_name: targetItem.item_name || "",
                          asset_number: targetItem.asset_number || `AIDX-EQ-${targetItem.id}`,
                          barcode_id: targetItem.barcode || "", // 조달에서 스캔 등록한 바코드 연동
                          stock_location: "",
                          category: (targetItem.item_name || "").includes("AI") || (targetItem.item_name || "").includes("DX") ? "ai_dx" : "other",
                          usage_type: "정규교과",
                          memo: targetItem.description || ""
                        });
                      }
                    }}
                    style={{ width: "100%", padding: "0.45rem", background: "rgba(0,0,0,0.3)", border: "1px solid var(--accent-color)", borderRadius: "4px", color: "white", fontSize: "0.75rem" }}
                  >
                    <option value="">-- 구매 완료 내역에서 선택 (불러오기) --</option>
                    {completedProcuredItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.item_name} ({item.quantity}개, {item.unit_price ? (item.unit_price / 1000000).toFixed(1) : 0}백만원) - {item.dept_name || item.division_name || "소속 없음"}
                      </option>
                    ))}
                  </select>
                  <p style={{ margin: "0.2rem 0 0.5rem 0", fontSize: "0.62rem", color: "var(--text-secondary)" }}>
                    * 기획/구매 단계에서 검수 완료 처리된 품목들만 조회됩니다.
                  </p>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>기자재 품명</label>
                <input
                  type="text"
                  placeholder="위 드롭다운에서 기자재를 선택하세요"
                  value={equipFormData.item_name}
                  onChange={(e) => setEquipFormData(prev => ({ ...prev, item_name: e.target.value }))}
                  required
                  disabled={!editingEquipId}
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem", opacity: !editingEquipId ? 0.6 : 1 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>물품(기자재)번호</label>
                <input
                  type="text"
                  placeholder="기자재 선택 시 자동 입력됩니다"
                  value={equipFormData.asset_number}
                  onChange={(e) => setEquipFormData(prev => ({ ...prev, asset_number: e.target.value }))}
                  required
                  disabled={!editingEquipId}
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem", opacity: !editingEquipId ? 0.6 : 1 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>바코드</label>
                <input
                  type="text"
                  placeholder="예: 8809123456789"
                  value={equipFormData.barcode_id || ""}
                  onChange={(e) => setEquipFormData(prev => ({ ...prev, barcode_id: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>재고(보관) 위치</label>
                <input
                  type="text"
                  placeholder="예: 동부캠퍼스 1공학관 204호 AIDX 교육실"
                  value={equipFormData.stock_location}
                  onChange={(e) => setEquipFormData(prev => ({ ...prev, stock_location: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>자산 구분</label>
                <select
                  value={equipFormData.category}
                  onChange={(e) => setEquipFormData(prev => ({ ...prev, category: e.target.value }))}
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                >
                  <option value="ai_dx">AI∙DX 자산</option>
                  <option value="other">기타 자산</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>사용 분야(목적)</label>
                <select
                  value={equipFormData.usage_type}
                  onChange={(e) => setEquipFormData(prev => ({ ...prev, usage_type: e.target.value }))}
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                >
                  {USAGE_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>비고 및 특이사항</label>
                <input
                  type="text"
                  placeholder="예: 2026 라이즈 특화 1차 도입분"
                  value={equipFormData.memo}
                  onChange={(e) => setEquipFormData(prev => ({ ...prev, memo: e.target.value }))}
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsEquipModalOpen(false)}
                  style={{ flex: 1, padding: "0.45rem", background: "rgba(255,255,255,0.06)", border: "none", color: "var(--text-secondary)", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, padding: "0.45rem", background: "#10B981", border: "none", color: "white", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}
                >
                  {loading ? "저장 중..." : "정보 저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 탭 3: 학기별 활용 실적 관리 모달 */}
      {/* ============================================================================ */}
      {isUtilModalOpen && selectedUtilEquip && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999
        }}>
          <div style={{
            background: "var(--modal-bg, #1e293b)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            width: "550px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
            overflow: "hidden"
          }}>
            {/* 헤더 */}
            <div style={{ padding: "1rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)" }}>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#34D399", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <TrendingUp size={16} /> 학기별 활용 실적 관리
                </h3>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                  {selectedUtilEquip.item_name} ({selectedUtilEquip.asset_number})
                </p>
              </div>
              <button
                onClick={() => setIsUtilModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "1.2rem", cursor: "pointer" }}
              >
                &times;
              </button>
            </div>

            {/* 몸체 */}
            <div style={{ padding: "1rem", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* 기자재 정보 바 */}
              <div style={{ display: "flex", gap: "1rem", padding: "0.6rem 0.8rem", background: "rgba(0,0,0,0.2)", borderRadius: "6px", fontSize: "0.7rem" }}>
                <div><span style={{ color: "var(--text-secondary)" }}>바코드:</span> <span style={{ fontFamily: "monospace", color: "var(--text-primary)" }}>{selectedUtilEquip.barcode_id}</span></div>
                <div><span style={{ color: "var(--text-secondary)" }}>재고위치:</span> <span style={{ color: "var(--text-primary)" }}>{selectedUtilEquip.stock_location || "-"}</span></div>
              </div>

              {/* 실적 리스트 */}
              <div>
                <h4 style={{ fontSize: "0.75rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-primary)" }}>📋 등록된 실적 리스트</h4>
                <div style={{ background: "rgba(0,0,0,0.15)", border: "1px solid var(--border-color)", borderRadius: "6px", maxHeight: "250px", overflowY: "auto" }}>
                  {utilRecords.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontSize: "0.7rem" }}>
                      등록된 학기별 활용 실적이 없습니다. 아래 폼에서 추가해 주세요.
                    </div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", background: "rgba(255,255,255,0.02)" }}>
                          <th style={{ padding: "0.5rem", width: "130px" }}>학기</th>
                          <th style={{ padding: "0.5rem" }}>실적 세부내역</th>
                          <th style={{ padding: "0.5rem", width: "50px", textAlign: "center" }}>삭제</th>
                        </tr>
                      </thead>
                      <tbody>
                        {utilRecords.map((rec) => (
                          <tr key={rec.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                            <td style={{ padding: "0.5rem", fontWeight: "700", color: "#60A5FA" }}>{rec.semester}</td>
                            <td style={{ padding: "0.5rem", color: "var(--text-primary)", whiteSpace: "pre-line" }}>{rec.usage_details}</td>
                            <td style={{ padding: "0.5rem", textAlign: "center" }}>
                              <button
                                onClick={() => handleDeleteUtilization(rec.id)}
                                style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer" }}
                                title="실적 삭제"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* 실적 등록 폼 */}
              <form onSubmit={handleSaveUtilization} style={{ padding: "0.8rem", border: "1px solid rgba(16, 185, 129, 0.2)", background: "rgba(16, 185, 129, 0.02)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <h4 style={{ fontSize: "0.75rem", fontWeight: "700", color: "#34D399", margin: 0 }}>➕ 신규 실적 추가</h4>
                
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <div style={{ width: "160px" }}>
                    <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>학기 선택</label>
                    <select
                      value={utilFormData.semester}
                      onChange={(e) => setUtilFormData(prev => ({ ...prev, semester: e.target.value }))}
                      style={{ width: "100%", padding: "0.4rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.7rem" }}
                    >
                      <option value="2024학년도 1학기">2024학년도 1학기</option>
                      <option value="2024학년도 2학기">2024학년도 2학기</option>
                      <option value="2025학년도 1학기">2025학년도 1학기</option>
                      <option value="2025학년도 2학기">2025학년도 2학기</option>
                      <option value="2026학년도 1학기">2026학년도 1학기</option>
                      <option value="2026학년도 2학기">2026학년도 2학기</option>
                      <option value="2027학년도 1학기">2027학년도 1학기</option>
                      <option value="2027학년도 2학기">2027학년도 2학기</option>
                    </select>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>실적 세부사항</label>
                    <input
                      type="text"
                      placeholder="예: 정규교과 AI 기초실습 45명 이수 및 기자재 100% 활용"
                      value={utilFormData.usage_details}
                      onChange={(e) => setUtilFormData(prev => ({ ...prev, usage_details: e.target.value }))}
                      required
                      style={{ width: "100%", padding: "0.4rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.7rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.2rem" }}>
                  <button
                    type="submit"
                    style={{ padding: "0.4rem 1rem", background: "#10B981", border: "none", color: "white", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer" }}
                  >
                    추가하기
                  </button>
                </div>
              </form>
            </div>

            {/* 푸터 */}
            <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", background: "rgba(255,255,255,0.01)" }}>
              <button
                onClick={() => setIsUtilModalOpen(false)}
                style={{ padding: "0.4rem 1.2rem", background: "rgba(255,255,255,0.06)", border: "none", color: "var(--text-secondary)", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer" }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
