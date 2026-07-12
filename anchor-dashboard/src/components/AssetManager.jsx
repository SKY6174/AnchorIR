import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Plus, Trash2, Edit2, Calendar, Clipboard, CheckCircle, AlertTriangle, Search } from "lucide-react";

export default function AssetManager({ currentRole, activeSubTab }) {
  // 공통 로딩 상태
  const [loading, setLoading] = useState(false);

  // ==============================================================================
  // [1] 교육환경 관리 (공간 예약 시스템) 상태 및 핸들러
  // ==============================================================================
  const SPACES = ["AIDX대강의실", "AIDX 1교육실", "AIDX 2교육실", "늘봄누리센터강의실", "산단1층회의실"];
  const [selectedSpace, setSelectedSpace] = useState(SPACES[0]);
  const [reservations, setReservations] = useState([]);
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [resFormData, setResFormData] = useState({
    space_name: SPACES[0],
    reserved_date: new Date().toISOString().split("T")[0],
    start_time: "10:00",
    end_time: "12:00",
    dept: "사업운영팀",
    reserver_name: "",
    purpose: ""
  });

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
    // start_time / end_time 형식: "HH:MM:SS" 또는 "HH:MM"
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

  // 공간 예약 신청 등록
  const handleAddReservation = async (e) => {
    e.preventDefault();
    if (currentRole.id === "GUEST") {
      alert("⚠️ 게스트 계정은 예약을 신청할 수 없습니다.");
      return;
    }

    if (!resFormData.reserver_name.trim()) {
      alert("⚠️ 예약자명을 입력해 주세요.");
      return;
    }

    // 시간 논리성 확인
    if (resFormData.start_time >= resFormData.end_time) {
      alert("⚠️ 종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    // 중복 충돌 실시간 검증 (프론트 가드)
    const duplicate = reservations.find((r) => {
      return (
        r.space_name === resFormData.space_name &&
        r.reserved_date === resFormData.reserved_date &&
        isTimeOverlapping(
          resFormData.start_time,
          resFormData.end_time,
          r.start_time,
          r.end_time
        )
      );
    });

    if (duplicate) {
      alert(
        `⚠️ 예약 실패: 해당 시간대에 이미 다른 예약이 존재합니다.\n(기존 예약: ${duplicate.dept} - ${duplicate.reserver_name} / ${duplicate.start_time.substring(0, 5)}~${duplicate.end_time.substring(0, 5)})`
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("asset_reservations").insert([resFormData]);
      if (error) throw error;
      alert("✨ 공간 예약 신청이 완료되었습니다.");
      setIsResModalOpen(false);
      // 예약자명 외 필드 유지 리셋
      setResFormData((prev) => ({
        ...prev,
        reserver_name: "",
        purpose: ""
      }));
      fetchReservations();
    } catch (err) {
      alert("예약 등록 에러: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 예약 취소
  const handleDeleteReservation = async (id) => {
    if (currentRole.id === "GUEST") {
      alert("⚠️ 게스트 계정은 예약을 취소할 수 없습니다.");
      return;
    }
    if (!window.confirm("정말로 이 공간 예약을 취소하시겠습니까?")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("asset_reservations").delete().eq("id", id);
      if (error) throw error;
      alert("🗑️ 예약이 성공적으로 취소되었습니다.");
      fetchReservations();
    } catch (err) {
      alert("예약 취소 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==============================================================================
  // [2] 기자재 관리 (AI∙DX 및 기타 자산 현황) 상태 및 핸들러
  // ==============================================================================
  const [equipments, setEquipments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ai_dx"); // "ai_dx" or "other"
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [editingEquipId, setEditingEquipId] = useState(null);
  const [equipSearchQuery, setEquipSearchQuery] = useState("");
  
  const USAGE_TYPES = ["정규교과", "비정규교과", "평생직업교육", "재직자과정", "기타"];
  const [equipFormData, setEquipFormData] = useState({
    asset_number: "",
    barcode: "",
    stock_location: "",
    category: "ai_dx",
    usage_type: USAGE_TYPES[0],
    item_name: "",
    memo: ""
  });

  // 기자재 로드
  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("asset_equipments")
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

    if (!equipFormData.item_name.trim() || !equipFormData.asset_number.trim() || !equipFormData.barcode.trim()) {
      alert("⚠️ 품명, 물품번호, 바코드는 필수 입력 항목입니다.");
      return;
    }

    setLoading(true);
    try {
      if (editingEquipId) {
        // 수정 모드
        const { error } = await supabase
          .from("asset_equipments")
          .update(equipFormData)
          .eq("id", editingEquipId);
        if (error) throw error;
        alert("✨ 기자재 정보가 성공적으로 수정되었습니다.");
      } else {
        // 신규 등록
        const { error } = await supabase.from("asset_equipments").insert([equipFormData]);
        if (error) throw error;
        alert("✨ 신규 기자재가 성공적으로 등록되었습니다.");
      }
      setIsEquipModalOpen(false);
      setEditingEquipId(null);
      setEquipFormData({
        asset_number: "",
        barcode: "",
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
      barcode: equip.barcode,
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
      const { error } = await supabase.from("asset_equipments").delete().eq("id", id);
      if (error) throw error;
      alert("🗑️ 기자재가 삭제되었습니다.");
      fetchEquipments();
    } catch (err) {
      alert("기자재 삭제 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 시 데이터 로드 및 초기 설정
  useEffect(() => {
    fetchReservations();
    fetchEquipments();
  }, [activeSubTab]);

  return (
    <div style={{ padding: "1.25rem", color: "var(--text-primary)" }}>
      {/* 상단 탭 인디케이터 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            🏢 {activeSubTab === "education_env" ? "교육환경 사용예약 관리" : "앵커사업 기자재 현황 관리"}
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            {activeSubTab === "education_env" 
              ? "AIDX 교육공간의 일정을 관리하고 중복 예약을 실시간 검증합니다." 
              : "사업 재원으로 취득한 AI∙DX 및 기타 기자재 자산 대장 관리 대시보드입니다."}
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
            <Plus size={16} /> 예약 신청
          </button>
        ) : (
          <button
            onClick={() => {
              setEditingEquipId(null);
              setEquipFormData({
                asset_number: "",
                barcode: "",
                stock_location: "",
                category: selectedCategory,
                usage_type: USAGE_TYPES[0],
                item_name: "",
                memo: ""
              });
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
            <Plus size={16} /> 기자재 신규 등록
          </button>
        )}
      </div>

      {/* ============================================================================ */}
      {/* 탭 1: 교육환경 관리 */}
      {/* ============================================================================ */}
      {activeSubTab === "education_env" && (
        <div>
          {/* 공간 선택 카드 리스트 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {SPACES.map((space) => {
              const count = reservations.filter(r => r.space_name === space && r.reserved_date >= new Date().toISOString().split("T")[0]).length;
              const isSelected = selectedSpace === space;
              return (
                <div
                  key={space}
                  onClick={() => setSelectedSpace(space)}
                  style={{
                    padding: "0.85rem",
                    background: isSelected ? "rgba(139, 92, 246, 0.12)" : "var(--panel-bg)",
                    border: `1px solid ${isSelected ? "var(--accent-color)" : "var(--border-color)"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    position: "relative",
                    boxShadow: isSelected ? "0 4px 12px rgba(139, 92, 246, 0.15)" : "none"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Calendar size={18} style={{ color: isSelected ? "var(--accent-color)" : "var(--text-secondary)" }} />
                    <span style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.06)", padding: "0.1rem 0.3rem", borderRadius: "4px", color: "var(--text-secondary)" }}>
                      대기 {count}건
                    </span>
                  </div>
                  <h4 style={{ fontSize: "0.75rem", fontWeight: "700", marginTop: "0.5rem", color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {space}
                  </h4>
                </div>
              );
            })}
          </div>

          {/* 해당 공간 예약 일정 현황판 */}
          <div style={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: "700", color: "#a78bfa", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "0.75rem" }}>
              📌 {selectedSpace} 예약 신청 목록
            </h3>

            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontSize: "0.75rem" }}>데이터 로드 중...</div>
            ) : reservations.filter(r => r.space_name === selectedSpace).length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                등록된 미래 예약 내역이 없습니다. 새로운 예약을 추가해 보세요.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                      <th style={{ padding: "0.5rem" }}>예약일자</th>
                      <th style={{ padding: "0.5rem" }}>사용시간</th>
                      <th style={{ padding: "0.5rem" }}>신청부서</th>
                      <th style={{ padding: "0.5rem" }}>예약자명</th>
                      <th style={{ padding: "0.5rem" }}>사용 목적</th>
                      <th style={{ padding: "0.5rem", textAlign: "center" }}>취소</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations
                      .filter((r) => r.space_name === selectedSpace)
                      .map((res) => (
                        <tr key={res.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.1s ease" }}>
                          <td style={{ padding: "0.5rem", fontWeight: "700" }}>{res.reserved_date}</td>
                          <td style={{ padding: "0.5rem", color: "#60A5FA" }}>
                            ⏱️ {res.start_time.substring(0, 5)} ~ {res.end_time.substring(0, 5)}
                          </td>
                          <td style={{ padding: "0.5rem" }}>{res.dept}</td>
                          <td style={{ padding: "0.5rem" }}>{res.reserver_name}</td>
                          <td style={{ padding: "0.5rem", color: "var(--text-secondary)" }}>{res.purpose || "-"}</td>
                          <td style={{ padding: "0.5rem", textAlign: "center" }}>
                            <button
                              onClick={() => handleDeleteReservation(res.id)}
                              style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer" }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 탭 2: 기자재 관리 */}
      {/* ============================================================================ */}
      {activeSubTab === "equipment" && (
        <div>
          {/* 가로 탭바 분기 */}
          <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
            <button
              onClick={() => setSelectedCategory("ai_dx")}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "4px",
                border: "none",
                background: selectedCategory === "ai_dx" ? "var(--accent-color)" : "rgba(255,255,255,0.04)",
                color: selectedCategory === "ai_dx" ? "white" : "var(--text-secondary)",
                fontSize: "0.72rem",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              💻 AI∙DX 기자재
            </button>
            <button
              onClick={() => setSelectedCategory("other")}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "4px",
                border: "none",
                background: selectedCategory === "other" ? "var(--accent-color)" : "rgba(255,255,255,0.04)",
                color: selectedCategory === "other" ? "white" : "var(--text-secondary)",
                fontSize: "0.72rem",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              📦 기타 자산 기자재
            </button>

            {/* 검색창 */}
            <div style={{ marginLeft: "auto", position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={14} style={{ position: "absolute", left: "0.4rem", color: "var(--text-secondary)" }} />
              <input
                type="text"
                placeholder="품명, 물품번호 검색..."
                value={equipSearchQuery}
                onChange={(e) => setEquipSearchQuery(e.target.value)}
                style={{
                  padding: "0.3rem 0.5rem 0.3rem 1.4rem",
                  fontSize: "0.7rem",
                  borderRadius: "4px",
                  border: "1px solid var(--border-color)",
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                  width: "160px"
                }}
              />
            </div>
          </div>

          {/* 기자재 현황 테이블 */}
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
                      e.barcode.toLowerCase().includes(query)
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
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                          <th style={{ padding: "0.5rem" }}>기자재 품명</th>
                          <th style={{ padding: "0.5rem" }}>물품번호</th>
                          <th style={{ padding: "0.5rem" }}>바코드</th>
                          <th style={{ padding: "0.5rem" }}>재고위치</th>
                          <th style={{ padding: "0.5rem" }}>사용 목적</th>
                          <th style={{ padding: "0.5rem" }}>메모(비고)</th>
                          <th style={{ padding: "0.5rem", textAlign: "center" }}>관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((item) => (
                          <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "0.5rem", fontWeight: "700", color: "#34D399" }}>{item.item_name}</td>
                            <td style={{ padding: "0.5rem", fontFamily: "monospace" }}>{item.asset_number}</td>
                            <td style={{ padding: "0.5rem", fontFamily: "monospace" }}>{item.barcode}</td>
                            <td style={{ padding: "0.5rem" }}>{item.stock_location}</td>
                            <td style={{ padding: "0.5rem" }}>
                              <span style={{
                                padding: "0.1rem 0.35rem",
                                borderRadius: "4px",
                                background: "rgba(59, 130, 246, 0.15)",
                                border: "1px solid rgba(59, 130, 246, 0.3)",
                                color: "#60A5FA",
                                fontSize: "0.65rem",
                                fontWeight: "700"
                              }}>
                                {item.usage_type}
                              </span>
                            </td>
                            <td style={{ padding: "0.5rem", color: "var(--text-secondary)" }}>{item.memo || "-"}</td>
                            <td style={{ padding: "0.5rem", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "0.35rem", justifyContent: "center" }}>
                                <button
                                  onClick={() => handleOpenEditEquip(item)}
                                  style={{ background: "none", border: "none", color: "#60A5FA", cursor: "pointer" }}
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEquipment(item.id)}
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
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2" }}>사용 부서(센터)</label>
                <select
                  value={resFormData.dept}
                  onChange={(e) => setResFormData(prev => ({ ...prev, dept: e.target.value }))}
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                >
                  {["사업운영팀", "ECC센터", "ICC센터", "RCC센터", "AID-X지원센터", "울산늘봄누리센터", "신산업특화센터"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>예약자명</label>
                <input
                  type="text"
                  placeholder="신청자 본인 이름 입력"
                  value={resFormData.reserver_name}
                  onChange={(e) => setResFormData(prev => ({ ...prev, reserver_name: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                />
              </div>

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
                  {loading ? "등록 중..." : "예약 승인"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 모달 2: 기자재 추가/수정 대화상자 */}
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
              {editingEquipId ? "📝 기자재 정보 수정" : "📦 신규 기자재 등록"}
            </h3>

            <form onSubmit={handleSaveEquipment} style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>기자재 품명</label>
                <input
                  type="text"
                  placeholder="예: GPU 딥러닝 워크스테이션"
                  value={equipFormData.item_name}
                  onChange={(e) => setEquipFormData(prev => ({ ...prev, item_name: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>물품번호</label>
                <input
                  type="text"
                  placeholder="예: AIDX-EQ-2026-004"
                  value={equipFormData.asset_number}
                  onChange={(e) => setEquipFormData(prev => ({ ...prev, asset_number: e.target.value }))}
                  required
                  disabled={!!editingEquipId} // 물품번호는 수정 불가능하게 보호
                  style={{ width: "100%", padding: "0.45rem", background: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "0.75rem", opacity: editingEquipId ? 0.5 : 1 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>바코드</label>
                <input
                  type="text"
                  placeholder="예: 8809123456789"
                  value={equipFormData.barcode}
                  onChange={(e) => setEquipFormData(prev => ({ ...prev, barcode: e.target.value }))}
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
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>사용 목적 (사용 분야)</label>
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
    </div>
  );
}
