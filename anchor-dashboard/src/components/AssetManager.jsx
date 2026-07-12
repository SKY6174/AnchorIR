import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Plus, Trash2, Edit2, Calendar, Clipboard, CheckCircle, AlertTriangle, Search, Home, Laptop, Check, Clock, TrendingUp } from "lucide-react";

export default function AssetManager({ currentRole, currentUser, activeSubTab, onChangeSubTab, darkMode }) {
  // 공통 로딩 상태
  const [loading, setLoading] = useState(false);

  // 승인권자 여부 판별 헬퍼 (심현미/김현수/송경영 등 관리자 롤 포함)
  const isApprover = (role) => {
    if (!role) return false;
    const rid = role.id || "";
    return ["ADMIN", "G_DIRECTOR", "HQ_HEAD", "MANAGER"].includes(rid);
  };

  // 취소/반려 가능 조건 판별 (신청자 본인 또는 심현미/김현수/송경영)
  const canCancelOrReject = (res) => {
    if (!currentUser) return false;
    if (isApprover(currentRole)) return true;
    const userName = currentUser.name || "";
    if (userName && res.reserver_name.includes(userName)) return true;
    return false;
  };

  // ==============================================================================
  // [1] 교육환경 관리 (공간 예약 시스템) 상태 및 핸들러
  // ==============================================================================
  const SPACES = ["AI∙DX대강의실", "AI∙DX1강의실", "AI∙DX2강의실", "늘봄누리센터강의실", "앵커사업단회의실"];
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
    if (!isApprover(currentRole)) {
      alert("⚠️ 승인 권한이 없습니다. (심현미, 김현수, 송경영 등 지정 결재권자만 승인 가능)");
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
    if (!isApprover(currentRole)) {
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
  const [selectedCategory, setSelectedCategory] = useState("ai_dx"); // "ai_dx", "other", or "scan"
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [editingEquipId, setEditingEquipId] = useState(null);
  const [equipSearchQuery, setEquipSearchQuery] = useState("");

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
      const payload = {
        item_name: equipFormData.item_name,
        asset_number: equipFormData.asset_number,
        barcode_id: equipFormData.barcode_id,
        stock_location: equipFormData.stock_location,
        category: equipFormData.category,
        usage_type: equipFormData.usage_type,
        memo: equipFormData.memo
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

  useEffect(() => {
    fetchReservations();
    fetchEquipments();
  }, [activeSubTab]);

  return (
    <div style={{ padding: "1.25rem", color: "var(--text-primary)" }}>
      
      {/* [A] 자산 관리 대분류 서브메뉴 가로 탭바 */}
      <div style={{
        display: "flex",
        gap: "1.5rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        paddingBottom: "0.1rem",
        marginBottom: "1.5rem"
      }}>
        <button
          onClick={() => onChangeSubTab && onChangeSubTab("education_env")}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "0.95rem",
            fontWeight: "800",
            cursor: "pointer",
            padding: "0.5rem 1rem",
            color: activeSubTab === "education_env" ? "var(--accent-color)" : "var(--text-secondary)",
            borderBottom: activeSubTab === "education_env" ? "2.5px solid var(--accent-color)" : "none",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <Home size={16} /> 🏫 교육환경 사용예약 관리
        </button>
        <button
          onClick={() => onChangeSubTab && onChangeSubTab("equipment")}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "0.95rem",
            fontWeight: "800",
            cursor: "pointer",
            padding: "0.5rem 1rem",
            color: activeSubTab === "equipment" ? "var(--accent-color)" : "var(--text-secondary)",
            borderBottom: activeSubTab === "equipment" ? "2.5px solid var(--accent-color)" : "none",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <Laptop size={16} /> 📦 기자재 대장 관리
        </button>
      </div>

      {/* 대시보드 타이틀 설명 영역 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            📌 {activeSubTab === "education_env" ? "교육환경 사용예약 현황판" : "앵커사업 기자재 현황 관리"}
          </h2>
          <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            {activeSubTab === "education_env" 
              ? "앵커사업단 관리 교육공간의 대여 상태를 실시간 모니터링하고 중복 일정을 차단합니다." 
              : "사업 재원으로 취득한 기자재 목록을 AI∙DX 자산과 기타 일반 자산으로 분류해 대장을 운용합니다."}
          </p>
        </div>

        {activeSubTab === "education_env" ? (
          <button
            onClick={() => {
              setResFormData(prev => ({ ...prev, space_name: selectedSpace }));
              setIsResModalOpen(true);
            }}
            style={{
              padding: "0.45rem 0.85rem",
              background: "linear-gradient(135deg, var(--accent-color) 0%, #8b5cf6 100%)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)"
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
            <h3 style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
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
                    <span style={{ fontSize: "0.75rem", fontWeight: isSelected ? "800" : "500", color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}>
                      {space}
                    </span>
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
                <h3 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Calendar size={18} /> 📅 {selectedSpace} 예약 월간 현황
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
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
                      return <div key={`empty-${idx}`} style={{ minHeight: "52px", background: "rgba(255,255,255,0.01)" }}></div>;
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
                            ? "rgba(139, 92, 246, 0.1)" 
                            : (dayReservations.length > 0 ? "rgba(255,255,255,0.03)" : "transparent"),
                          border: `1px solid ${isSelected ? "var(--accent-color)" : "rgba(255,255,255,0.05)"}`,
                          borderRadius: "4px",
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
                ⚡ [{selectedCalendarDate}] 예약 현황 목록 ({selectedSpace})
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
                                    {isApprover(currentRole) && (
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
              background: "rgba(0, 0, 0, 0.25)",
              padding: "0.25rem",
              borderRadius: "6px",
              border: "1px solid var(--border-color)",
              width: "fit-content"
            }}>
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
                onClick={() => setSelectedCategory("other")}
                style={{
                  padding: "0.45rem 1.2rem",
                  borderRadius: "4px",
                  border: "none",
                  background: selectedCategory === "other" ? "var(--accent-color)" : "transparent",
                  color: selectedCategory === "other" ? "white" : "var(--text-secondary)",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
              >
                🏢 기타 일반 자산
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

            {/* 검색창 (스캔 화면이 아닐 때만 렌더링) */}
            {selectedCategory !== "scan" && (
              <div style={{ marginLeft: "auto", position: "relative", display: "flex", alignItems: "center" }}>
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
                    background: "var(--input-bg)",
                    color: "var(--text-primary)",
                    width: "180px"
                  }}
                />
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
                  const filtered = equipments
                    .filter((e) => e.category === selectedCategory)
                    .filter((e) => {
                      if (!equipSearchQuery.trim()) return true;
                      const query = equipSearchQuery.toLowerCase();
                      return (
                        e.item_name.toLowerCase().includes(query) ||
                        e.asset_number.toLowerCase().includes(query) ||
                        (e.barcode_id || "").toLowerCase().includes(query)
                      );
                    });

                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                        조회된 기자재가 존재하지 않습니다.
                      </div>
                    );
                  }

                  return (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "center" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                            <th style={{ padding: "0.5rem", textAlign: "center" }}>기자재 품명</th>
                            <th style={{ padding: "0.5rem", textAlign: "center" }}>물품(기자재)번호</th>
                            <th style={{ padding: "0.5rem", textAlign: "center" }}>바코드</th>
                            <th style={{ padding: "0.5rem", textAlign: "center" }}>재고위치</th>
                            <th style={{ padding: "0.5rem", textAlign: "center" }}>사용 분야(목적)</th>
                            <th style={{ padding: "0.5rem", textAlign: "center" }}>최근 점검 시각</th>
                            <th style={{ padding: "0.5rem", textAlign: "center" }}>사용실적</th>
                            <th style={{ padding: "0.5rem", textAlign: "center" }}>관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((item) => (
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
