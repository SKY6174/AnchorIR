import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LegacyAppRecord } from "../app-types";
import { initialProjectsData } from "../../data/mockData";
import {
  formatDataToMultiYear,
  getCalculatedYearFromDate,
  getCleanProjectsForStorage,
  mergeProjectsWithInitial,
  migrateProgramIds
} from "../app-data-utils";
import { fetchPendingVersionRequests } from "../../features/management/services/approval-service";
import { probeProcurementAdvancedColumns } from "../../features/procurement/services/procurement-data-service";
import {
  fetchDashboardSources,
  upsertProjectData
} from "../../features/projects/services/project-data-service";
import {
  deleteMonthlySchedulesByIds,
  fetchScheduleEventsForYearRepair,
  fetchScheduleMeetingsForYearRepair,
  updateScheduleEventYear,
  updateScheduleMeetingYear
} from "../../features/schedule/services/schedule-data-service";

type StringRef = { current: string };
type RecordSetter = Dispatch<SetStateAction<LegacyAppRecord[]>>;
type BooleanSetter = Dispatch<SetStateAction<boolean>>;

type DashboardDataLoadOptions = {
  selectedYear: number;
  currentUser: LegacyAppRecord | null;
  currentRole: LegacyAppRecord | null;
  getIndexedDBCache: (key: string) => Promise<string | null>;
  safeSetLocalStorage: (
    key: string,
    value: string,
    currentYear: number
  ) => void;
  setProjects: RecordSetter;
  setAgreements: RecordSetter;
  setUnifiedCertificates: RecordSetter;
  setScholarships: RecordSetter;
  setEnvData: RecordSetter;
  setEquipData: RecordSetter;
  setServiceData: RecordSetter;
  setMonthlySchedules: RecordSetter;
  setEventSchedules: RecordSetter;
  setMeetingSchedules: RecordSetter;
  setPressReleases: RecordSetter;
  setIsDbLoaded: BooleanSetter;
  setIsFetchCompleted: BooleanSetter;
  setIsAgreementsLoaded: BooleanSetter;
  setIsUnifiedCertificatesLoaded: BooleanSetter;
  setIsScholarshipsLoaded: BooleanSetter;
  setActiveDataYear: Dispatch<SetStateAction<number>>;
  fetchedProjectsRef: StringRef;
  fetchedAgreementsRef: StringRef;
  isAgreementsFetchedRef: { current: boolean };
  fetchedUnifiedCertificatesRef: StringRef;
  fetchedScholarshipsRef: StringRef;
  fetchedEnvDataRef: StringRef;
  fetchedEquipDataRef: StringRef;
  fetchedServiceDataRef: StringRef;
  fetchedMonthlySchedulesRef: StringRef;
  fetchedEventSchedulesRef: StringRef;
  fetchedMeetingSchedulesRef: StringRef;
  fetchedPressReleasesRef: StringRef;
  onSessionExpired: () => void;
};

export const useDashboardDataLoad = ({
  selectedYear,
  currentUser,
  currentRole,
  getIndexedDBCache,
  safeSetLocalStorage,
  setProjects,
  setAgreements,
  setUnifiedCertificates,
  setScholarships,
  setEnvData,
  setEquipData,
  setServiceData,
  setMonthlySchedules,
  setEventSchedules,
  setMeetingSchedules,
  setPressReleases,
  setIsDbLoaded,
  setIsFetchCompleted,
  setIsAgreementsLoaded,
  setIsUnifiedCertificatesLoaded,
  setIsScholarshipsLoaded,
  setActiveDataYear,
  fetchedProjectsRef,
  fetchedAgreementsRef,
  isAgreementsFetchedRef,
  fetchedUnifiedCertificatesRef,
  fetchedScholarshipsRef,
  fetchedEnvDataRef,
  fetchedEquipDataRef,
  fetchedServiceDataRef,
  fetchedMonthlySchedulesRef,
  fetchedEventSchedulesRef,
  fetchedMeetingSchedulesRef,
  fetchedPressReleasesRef,
  onSessionExpired
}: DashboardDataLoadOptions) => {
  // 1) 최초 마운트 및 연차 변경 시 DB 데이터 Fetch 연동
  useEffect(() => {
    let active = true;

    const fetchAllDashboardData = async () => {
      // 💡 [보안/에러 원천 방어 가드] 로그인 완료 전(currentUser가 없음)에는 Supabase API를 요청하지 않고 무조건 대기합니다.
      if (!currentUser) return;

      try {
        // 💡 [깜빡임 방지 및 0초 반응 최적화] 비비비동기 원격 쿼리가 시작되기 전에, IndexedDB 캐시를 먼저 비동기로 즉시 인출하여 상태에 주입합니다.
        try {
          const [
            cachedProj,
            cachedAgr,
            cachedUnifiedCert,
            cachedScholarships,
            cachedEnv,
            cachedEquip,
            cachedServ,
            cachedMonth,
            cachedEvent,
            cachedMeet,
            cachedPress
          ] = await Promise.all([
            getIndexedDBCache(`anchor_cache_proj_y${selectedYear}_v56`),
            getIndexedDBCache("anchor_cache_agreements_all"),
            getIndexedDBCache("anchor_cache_unified_certificates_all"),
            getIndexedDBCache("anchor_cache_scholarships_all"),
            getIndexedDBCache(`anchor_cache_env_y${selectedYear}`),
            getIndexedDBCache(`anchor_cache_equip_y${selectedYear}`),
            getIndexedDBCache(`anchor_cache_serv_y${selectedYear}`),
            getIndexedDBCache(`anchor_cache_month_y${selectedYear}`),
            getIndexedDBCache(`anchor_cache_event_y${selectedYear}`),
            getIndexedDBCache(`anchor_cache_meet_y${selectedYear}`),
            getIndexedDBCache(`anchor_cache_press_y${selectedYear}`)
          ]);

          if (active) {
            if (cachedProj) setProjects(migrateProgramIds(JSON.parse(cachedProj)));
            else setProjects([]);
            if (cachedAgr) setAgreements(JSON.parse(cachedAgr));
            else setAgreements([]);
            if (cachedUnifiedCert) setUnifiedCertificates(JSON.parse(cachedUnifiedCert));
            else setUnifiedCertificates([]);
            if (cachedScholarships) setScholarships(JSON.parse(cachedScholarships));
            else setScholarships([]);
            if (cachedEnv) setEnvData(JSON.parse(cachedEnv));
            else setEnvData([]);
            if (cachedEquip) setEquipData(JSON.parse(cachedEquip));
            else setEquipData([]);
            if (cachedServ) setServiceData(JSON.parse(cachedServ));
            else setServiceData([]);
            if (cachedMonth) setMonthlySchedules(JSON.parse(cachedMonth));
            else setMonthlySchedules([]);
            if (cachedEvent) setEventSchedules(JSON.parse(cachedEvent));
            else setEventSchedules([]);
            if (cachedMeet) setMeetingSchedules(JSON.parse(cachedMeet));
            else setMeetingSchedules([]);
            if (cachedPress) setPressReleases(JSON.parse(cachedPress));
            else setPressReleases([]);

            if (cachedProj || cachedMonth) {
              setIsDbLoaded(true);
            } else {
              setIsDbLoaded(false);
            }
          }
        } catch (cacheErr) {
          console.error("IndexedDB 선제 캐시 로드 중 실패:", cacheErr);
        }
        // 0-0. Supabase schedule_meetings 및 schedule_events 테이블 연차(year) 과거 데이터 자가 보정 (일회성 자가 치료)
        (async () => {
          try {
            // 1) 회의록 연도 정합성 보정
            const { data: dbMeets } = await fetchScheduleMeetingsForYearRepair();
            if (dbMeets && dbMeets.length > 0) {
              for (const m of dbMeets) {
                const correctYear = getCalculatedYearFromDate(m.datetime ? m.datetime.substring(0, 10) : null, m.year);
                if (Number(m.year) !== correctYear) {
                  await updateScheduleMeetingYear(m.id, correctYear);
                  console.log(`[DB보정] 회의록 id ${m.id}의 연도를 ${m.year} -> ${correctYear}로 자가 보정 완료`);
                }
              }
            }
            // 2) 행사 연도 정합성 보정
            const { data: dbEvents } = await fetchScheduleEventsForYearRepair();
            if (dbEvents && dbEvents.length > 0) {
              for (const e of dbEvents) {
                const correctYear = getCalculatedYearFromDate(e.datetime ? e.datetime.substring(0, 10) : null, e.year);
                if (Number(e.year) !== correctYear) {
                  await updateScheduleEventYear(e.id, correctYear);
                  console.log(`[DB보정] 행사 id ${e.id}의 연도를 ${e.year} -> ${correctYear}로 자가 보정 완료`);
                }
              }
            }
          } catch (err) {
            console.error("DB 연차 정합성 자가 보정 중 실패:", err);
          }
        })();

        // 0-0. 원격 DB 040 고도화 컬럼 실존 여부 조용히 선제 노크 (콘솔 400 에러 원천 차단 목적, Promise.all 병렬화)
        try {
          const [chkServRes, chkEnvRes, chkEquipRes] = await probeProcurementAdvancedColumns();
          if (!active) return;
          window.__HAS_NO_ADVANCED_SERVICES_COLUMNS__ = !!chkServRes.error;
          window.__HAS_NO_ADVANCED_ENV_COLUMNS__ = !!chkEnvRes.error;
          window.__HAS_NO_ADVANCED_EQUIP_COLUMNS__ = !!chkEquipRes.error;
        } catch {
          if (!active) return;
          window.__HAS_NO_ADVANCED_SERVICES_COLUMNS__ = true;
          window.__HAS_NO_ADVANCED_ENV_COLUMNS__ = true;
          window.__HAS_NO_ADVANCED_EQUIP_COLUMNS__ = true;
        }

        const targetYearNum = selectedYear === 1 ? 2025 : selectedYear === 2 ? 2026 : selectedYear === 3 ? 2027 : selectedYear === 4 ? 2028 : 2029;
        const startDateStr = `${targetYearNum}-03-01T00:00:00+09:00`;
        const endDateStr = `${targetYearNum + 1}-03-01T00:00:00+09:00`;

        // 💡 [속도 극대화] 12개 테이블을 Promise.all을 통해 단 1회의 병렬 쿼리로 동시에 로딩합니다.
        const [
          projRes,
          agrRes,
          certRes,
          schRes,
          envRes,
          equipRes,
          servRes,
          monthRes,
          eventRes,
          meetRes,
          pressRes,
          execRes
        ] = await fetchDashboardSources(selectedYear, startDateStr, endDateStr);

        if (!active) return;

        // 💡 [동기화] Supabase DB의 정산 집행 실적 테이블을 로컬 스토리지에 동기화하여 대시보드 메인 화면에 즉시 롤업되도록 처리
        if (execRes && execRes.data) {
          localStorage.setItem(`budget_exec_records_${selectedYear}`, JSON.stringify(execRes.data));
        }

        // 💡 [인증/세션 만료 예방 안전장치] API 요청 결과 401(Unauthorized)이나 토큰 만료 에러가 감지되면 사용자에게 알리고 자동으로 재로그인을 진행시킵니다.
        const authErrors = [
          projRes?.error, agrRes?.error, certRes?.error, schRes?.error,
          envRes?.error, equipRes?.error, servRes?.error, monthRes?.error,
          eventRes?.error, meetRes?.error, pressRes?.error, execRes?.error
        ].filter(err => {
          const status = err ? (err as LegacyAppRecord).status : null;
          const code = err ? String(err.code || "") : "";
          const msg = err ? String(err.message || "") : "";
          return err && (
            status === 401 ||
            status === 403 ||
            code === "PGRST301" ||
            code === "42501" ||
            msg.includes("JWT") ||
            msg.includes("claims") ||
            msg.includes("expired") ||
            msg.includes("permission denied") ||
            msg.includes("security policy")
          );
        });

        if (authErrors.length > 0) {
          console.warn(">>> [Supabase 인증 세션 만료 감지] 자동으로 로그아웃 처리를 유도합니다. <<<", authErrors);
          alert("보안 세션이 만료되었거나 데이터베이스 인증 오류가 발생했습니다. 안전한 데이터 저장을 위해 확인을 누르시면 자동 로그아웃 후 다시 로그인 화면으로 이동합니다.");
          onSessionExpired();
          return;
        }

        // 1. Projects 복구
        const projData = projRes.data;

        if (projData && projData.data) {
          // [성과 동기화] 원격 DB 데이터 로드 시점에도 mockData.js의 최신 KPI 구조(C-1~C-6 등)가 강제 유지되도록 동기화합니다.
          // [ID 마이그레이션] DB에서 읽어온 데이터 내의 프로그램 ID들을 5단계 위계 규정에 맞게 마이그레이션 적용합니다.
          const dbProjData = migrateProgramIds(projData.data as unknown as LegacyAppRecord[]);
          const multiYearInitialData = migrateProgramIds(formatDataToMultiYear(initialProjectsData));

          // 💡 [병합 수정] Supabase에서 로드한 데이터를 최신 실증 데이터 템플릿과 머지하여 데이터 유실을 방지합니다.
          const mergedProjData = mergeProjectsWithInitial(dbProjData, multiYearInitialData);

          // 💡 [승인대기 변경신청 데이터 실시간 오버레이 합성]
          // 일반 연구원(실무진)이 기획 변경 신청을 완료하여 '승인대기' 상태인 요청 정보가 존재하는 경우,
          // 새로고침 시 이 변경 기획 데이터(changes.after)를 세부 프로그램에 오버레이 덮어씌워 렌더링을 유지시킵니다.
          try {
            const { data: pendReqs } = await fetchPendingVersionRequests(selectedYear);

            if (pendReqs && pendReqs.length > 0) {
              mergedProjData.forEach((strat: LegacyAppRecord) => {
                if (strat.units && Array.isArray(strat.units)) {
                  strat.units.forEach((unit: LegacyAppRecord) => {
                    if (unit.programs && Array.isArray(unit.programs)) {
                      unit.programs.forEach((prog: LegacyAppRecord) => {
                        const req = pendReqs.find(r => r.program_id === prog.id);
                        const changes = req?.changes as LegacyAppRecord | null;
                        if (changes?.after) {
                          const after = changes.after as LegacyAppRecord;

                          // P기획 및 수동 수치 오버레이 주입
                          if (after.timeline !== undefined) prog.timeline = after.timeline;
                          if (after.targetAudience !== undefined) prog.targetAudience = after.targetAudience;
                          if (after.coopDept !== undefined) prog.coopDept = after.coopDept;
                          if (after.frequency !== undefined) prog.frequency = after.frequency;
                          if (after.target_participants !== undefined) prog.target_participants = after.target_participants;
                          if (after.target_developments !== undefined) prog.target_developments = after.target_developments;
                          if (after.target_etc !== undefined) prog.target_etc = after.target_etc;
                          if (after.target_participants_unit !== undefined) prog.target_participants_unit = after.target_participants_unit;
                          if (after.target_developments_unit !== undefined) prog.target_developments_unit = after.target_developments_unit;
                          if (after.target_etc_unit !== undefined) prog.target_etc_unit = after.target_etc_unit;
                          if (after.target_participants_name !== undefined) prog.target_participants_name = after.target_participants_name;
                          if (after.target_developments_name !== undefined) prog.target_developments_name = after.target_developments_name;
                          if (after.target_etc_name !== undefined) prog.target_etc_name = after.target_etc_name;
                          if (after.kpi_type !== undefined) prog.kpi_type = after.kpi_type;
                          if (after.kpi_link !== undefined) prog.kpi_link = after.kpi_link;

                          // 연차별 예산 재원 및 비목 상세 덮어쓰기 오버레이
                          if (after.years && after.years[selectedYear]) {
                            const ay = after.years[selectedYear];
                            if (!prog.years) prog.years = {};
                            if (!prog.years[selectedYear]) prog.years[selectedYear] = {};
                            const py = prog.years[selectedYear];

                            if (ay.budget_national !== undefined) py.budget_national = ay.budget_national;
                            if (ay.budget_city !== undefined) py.budget_city = ay.budget_city;
                            if (ay.budget_external !== undefined) py.budget_external = ay.budget_external;
                            if (ay.budget_carry_national !== undefined) py.budget_carry_national = ay.budget_carry_national;
                            if (ay.budget_carry_city !== undefined) py.budget_carry_city = ay.budget_carry_city;
                            if (ay.budget_carry_external !== undefined) py.budget_carry_external = ay.budget_carry_external;

                            py.budget_main = (py.budget_national || 0) + (py.budget_city || 0);
                            if (selectedYear !== 1) {
                              py.budget_carry = (py.budget_carry_national || 0) + (py.budget_carry_city || 0);
                            }

                            if (ay.budget_categories) py.budget_categories = JSON.parse(JSON.stringify(ay.budget_categories));
                          }
                        }
                      });
                    }
                  });
                }
              });

              // 💡 승인대기 정보 적용 후 비목과 총합 재롤업 집계
              mergedProjData.forEach((strategy: LegacyAppRecord) => {
                if (strategy.units && Array.isArray(strategy.units)) {
                  strategy.units.forEach((unit: LegacyAppRecord) => {
                    const categorySums: Record<string, Record<number, LegacyAppRecord>> = {
                      "인건비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "장학금": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "교육∙연구 프로그램 개발∙운영비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "교육∙연구 환경개선비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "실험∙실습장비 및 기자재 구입∙운영비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "지역 연계∙협업 지원비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "기업 지원∙협력 활동비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "성과 활용∙확산 지원비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "그 밖의 사업운영경비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } },
                      "간접비": { 1: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 2: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 3: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 4: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }, 5: { main: 0, carry: 0, spent_main: 0, spent_carry: 0 } }
                    };

                    [1, 2, 3, 4, 5].forEach((yr) => {
                      if (unit.programs && Array.isArray(unit.programs)) {
                        unit.programs.forEach((prog: LegacyAppRecord) => {
                          const py = prog.years?.[yr] || {};
                          const progTotalMain = py.budget_main || 0;
                          const progTotalCarry = py.budget_carry || 0;
                          const progTotalSpent = py.spent_main || 0;
                          const progTotalSpentCarry = py.spent_carry || 0;

                          let allocatedMain = 0;
                          let allocatedCarry = 0;
                          let allocatedSpent = 0;
                          let allocatedSpentCarry = 0;

                          if (py.budget_categories && Array.isArray(py.budget_categories)) {
                            py.budget_categories.forEach((catItem: LegacyAppRecord) => {
                              const catName = catItem.category;
                              if (catName && categorySums[catName] && catName !== "교육∙연구 프로그램 개발∙운영비") {
                                const mainVal = parseInt(String(catItem.budget || "0").replace(/,/g, ""), 10) || 0;
                                const carryVal = parseInt(String(catItem.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                                const spentVal = Math.round(catItem.spent || 0);
                                const spentCarryVal = Math.round(catItem.spent_carry || 0);

                                categorySums[catName][yr].main += mainVal;
                                categorySums[catName][yr].carry += carryVal;
                                categorySums[catName][yr].spent_main += spentVal;
                                categorySums[catName][yr].spent_carry += spentCarryVal;

                                allocatedMain += mainVal;
                                allocatedCarry += carryVal;
                                allocatedSpent += spentVal;
                                allocatedSpentCarry += spentCarryVal;
                              }
                            });
                          }

                          const remainMain = Math.max(0, progTotalMain - allocatedMain);
                          const remainCarry = Math.max(0, progTotalCarry - allocatedCarry);
                          const remainSpent = Math.max(0, progTotalSpent - allocatedSpent);
                          const remainSpentCarry = Math.max(0, progTotalSpentCarry - allocatedSpentCarry);

                          categorySums["교육∙연구 프로그램 개발∙운영비"][yr].main += remainMain;
                          categorySums["교육∙연구 프로그램 개발∙운영비"][yr].carry += remainCarry;
                          categorySums["교육∙연구 프로그램 개발∙운영비"][yr].spent_main += remainSpent;
                          categorySums["교육∙연구 프로그램 개발∙운영비"][yr].spent_carry += remainSpentCarry;
                        });
                      }
                    });

                    if (!unit.budgetDetails) unit.budgetDetails = {};
                    Object.keys(categorySums).forEach((catName) => {
                      // 💡 [TypeError 방어] unit.budgetDetails[catName] 객체 및 years 속성이 유실되어 있다면 빈 객체로 확실하게 방어하여 'setting 1' 크래시를 예방합니다.
                      if (!unit.budgetDetails[catName]) {
                        unit.budgetDetails[catName] = { years: {} };
                      }
                      if (!unit.budgetDetails[catName].years) {
                        unit.budgetDetails[catName].years = {};
                      }
                      [1, 2, 3, 4, 5].forEach((yr) => {
                        const mainVal = categorySums[catName][yr].main;

                        // 💡 [단위과제 하위 프로그램들의 총합 비율 계산]
                        let totalProgMain = 0;
                        let totalProgNational = 0;
                        let totalProgSpent = 0;
                        let totalProgSpentNational = 0;

                        if (unit.programs && Array.isArray(unit.programs)) {
                          unit.programs.forEach((prog: LegacyAppRecord) => {
                            const py = prog.years?.[yr] || {};
                            totalProgMain += py.budget_main || 0;
                            totalProgNational += py.budget_national || 0;
                            totalProgSpent += py.spent_main || 0;
                            totalProgSpentNational += py.spent_national || 0;
                          });
                        }

                        const ratio = totalProgMain > 0 ? totalProgNational / totalProgMain : 0.5;
                        const spentRatio = totalProgSpent > 0 ? totalProgSpentNational / totalProgSpent : ratio;

                        // 💡 [교육용 한글 주석] 로컬 캐시 동화 시 A1나 단위과제 국비 100%, 시비 0원 강제 연산 처리
                        const isNationalOnly = unit.id === "A1나";
                        unit.budgetDetails[catName].years[yr] = {
                          budget_main: mainVal,
                          budget_carry: categorySums[catName][yr].carry,
                          spent_main: categorySums[catName][yr].spent_main,
                          spent_carry: categorySums[catName][yr].spent_carry,
                          budget_national: isNationalOnly ? mainVal : Math.round(mainVal * ratio),
                          budget_city: isNationalOnly ? 0 : mainVal - Math.round(mainVal * ratio),
                          budget_external: 0,
                          spent_national: isNationalOnly ? categorySums[catName][yr].spent_main : Math.round(categorySums[catName][yr].spent_main * spentRatio),
                          spent_city: isNationalOnly ? 0 : categorySums[catName][yr].spent_main - Math.round(categorySums[catName][yr].spent_main * spentRatio),
                          spent_external: 0
                        };
                      });
                    });

                    [1, 2, 3, 4, 5].forEach((yr) => {
                      const uYear = unit.years[yr] || {};
                      const budgetDetailValues = Object.values(unit.budgetDetails as Record<string, LegacyAppRecord>);
                      uYear.spent_main = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_main || 0), 0);
                      uYear.spent_carry = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_carry || 0), 0);
                      uYear.budget_main = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_main || 0), 0);
                      uYear.budget_carry = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_carry || 0), 0);

                      // 💡 [교육용 한글 주석] A1나 단위과제는 국비 100%, 시비 0원 롤업 처리
                      if (unit.id === "A1나") {
                        uYear.budget_national = uYear.budget_main;
                        uYear.budget_city = 0;
                        uYear.budget_external = 0;
                        uYear.spent_national = uYear.spent_main;
                        uYear.spent_city = 0;
                        uYear.spent_external = 0;
                      } else {
                        uYear.budget_national = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_national || 0), 0);
                        uYear.budget_city = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_city || 0), 0);
                        uYear.budget_external = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.budget_external || 0), 0);
                        uYear.spent_national = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_national || 0), 0);
                        uYear.spent_city = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_city || 0), 0);
                        uYear.spent_external = budgetDetailValues.reduce((sum: number, b: LegacyAppRecord) => sum + (b.years?.[yr]?.spent_external || 0), 0);
                      }
                    });
                  });
                }
              });
            }
          } catch (e) {
            console.error("승인대기 오버레이 처리 실패:", e);
          }

          mergedProjData.forEach((strategy) => {
            if (strategy.units && Array.isArray(strategy.units)) {
              strategy.units.forEach((unit) => {
                const sourceUnit = multiYearInitialData
                  ?.flatMap(s => s.units)
                  ?.find(u => u.id === unit.id);
                if (sourceUnit) {
                  unit.kpis = sourceUnit.kpis || [];
                }
              });
            }
          });
          setProjects(mergedProjData);
          // 💡 [안전 가드] 원격 Supabase DB로부터 최신 프로젝트 데이터를 성공적으로 가져왔으므로, 레퍼런스(fetchedProjectsRef.current)에 동기화해 둡니다.
          fetchedProjectsRef.current = JSON.stringify(getCleanProjectsForStorage(mergedProjData));

          safeSetLocalStorage(`anchor_cache_proj_y${selectedYear}_v56`, JSON.stringify(getCleanProjectsForStorage(mergedProjData)), selectedYear);
          if (currentUser && currentRole?.id !== "GUEST") {
            await upsertProjectData(selectedYear, mergedProjData);
          }
        } else {
          const multiYearInitialData = migrateProgramIds(formatDataToMultiYear(initialProjectsData));
          setProjects(multiYearInitialData);
          // 💡 [안전 가드] 원격 DB에 데이터가 없어 최초 초기 템플릿을 사용하는 경우에도 레퍼런스에 동기화해 둡니다.
          fetchedProjectsRef.current = JSON.stringify(getCleanProjectsForStorage(multiYearInitialData));

          safeSetLocalStorage(`anchor_cache_proj_y${selectedYear}_v56`, JSON.stringify(getCleanProjectsForStorage(multiYearInitialData)), selectedYear);
          if (currentUser && currentRole?.id !== "GUEST") {
            await upsertProjectData(selectedYear, multiYearInitialData);
          }
        }

        // 2. Agreements 복구 (전체 연차 데이터를 한 번에 가져와 메모리에 유지)
        const agrData = agrRes.data;
        const agrErr = agrRes.error;

        if (agrErr) {
          console.error("Failed to fetch agreements:", agrErr);
        } else {
          setIsAgreementsLoaded(true); // 💡 로드 성공 상태 설정
          if (agrData && agrData.length > 0) {
            const formatted = agrData.map(a => ({
              id: Number(a.id),
              year: a.year,
              date: a.date,
              center: a.center,
              organizations: a.organizations,
              subjectUniversity: a.subject_univ,
              subjectOrganization: a.subject_org || "",
              unitId: a.unit_id,
              contents: a.contents,
              fileName: a.file_name,
              fileData: a.file_data,
              agreementType: a.agreement_type || "-"
            }));
            setAgreements(formatted);
            fetchedAgreementsRef.current = JSON.stringify(formatted); // 🛡️ 원본 저장
            isAgreementsFetchedRef.current = true; // DB 복구 성공 락 해제
            try {
              const clean = formatted.map(item => {
                const isUrl = item.fileData && (item.fileData.startsWith("http://") || item.fileData.startsWith("https://"));
                const cleanFileData = isUrl ? item.fileData : null;
                return { ...item, fileData: cleanFileData };
              });
              safeSetLocalStorage("anchor_cache_agreements_all", JSON.stringify(clean), selectedYear);
            } catch (e) {
              console.error("Failed to save agreements cache:", e);
            }
          } else {
            setAgreements([]);
            fetchedAgreementsRef.current = JSON.stringify([]); // 🛡️ 원본 저장
            isAgreementsFetchedRef.current = true; // DB 복구 성공 락 해제 (빈 데이터)
          }
        }

        // 2-2. Unified Certificates 복구 (전체 연차 데이터를 한 번에 가져와 메모리에 유지)
        const unifiedCertData = certRes.data;
        const unifiedCertErr = certRes.error;

        if (unifiedCertErr) {
          console.error("Failed to fetch unified certificates:", unifiedCertErr);
        } else {
          setIsUnifiedCertificatesLoaded(true); // 💡 로드 성공 상태 설정
          if (unifiedCertData && unifiedCertData.length > 0) {
            const formatted = unifiedCertData.map(c => ({
              id: Number(c.id),
              year: c.year,
              managerDept: c.manager_dept,
              managerName: c.manager_name,
              certNo: c.cert_no,
              certType: c.cert_type,
              awardType: c.award_type,
              note: c.note,
              teamName: c.team_name,
              recipientName: c.recipient_name,
              studentId: c.student_id,
              birthDate: c.birth_date,
              phone: c.phone,
              issueDate: c.issue_date,
              projectGroup: c.project_group,
              issuer: c.issuer,
              content: c.content,
              fileName: c.file_name,
              fileData: c.file_data
            }));
            setUnifiedCertificates(formatted);
            fetchedUnifiedCertificatesRef.current = JSON.stringify(formatted); // 🛡️ 원본 저장
            try {
              const clean = formatted.map(item => {
                const isUrl = item.fileData && (item.fileData.startsWith("http://") || item.fileData.startsWith("https://"));
                const cleanFileData = isUrl ? item.fileData : null;
                return { ...item, fileData: cleanFileData };
              });
              safeSetLocalStorage("anchor_cache_unified_certificates_all", JSON.stringify(clean), selectedYear);
            } catch (e) {
              console.error("Failed to save unified certificates cache:", e);
            }
          } else {
            setUnifiedCertificates([]);
            fetchedUnifiedCertificatesRef.current = JSON.stringify([]); // 🛡️ 원본 저장
          }
        }

        // 2-3. Scholarships 복구
        const scholarshipData = schRes.data;
        const scholarshipError = schRes.error;

        if (scholarshipError) {
          console.error("Failed to fetch scholarships:", scholarshipError);
        } else {
          setIsScholarshipsLoaded(true); // 💡 로드 성공 상태 설정
          if (scholarshipData && scholarshipData.length > 0) {
            const formatted = scholarshipData.map(c => ({
              id: Number(c.id) || Date.now() + Math.random(),
              year: c.year,
              dept: c.dept,
              major: c.major,
              course: c.course,
              studentId: c.student_id,
              name: c.name,
              residentId: c.resident_id,
              grade: c.grade,
              enrollStatus: c.enroll_status,
              regStatus: c.reg_status,
              amount: c.amount,
              bankName: c.bank_name,
              accountNum: c.account_num,
              accountHolder: c.account_holder,
              approvalDate: c.approval_date
            }));
            setScholarships(formatted);
            fetchedScholarshipsRef.current = JSON.stringify(formatted); // 🛡️ 원본 저장
            try {
              const clean = formatted.map(item => ({ ...item }));
              safeSetLocalStorage("anchor_cache_scholarships_all", JSON.stringify(clean), selectedYear);
            } catch (e) {
              console.error("Failed to save scholarships cache:", e);
            }
          } else {
            setScholarships([]);
            fetchedScholarshipsRef.current = JSON.stringify([]); // 🛡️ 원본 저장
          }
        }

        // 3. Procurement (환경개선, 기자재, 주요용역) 복구
        const pEnv = envRes.data;
        const pEnvError = envRes.error;
        const pEquip = equipRes.data;
        const pEquipError = equipRes.error;
        const pServ = servRes.data;
        const pServError = servRes.error;

        if (pEnvError) {
          console.error("Supabase procurement_env fetch error (using fallback cache):", pEnvError);
          const cachedEnv = localStorage.getItem(`anchor_cache_env_y${selectedYear}`);
          if (cachedEnv) {
            try {
              setEnvData(JSON.parse(cachedEnv));
            } catch (e) {
              console.error("Failed to parse cached env data:", e);
            }
          }
        } else if (pEnv && pEnv.length > 0) {
          const formatted = pEnv.map(x => ({
            ...x,
            id: Number(x.id),
            budgetPlan: Number(x.budget_plan),
            budgetSpent: Number(x.budget_spent),
            deptName: x.dept_name || "",
            divisionName: x.division_name || "",
            dateP: x.date_p || "",
            dateA: x.date_a || "",
            dateB: x.date_b || "",
            datePr: x.date_pr || "",
            dateI: x.date_i || "",
            docPlan: x.doc_plan || "",
            docPurchase: x.doc_purchase || "",
            docBid: x.doc_bid || "",
            docPlanFileName: x.doc_plan_file_name || "",
            docPurchaseFileName: x.doc_purchase_file_name || "",
            docBidFileName: x.doc_bid_file_name || "",
            docPlanFileSize: Number(x.doc_plan_file_size) || 0,
            docPurchaseFileSize: Number(x.doc_purchase_file_size) || 0,
            docBidFileSize: Number(x.doc_bid_file_size) || 0,
            docPlanFileUrl: x.doc_plan_file_url || "",
            docPurchaseFileUrl: x.doc_purchase_file_url || "",
            docBidFileUrl: x.doc_bid_file_url || "",
            aiProposalData: x.ai_proposal_data || null,
            aiPurchaseData: x.ai_purchase_data || null,
            aiBidData: x.ai_bid_data || null,
            relatedDocs: x.related_docs || ""
          }));
          setEnvData(formatted);
          fetchedEnvDataRef.current = JSON.stringify(formatted);
          safeSetLocalStorage(`anchor_cache_env_y${selectedYear}`, JSON.stringify(formatted), selectedYear);
        } else {
          // 💡 [선명 반응 최적화] 데이터가 0건이라도 캐시를 지우지 않고 빈 배열 "[]"로 남겨두어, 다음 렌더링 시 깜빡임 없이 즉각 대처하도록 개선합니다.
          setEnvData([]);
          fetchedEnvDataRef.current = "[]";
          safeSetLocalStorage(`anchor_cache_env_y${selectedYear}`, "[]", selectedYear);
        }

        if (pEquipError) {
          console.error("Supabase procurement_equipment fetch error (using fallback cache):", pEquipError);
          const cachedEquip = localStorage.getItem(`anchor_cache_equip_y${selectedYear}`);
          if (cachedEquip) {
            try {
              setEquipData(JSON.parse(cachedEquip));
            } catch (e) {
              console.error("Failed to parse cached equip data:", e);
            }
          }
        } else if (pEquip && pEquip.length > 0) {
          const formatted = pEquip.map(x => {
            const docParts = (x.related_docs || "").split(",").map(d => d.trim()).filter(Boolean);
            return {
              id: Number(x.id),
              year: Number(x.year),
              unit: x.unit || "A1",
              seq: Number(x.seq) || 1,
              deptName: x.dept_name || "",
              divisionName: x.division_name || "",
              itemName: x.item_name || "",
              unitPrice: Number(x.unit_price) || 0,
              quantity: Number(x.quantity) || 1,
              spec: x.spec || "",
              itemUnit: x.item_unit || "대",
              description: x.description || "",
              operation: x.operation || "교과목(정규)",
              password: x.password || "1234",
              relatedDocs: x.related_docs || "", // 관련문서 필드 로드 매핑
              docPlan: x.doc_plan || docParts[0] || "", // 기획문서 결재번호 (호환 처리)
              docPurchase: x.doc_purchase || docParts[1] || "", // 구매문서 결재번호 (호환 처리)
              docBid: x.doc_bid || docParts[2] || "", // 입찰문서 결재번호 (호환 처리)
              dateP: x.date_p || "",
              dateA: x.date_a || "",
              dateB: x.date_b || "",
              datePr: x.date_pr || "",
              dateI: x.date_i || "",
              barcode: x.barcode || "",
              asset_number: x.asset_number || ""
            };
          });
          setEquipData(formatted);
          fetchedEquipDataRef.current = JSON.stringify(formatted);
          safeSetLocalStorage(`anchor_cache_equip_y${selectedYear}`, JSON.stringify(formatted), selectedYear);
        } else {
          // 💡 [선명 반응 최적화] 데이터가 0건이라도 캐시를 지우지 않고 빈 배열 "[]"로 남겨두어, 다음 렌더링 시 깜빡임 없이 즉각 대처하도록 개선합니다.
          setEquipData([]);
          fetchedEquipDataRef.current = "[]";
          safeSetLocalStorage(`anchor_cache_equip_y${selectedYear}`, "[]", selectedYear);
        }
        if (pServError) {
          console.error("Supabase procurement_services fetch error (using fallback cache):", pServError);
          const cachedServ = localStorage.getItem(`anchor_cache_serv_y${selectedYear}`);
          if (cachedServ) {
            try {
              const parsed = JSON.parse(cachedServ);
              // 자가 치유(Self-healing): 이전 스키마(스네이크케이스 등) 캐시 데이터 호환성 보장
              const healed = parsed.map((x: LegacyAppRecord) => ({
                ...x,
                id: Number(x.id || Date.now()),
                year: Number(x.year || selectedYear),
                unit: x.unit || "A1",
                programId: x.programId || x.program_id || "",
                programName: x.programName || x.program_name || "",
                deptName: x.deptName || x.dept_name || "",
                divisionName: x.divisionName || x.division_name || "",
                password: x.password || "1234",
                title: x.title || "",
                purpose: x.purpose || "",
                providerQual: x.providerQual || x.provider_qual || "",
                step: Number(x.step) || 1,
                budgetPlan: Number(x.budgetPlan || x.budget_plan || 0),
                budgetSpent: Number(x.budgetSpent || x.budget_spent || 0),
                opResult: x.opResult || x.op_result || "",

                // 7대 날짜 복원
                datePp: x.datePp || x.date_pp || "",
                dateRfo: x.dateRfo || x.date_rfo || "",
                dateB: x.dateB || x.date_b || "",
                dateEs: x.dateEs || x.date_es || "",
                dateC: x.dateC || x.date_c || "",
                dateE: x.dateE || x.date_e || "",
                dateI: x.dateI || x.date_i || "",

                // 3종 문서
                docPlan: x.docPlan || x.doc_plan || "",
                docPurchase: x.docPurchase || x.doc_purchase || "",
                docBid: x.docBid || x.doc_bid || "",
                docPlanFileName: x.docPlanFileName || x.doc_plan_file_name || "",
                docPurchaseFileName: x.docPurchaseFileName || x.doc_purchase_file_name || "",
                docBidFileName: x.docBidFileName || x.doc_bid_file_name || "",
                docPlanFileSize: Number(x.docPlanFileSize || x.doc_plan_file_size || 0),
                docPurchaseFileSize: Number(x.docPurchaseFileSize || x.doc_purchase_file_size || 0),
                docBidFileSize: Number(x.docBidFileSize || x.doc_bid_file_size || 0),
                docPlanFileUrl: x.docPlanFileUrl || x.doc_plan_file_url || "",
                docPurchaseFileUrl: x.docPurchaseFileUrl || x.doc_purchase_file_url || "",
                docBidFileUrl: x.docBidFileUrl || "",
                aiProposalData: x.aiProposalData || x.ai_proposal_data || null,
                aiPurchaseData: x.aiPurchaseData || x.ai_purchase_data || null,
                aiBidData: x.aiBidData || x.ai_bid_data || null
              }));
              setServiceData(healed);
            } catch (e) {
              console.error("Failed to parse cached services data:", e);
            }
          }
        } else if (pServ && pServ.length > 0) {
          const formatted = pServ.map(x => {
            const docParts = (x.related_docs || "").split(",").map(d => d.trim()).filter(Boolean);
            return {
              ...x,
              id: Number(x.id),
              year: Number(x.year),
              unit: x.unit || "A1",
              programId: x.program_id || "",
              programName: x.program_name || "",
              deptName: x.dept_name || "",
              divisionName: x.division_name || "",
              password: x.password || "1234",
              relatedDocs: x.related_docs || "",
              budgetPlan: Number(x.budget_plan),
              budgetSpent: Number(x.budget_spent),
              step: Number(x.step) || 1,
              opResult: x.op_result || "",
              // 7대 절차 날짜 맵핑
              datePp: x.date_pp || "",
              dateRfo: x.date_rfo || "",
              dateB: x.date_b || "",
              dateEs: x.date_es || "",
              dateC: x.date_c || "",
              dateE: x.date_e || "",
              dateI: x.date_i || "",
              // 3종 관련 문서 및 AI 데이터 맵핑
              docPlan: x.doc_plan || docParts[0] || "",
              docPurchase: x.doc_purchase || docParts[1] || "",
              docBid: x.doc_bid || docParts[2] || "",
              docPlanFileName: x.doc_plan_file_name || "",
              docPurchaseFileName: x.doc_purchase_file_name || "",
              docBidFileName: x.doc_bid_file_name || "",
              docPlanFileSize: Number(x.doc_plan_file_size) || 0,
              docPurchaseFileSize: Number(x.doc_purchase_file_size) || 0,
              docBidFileSize: Number(x.doc_bid_file_size) || 0,
              docPlanFileUrl: x.doc_plan_file_url || "",
              docPurchaseFileUrl: x.doc_purchase_file_url || "",
              docBidFileUrl: x.doc_bid_file_url || "",
              aiProposalData: x.ai_proposal_data || null,
              aiPurchaseData: x.ai_purchase_data || null,
              aiBidData: x.ai_bid_data || null
            };
          });
          setServiceData(formatted);
          fetchedServiceDataRef.current = JSON.stringify(formatted);
          safeSetLocalStorage(`anchor_cache_serv_y${selectedYear}`, JSON.stringify(formatted), selectedYear);
        } else {
          // 💡 [선명 반응 최적화] 데이터가 0건이라도 캐시를 지우지 않고 빈 배열 "[]"로 남겨두어, 다음 렌더링 시 깜빡임 없이 즉각 대처하도록 개선합니다.
          setServiceData([]);
          fetchedServiceDataRef.current = "[]";
          safeSetLocalStorage(`anchor_cache_serv_y${selectedYear}`, "[]", selectedYear);
        }

        // 4. Schedule (월간일정, 행사일정, 회의일정) 복구
        const sMonth = monthRes.data;
        const sEvent = eventRes.data;
        const sMeet = meetRes.data;

        // 💡 [클린업 자가치유] 기존 DB에 잘못 저장된 연동 행사/회의 데이터는 깨끗하게 영구 삭제처리하여 DB 중복을 자가치유합니다.
        if (sMonth && sMonth.length > 0) {
          const dirtyLinkedItems = sMonth.filter(x => x.event_id !== null || x.meeting_id !== null);
          if (dirtyLinkedItems.length > 0) {
            const dirtyIds = dirtyLinkedItems.map(d => d.id);
            await deleteMonthlySchedulesByIds(dirtyIds);
            console.log(`[Self-Healing] Cleaned up ${dirtyIds.length} duplicate/redundant sync records from schedule_monthly.`);
          }
        }

        if (!active) return;

        const formattedEvents: LegacyAppRecord[] = (sEvent || []).map(x => ({
          id: Number(x.id),
          year: Number(x.year),
          month: Number(x.month),
          title: x.title,
          department: x.department || "",
          location: x.location || "",
          attendeesInternal: x.attendees_internal || "",
          attendeesExternal: x.attendees_external || "",
          program: x.program || "",
          purpose: x.purpose || "",
          result: x.result || "",
          datetime: x.datetime
        }));

        const formattedMeetings: LegacyAppRecord[] = (sMeet || []).map(x => ({
          ...x,
          id: Number(x.id),
          year: Number(x.year),
          month: Number(x.month),
          attendeesInternal: x.attendees_internal || "",
          attendeesExternal: x.attendees_external || "",
          audioUrl: x.audio_url || "",
          pdfUrl: x.pdf_url || ""
        }));

        let formattedMonthly: LegacyAppRecord[] = (sMonth || [])
          .filter(x => x.event_id === null && x.meeting_id === null) // 순수 일반 일정만 로드
          .map(x => ({
            id: Number(x.id),
            year: x.year,
            title: x.title,
            type: x.type,
            dept: x.dept,
            startAt: x.start_at,
            endAt: x.end_at,
            location: x.location,
            isTask: x.is_task || false,
            isDeadline: x.is_deadline || false,
            completed: x.completed || false,
            attendees: x.attendees || "",
            eventId: null,
            meetingId: null
          }));

        // 💡 초도 로드 연동 병합 (주요 행사)
        formattedEvents.forEach(evt => {
          const hasLinked = formattedMonthly.some(m => m.eventId === evt.id);
          if (!hasLinked) {
            const startPart = evt.datetime ? evt.datetime.split(" ~ ")[0].trim() : "";
            let dateStr = startPart.substring(0, 10);
            if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              dateStr = `${evt.year}-${String(evt.month).padStart(2, "0")}-01`;
            }
            const endPart = evt.datetime && evt.datetime.includes(" ~ ") ? evt.datetime.split(" ~ ")[1].trim() : startPart;
            let endDateStr = endPart.substring(0, 10);
            if (!endDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              endDateStr = dateStr;
            }

            formattedMonthly.push({
              id: `mevt-init-${Date.now()}-${evt.id}`,
              eventId: evt.id,
              year: evt.year,
              title: `[행사] ${evt.title}`,
              type: "행사",
              dept: evt.department || "사업운영팀",
              startAt: dateStr,
              endAt: endDateStr,
              location: evt.location || "",
              isTask: false,
              isDeadline: false,
              completed: false,
              attendees: evt.attendeesInternal || ""
            });
          }
        });

        // 💡 초도 로드 연동 병합 (회의록)
        formattedMeetings.forEach(meet => {
          const hasLinked = formattedMonthly.some(m => m.meetingId === meet.id);
          if (!hasLinked) {
            const startPart = meet.datetime ? meet.datetime.split(" ~ ")[0].trim() : "";
            let dateStr = startPart.substring(0, 10);
            if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              dateStr = `${meet.year}-${String(meet.month).padStart(2, "0")}-01`;
            }
            const endPart = meet.datetime && meet.datetime.includes(" ~ ") ? meet.datetime.split(" ~ ")[1].trim() : startPart;
            let endDateStr = endPart.substring(0, 10);
            if (!endDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              endDateStr = dateStr;
            }

            const isCommittee = meet.category === "각종 위원회" || meet.category === "committee";
            const prefix = isCommittee ? "[위원회]" : "[회의]";
            const typeVal = isCommittee ? "위원회" : "회의";

            formattedMonthly.push({
              id: `mmeet-init-${Date.now()}-${meet.id}`,
              meetingId: meet.id,
              year: meet.year,
              title: `${prefix} ${meet.title}`,
              type: typeVal,
              dept: isCommittee ? "ECC센터" : "사업운영팀",
              startAt: dateStr,
              endAt: endDateStr,
              location: meet.location || "",
              isTask: false,
              isDeadline: false,
              completed: false,
              attendees: meet.attendeesInternal || ""
            });
          }
        });

        setMonthlySchedules(formattedMonthly);
        fetchedMonthlySchedulesRef.current = JSON.stringify(formattedMonthly);
        safeSetLocalStorage(`anchor_cache_month_y${selectedYear}`, JSON.stringify(formattedMonthly), selectedYear);

        setEventSchedules(formattedEvents);
        fetchedEventSchedulesRef.current = JSON.stringify(formattedEvents);
        safeSetLocalStorage(`anchor_cache_event_y${selectedYear}`, JSON.stringify(formattedEvents), selectedYear);

        setMeetingSchedules(formattedMeetings);
        fetchedMeetingSchedulesRef.current = JSON.stringify(formattedMeetings);
        safeSetLocalStorage(`anchor_cache_meet_y${selectedYear}`, JSON.stringify(formattedMeetings), selectedYear);


        // press_releases 복구 (year 칼럼 매핑 오류와 무관하게 실제 기사 발행일 범위 기준으로 정밀 분리 패치)
        const sPress = pressRes.data;
        const sPressErr = pressRes.error;

        if (sPressErr) {
          console.error("Failed to fetch press releases:", sPressErr);
        } else if (sPress && sPress.length > 0) {
          const formatted = sPress.map(x => ({
            id: Number(x.id),
            year: x.year,
            type: x.type,
            media: x.media,
            title: x.title,
            broadcastDate: x.broadcast_date,
            contentUrl: x.content_url,
            pressContent: x.press_content || ""
          }));
          setPressReleases(formatted);
          fetchedPressReleasesRef.current = JSON.stringify(formatted);
          safeSetLocalStorage(`anchor_cache_press_y${selectedYear}`, JSON.stringify(formatted), selectedYear);
        } else {
          setPressReleases([]);
          fetchedPressReleasesRef.current = "[]";
          localStorage.removeItem(`anchor_cache_press_y${selectedYear}`);
        }

        if (!active) return;
        setIsDbLoaded(true);
        setIsFetchCompleted(true);
        setActiveDataYear(selectedYear); // 💡 패치가 완전히 적용된 연차를 기록하여 동기화 혼선 차단
      } catch (e) {
        if (!active) return;
        console.error("Error loading dashboard data from Supabase:", e);
        setIsDbLoaded(true);
        setIsFetchCompleted(true);
      }
    };

    fetchAllDashboardData();
    return () => {
      active = false;
    };
  // oxlint-disable-next-line react/exhaustive-deps -- selectedYear and currentUser own dashboard loading; role restoration must not start a second full fetch.
  }, [selectedYear, currentUser]);
};
