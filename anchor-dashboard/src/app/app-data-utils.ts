import { YEAR_1_PROGRAMS, Y1_UNIT_META } from "../data/mockData";
import type { LegacyAppRecord, LegacyYearRecord } from "./app-types";
import { NEW_A1GA_SPEC_TITLES, PROGRAM_ID_MIGRATION_MAP, REVERSE_UNIT_MAPPING_Y1 } from "./app-seed-data";

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

// 로컬 캐시 용량을 줄이기 위해 런타임에 재계산 가능한 프로젝트 파생 필드를 제거합니다.
export const getCleanProjectsForStorage = <
  T extends LegacyAppRecord[] | null | undefined,
>(
  rawProjects: T
): T => {
  if (!rawProjects || !Array.isArray(rawProjects)) return rawProjects;
  return rawProjects.map((strat: LegacyAppRecord) => ({
    ...strat,
    units: strat.units?.map((unit: LegacyAppRecord) => {
      const { budgetDetails: _budgetDetails, kpis: _kpis, ...restUnit } = unit;
      return {
        ...restUnit,
        programs: unit.programs?.map((prog: LegacyAppRecord) => {
          const { years, ...restProg } = prog;
          const cleanedYears: Record<string, LegacyAppRecord> = {};
          if (years) {
            Object.keys(years).forEach((yr) => {
              const yearData = years[yr];
              if (yearData) {
                const { budget_categories, ...restYearData } = yearData;
                cleanedYears[yr] = {
                  ...restYearData,
                  budget_categories: budget_categories?.map(
                    (category: LegacyAppRecord) => ({
                      category: category.category,
                      budget: category.budget,
                      budget_carry: category.budget_carry,
                      spent: category.spent,
                      spent_carry: category.spent_carry
                    })
                  )
                };
              }
            });
          }
          return {
            ...restProg,
            years: cleanedYears
          };
        })
      };
    })
  })) as unknown as T;
};

// 담당연구원이 2명일 때 정/부 표기 헬퍼 함수
export const formatAssignee = (assigneeText?: string): string => {
  if (!assigneeText) return "미배정";
  const parts = assigneeText.split(/[,/]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 2) {
    return `${parts[0]}(정), ${parts[1]}(부)`;
  }
  return assigneeText;
};

export const migrateProgramIds = <T extends LegacyAppRecord[] | null | undefined,>(data: T): T => {
  if (!data || !Array.isArray(data)) return data;
  for (const strategy of data) {
    if (strategy.units && Array.isArray(strategy.units)) {
      for (const unit of strategy.units) {
        if (unit.programs && Array.isArray(unit.programs)) {
          for (const prog of unit.programs) {
            // 이미 올바른 신규 명세의 ID와 타이틀이 매핑되어 있는 경우 치환을 스킵
            if (NEW_A1GA_SPEC_TITLES[prog.id] && prog.title === NEW_A1GA_SPEC_TITLES[prog.id]) {
              continue;
            }
            const unitRules = PROGRAM_ID_MIGRATION_MAP[unit.id];
            if (unitRules && unitRules[prog.id]) {
              prog.id = unitRules[prog.id];
            }
          }
        }
      }
    }
  }
  return data;
};

export const getCalculatedYearFromDate = (dateStr: string | null | undefined, fallbackYear: number): number => {
  if (!dateStr) return fallbackYear;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return fallbackYear;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // 1월과 2월은 직전 연도의 회계연도에 속함 (예: 2026년 2월 -> 2025회계연도)
  const fiscalYear = month <= 2 ? year - 1 : year;

  // 2025년: 1차년도, 2026년: 2차년도, ...
  if (fiscalYear === 2025) return 1;
  if (fiscalYear === 2026) return 2;
  if (fiscalYear === 2027) return 3;
  if (fiscalYear === 2028) return 4;
  if (fiscalYear === 2029) return 5;

  return fallbackYear;
};

export const getRealUnitId = (unitId: string, yr: number): string => {
  return yr === 1 ? (REVERSE_UNIT_MAPPING_Y1[unitId] || unitId) : unitId;
};

export const formatToMillionWon = (value?: number | null) => {
  if (value === undefined || value === null || isNaN(value)) return "0.0";
  return (value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// 5개년 연쇄 잔액 이월(Carry Over) 계산 함수
export function recalculateCarryOver(years: LegacyYearRecord | null | undefined) {
  if (!years) return;

  // 1차년도 잔액 -> 2차년도 이월 (현재 차년도이므로 반영)
  if (years[1] && years[2]) {
    const balanceY1 = Math.max(0, ((years[1].budget_main || 0) + (years[1].budget_carry || 0)) - ((years[1].spent_main || 0) + (years[1].spent_carry || 0)));
    years[2].budget_carry = balanceY1;
  }

  // 3, 4, 5차년도는 미래 계획 차년도이므로 이전 차년도 잔액의 이월을 계획 단계에서 배제(0원 세팅)하여
  // 3, 4, 5차년도 총 사업비 예산 계획이 2차년도 본예산 수치와 항상 깨끗이 일치되도록 방어합니다.
  if (years[3]) years[3].budget_carry = 0;
  if (years[4]) years[4].budget_carry = 0;
  if (years[5]) years[5].budget_carry = 0;
}

// 다년도 예산/집행 구조 동적 변환기 (1~5차년도)
export function formatDataToMultiYear(data: LegacyAppRecord[]) {
  return data.map((p) => {
    const newUnits = p.units.map((u: LegacyAppRecord) => {
      // 1. 단위과제 예산 다년도 맵핑
      const unitYears: LegacyYearRecord = {};
      const isA1Na = u.id === "A1나";

      [1, 2, 3, 4, 5].forEach((yr) => {
        if (yr === 2) {
          unitYears[yr] = {
            budget_main: u.budget_2026 || 0,
            spent_main: u.spent_2026 || 0,
            budget_carry: u.budget_2025_carry || 0,
            spent_carry: u.spent_2025_carry || 0
          };
        } else if (yr === 1) {
          if (isA1Na) {
            // A1나 단위과제는 1차년도 예산이 없습니다.
            unitYears[yr] = {
              budget_main: 0,
              spent_main: 0,
              budget_carry: 0,
              spent_carry: 0
            };
          } else {
            // 1차년도 실제 예산 데이터가 Y1_UNIT_META에 정의되어 있다면 이를 우선 사용하고, 없다면 0.9배 및 역산 공식 적용
            const meta = Y1_UNIT_META[u.id];
            let budgetMain, spentMain;
            if (meta) {
              budgetMain = meta.budget;
              spentMain = meta.budget - meta.carry; // 예산에서 이월 잔액(carry)을 차감하여 집행액 역산
            } else {
              budgetMain = Math.round((u.budget_2026 || 0) * 0.9);
              spentMain = Math.max(0, budgetMain - (u.budget_2025_carry || 0));
            }
            unitYears[yr] = {
              budget_main: budgetMain,
              spent_main: spentMain,
              budget_carry: 0,
              spent_carry: 0
            };
          }
        } else {
          // 3차년도 이후 총괄계획은 2차년도와 동일하게 적용 (A1나의 경우 0원)
          unitYears[yr] = {
            budget_main: isA1Na ? 0 : (u.budget_2026 || 0),
            spent_main: 0,
            budget_carry: 0,
            spent_carry: 0
          };
        }
      });
      // 1차년도부터 5차년도까지 이월예산 연쇄 반영
      recalculateCarryOver(unitYears);

      // 2. 세부 프로그램 다년도 맵핑
      // 1차년도용 프로그램 목록 생성
      const y1ProgList = YEAR_1_PROGRAMS[u.id] || [];
      const y1Progs = y1ProgList.map((item) => {
        const meta = Y1_UNIT_META[u.id] || { budget: 1, national: 1, city: 0, carry: 0 };
        const nationalRatio = meta.national / meta.budget;
        const spentRatio = (meta.budget - meta.carry) / meta.budget;

        // A1나 단위과제는 1차년도 프로그램 예산이 존재하지 않습니다.
        const budgetMain = isA1Na ? 0 : item.budget;
        const spentMain = isA1Na ? 0 : (item.spent !== undefined ? item.spent : Math.round(item.budget * spentRatio));

        const budget_national = Math.round(budgetMain * nationalRatio);
        const budget_city = budgetMain - budget_national;

        const spent_national = Math.round(spentMain * nationalRatio);
        const spent_city = spentMain - spent_national;

        const progYears: LegacyYearRecord = {
          1: {
            budget_main: budgetMain,
            spent_main: spentMain,
            budget_carry: 0,
            spent_carry: 0,

            budget_national,
            spent_national,
            budget_city,
            spent_city,
            budget_external: 0,
            spent_external: 0,

            budget_carry_national: 0,
            spent_carry_national: 0,
            budget_carry_city: 0,
            spent_carry_city: 0,
            budget_carry_external: 0,
            spent_carry_external: 0,
            budget_categories: item.budget_categories || []
          }
        };

        return {
          id: item.id,
          title: item.title,
          assignee: item.assignee || "미지정",
          pdca: item.pdca || { p: "완료", d: "완료", c: "완료", a: "완료" },
          years: progYears,
          timeline: item.timeline || "",
          targetAudience: item.targetAudience || "",
          coopDept: item.coopDept || "",
          achievements: "울산 지역 주력산업 고도화 및 지역정주 취업률 강화를 위해 기업 맞춤형 주문식 교육과정을 개발하고, 지산학교육센터(ECC) 중심의 산학 공동 연구를 수행하여 지역 사회 만족도를 크게 제고함.",
          satisfaction: 92,
          evalType: "우수",
          excellent: "대학 내 행정 전담 시스템 구축 및 격주 단위 운영위원회 활성화를 통해 신속한 의사결정 체계를 안착시킨 점이 우수함.",
          improvePlan: "2차년도에는 지역 정주 취업 연계를 보다 고도화하기 위해 가족회사 매칭 강소기업 현장 견학 프로그램을 추가 개설하고, 산학 PBL 과제를 확대 편성할 계획임.",
          deficiency: "",
          actionItem: ""
        };
      });

      // 2~5차년도용 프로그램 다년도 매핑 (1차년도는 제외)
      const y2Progs = u.programs.map((prog: LegacyAppRecord) => {
        const progYears: LegacyYearRecord = {};
        [2, 3, 4, 5].forEach((yr) => {
          let budgetMain = 0;
          let spentMain = 0;
          let budgetCarry = 0;
          let spentCarry = 0;

          if (isA1Na && yr !== 2) {
            // A1나 단위과제는 2차년도에 한해서만 예산이 반영됩니다.
            budgetMain = 0;
            spentMain = 0;
            budgetCarry = 0;
            spentCarry = 0;
          } else if (yr === 2) {
            budgetMain = prog.budget_2026 || 0;
            spentMain = prog.spent_2026 || 0;
            budgetCarry = prog.budget_2025_carry || 0;
            spentCarry = prog.spent_2025_carry || 0;
          } else {
            // 3차년도 이후 총괄계획은 2차년도와 동일하게 적용 (팩터 제거)
            budgetMain = prog.budget_2026 || 0;
            spentMain = 0;
            budgetCarry = 0;
            spentCarry = 0;
          }

          const isExternalSub = prog.id.includes("위탁") || prog.title.includes("위탁") || prog.title.includes("협력");
          const nationalRatio = prog.budget_2026 > 0 ? (prog.budget_national || 0) / prog.budget_2026 : 0.5;

          let budget_national = 0;
          let budget_city = 0;
          let budget_external = 0;

          if (isA1Na && yr !== 2) {
            // A1나 2차년도 외 차년도 0원 강제
            budget_national = 0;
            budget_city = 0;
            budget_external = 0;
          } else {
            if (isExternalSub) {
              budget_external = budgetMain;
            } else {
              budget_national = Math.round(budgetMain * nationalRatio);
              budget_city = budgetMain - budget_national;
            }
          }

          let spent_national = 0;
          let spent_city = 0;
          let spent_external = 0;
          if (spentMain > 0) {
            if (isA1Na && yr !== 2) {
              spent_national = 0;
              spent_city = 0;
              spent_external = 0;
            } else if (isExternalSub) {
              spent_external = spentMain;
            } else {
              spent_national = Math.round(spentMain * nationalRatio);
              spent_city = spentMain - spent_national;
            }
          }

          let carry_national = 0;
          let carry_city = 0;
          let carry_external = 0;
          if (budgetCarry > 0) {
            if (isA1Na && yr !== 2) {
              carry_national = 0;
              carry_city = 0;
              carry_external = 0;
            } else if (isExternalSub) {
              carry_external = budgetCarry;
            } else {
              carry_national = Math.round(budgetCarry * nationalRatio);
              carry_city = budgetCarry - carry_national;
            }
          }

          let carry_spent_national = 0;
          let carry_spent_city = 0;
          let carry_spent_external = 0;
          if (spentCarry > 0) {
            if (isA1Na && yr !== 2) {
              carry_spent_national = 0;
              carry_spent_city = 0;
              carry_spent_external = 0;
            } else if (isExternalSub) {
              carry_spent_external = spentCarry;
            } else {
              carry_spent_national = Math.round(spentCarry * nationalRatio);
              carry_spent_city = spentCarry - carry_spent_national;
            }
          }

          progYears[yr] = {
            budget_main: budgetMain,
            spent_main: spentMain,
            budget_carry: budgetCarry,
            spent_carry: spentCarry,

            budget_national,
            spent_national,
            budget_city,
            spent_city,
            budget_external,
            spent_external,

            budget_carry_national: carry_national,
            spent_carry_national: carry_spent_national,
            budget_carry_city: carry_city,
            spent_carry_city: carry_spent_city,
            budget_carry_external: carry_external,
            spent_carry_external: carry_spent_external
          };

          // 💡 [비목 자동 주입] 2~5차년도 세부 프로그램의 비목 예산(budget_categories)을 최표준 맵 규정에 맞춰 자동 구성합니다.
          const standardCategories = [
            "인건비", "장학금", "교육∙연구 프로그램 개발∙운영비", "교육∙연구 환경개선비",
            "실험∙실습장비 및 기자재 구입∙운영비", "지역 연계∙협업 지원비", "기업 지원∙협력 활동비",
            "성과 활용∙확산 지원비", "그 밖의 사업운영경비", "간접비"
          ];

          // 💡 [기획서 다중 비목 명세 100% 최우선 존중 규칙]
          // 만약 mockData.js의 원천 프로그램 객체에 budget_categories 배열이 존재한다면,
          // 아래의 하드코딩 매핑 및 덮어쓰기를 스킵하고 원래 적혀있는 비목을 그대로 이식합니다.
          const hasExplicitCategories = prog.budget_categories &&
            Array.isArray(prog.budget_categories) &&
            prog.budget_categories.some((c: LegacyAppRecord) => c.category);

          if (hasExplicitCategories) {
            // 💡 [다중 비목 연도별 예산 자동 스케일링 규칙]
            // mockData.js의 budget_categories는 2차년도(2026) 기준이므로,
            // 2차년도가 아닌 타 연도(1, 3, 4, 5차년도)에 대해서는 프로그램 총예산(budgetMain)에 맞게 비율 배분합니다.
            const totalRef = prog.budget_2026 || 0;
            const explicitSum = prog.budget_categories.reduce((s: number, c: LegacyAppRecord) => s + (c.budget || 0), 0);

            progYears[yr].budget_categories = standardCategories.map((catName) => {
              const srcCat = prog.budget_categories.find((c: LegacyAppRecord) => c.category === catName);
              const isMatch = srcCat !== undefined;

              let bVal = isMatch ? (srcCat.budget || 0) : 0;
              let bcVal = isMatch ? (srcCat.budget_carry || 0) : 0;
              let sVal = isMatch ? (srcCat.spent || 0) : 0;
              let scVal = isMatch ? (srcCat.spent_carry || 0) : 0;

              // 💡 2차년도가 아닐 때만 비율 기반 배정 스케일링 수행
              if (yr !== 2 && isMatch && totalRef > 0) {
                const ratio = bVal / totalRef;
                bVal = Math.round(budgetMain * ratio);
                bcVal = 0;
                sVal = 0;
                scVal = 0;
              } else if (yr !== 2 && isMatch && totalRef === 0 && explicitSum > 0) {
                const ratio = bVal / explicitSum;
                bVal = Math.round(budgetMain * ratio);
                bcVal = 0;
                sVal = 0;
                scVal = 0;
              }

              return {
                category: catName,
                budget: String(bVal).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                budget_carry: String(bcVal).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                spent: sVal,
                spent_carry: scVal
              };
            });
          } else {
            let targetCategory = "교육∙연구 프로그램 개발∙운영비"; // 디폴트

            progYears[yr].budget_categories = standardCategories.map((catName) => {
              const isMatch = catName === targetCategory;
              return {
                category: catName,
                budget: isMatch ? String(budgetMain).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0",
                budget_carry: "0",
                spent: isMatch ? spentMain : 0,
                spent_carry: 0
              };
            });
          }
        });

        recalculateCarryOver(progYears);

        [2, 3, 4, 5].forEach((yr) => {
          const py = progYears[yr];
          const isExternalSub = prog.id.includes("위탁") || prog.title.includes("위탁") || prog.title.includes("협력");
          const isNationalOnly = prog.id.startsWith("A1나-");

          if (isExternalSub) {
            py.budget_carry_external = py.budget_carry || 0;
            py.budget_carry_national = 0;
            py.budget_carry_city = 0;
          } else if (isNationalOnly) {
            py.budget_carry_national = py.budget_carry || 0;
            py.budget_carry_city = 0;
            py.budget_carry_external = 0;
          } else {
            const ratio = prog.budget_2026 > 0 ? (prog.budget_national || 0) / prog.budget_2026 : 0.5;
            py.budget_carry_national = Math.round((py.budget_carry || 0) * ratio);
            py.budget_carry_city = (py.budget_carry || 0) - py.budget_carry_national;
            py.budget_carry_external = 0;
          }
        });

        return {
          ...prog,
          years: progYears,
          timeline: prog.timeline || "",
          targetAudience: prog.targetAudience || "",
          coopDept: prog.coopDept || "",
          evalType: prog.evalType || "우수",
          excellent: prog.excellent || "",
          improvePlan: prog.improvePlan || "",
          deficiency: prog.deficiency || "",
          actionItem: prog.actionItem || ""
        };
      });

      // 💡 [중복 ID 방지 및 병합 가드] 1차년도(y1Progs)와 2~5차년도(y2Progs) 세부 프로그램의 중복 ID를 제거하고 years를 병합합니다.
      const uniquePrograms: LegacyAppRecord[] = [];
      const seenIds = new Set();
      [...y1Progs, ...y2Progs].forEach((prog) => {
        if (prog && prog.id) {
          if (!seenIds.has(prog.id)) {
            seenIds.add(prog.id);
            uniquePrograms.push(JSON.parse(JSON.stringify(prog)));
          } else {
            const existingIdx = uniquePrograms.findIndex((p: LegacyAppRecord) => p.id === prog.id);
            if (existingIdx !== -1) {
              const existing = uniquePrograms[existingIdx];
              existing.years = {
                ...(existing.years || {}),
                ...(prog.years || {})
              };
              const hasCurrentData = (p: LegacyAppRecord) => p.years && Object.keys(p.years).some(y => p.years[y] && p.years[y].budget_main > 0);
              if (!hasCurrentData(existing) && hasCurrentData(prog)) {
                const mergedYears = existing.years;
                uniquePrograms[existingIdx] = {
                  ...prog,
                  years: mergedYears
                };
              }
            }
          }
        }
      });
      const newPrograms = uniquePrograms;

      // 3. 비목별 예산 다년도 맵핑
      const newBudgetDetails: Record<string, LegacyAppRecord> = {};
      Object.keys(u.budgetDetails || {}).forEach((key) => {
        const b = u.budgetDetails[key];

        // [비정상 오버플로우 정화] 100억 원 초과 시 오기입 및 오계산 복구 (장학금 복원)
        if (b.budget_2026 > 10000000000) {
          b.budget_2026 = Math.round(b.budget_2026 / 1000);
        }
        if (b.budget_2025_carry > 10000000000) {
          b.budget_2025_carry = Math.round(b.budget_2025_carry / 1000);
        }
        if (b.spent_2026 > 10000000000) {
          b.spent_2026 = Math.round(b.spent_2026 / 1000);
        }
        if (b.spent_2025_carry > 10000000000) {
          b.spent_2025_carry = Math.round(b.spent_2025_carry / 1000);
        }

        const detailYears: LegacyYearRecord = {};
        [1, 2, 3, 4, 5].forEach((yr) => {
          if (yr === 2) {
            detailYears[yr] = {
              budget_main: b.budget_2026 || 0,
              spent_main: b.spent_2026 || 0,
              budget_carry: b.budget_2025_carry || 0,
              spent_carry: b.spent_2025_carry || 0
            };
          } else if (yr === 1) {
            const budgetMain = Math.round((b.budget_2026 || 0) * 0.9);
            const spentMain = Math.max(0, budgetMain - (b.budget_2025_carry || 0));
            detailYears[yr] = {
              budget_main: budgetMain,
              spent_main: spentMain,
              budget_carry: 0,
              spent_carry: 0
            };
          } else {
            const factor = yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3;
            detailYears[yr] = {
              budget_main: Math.round((b.budget_2026 || 0) * factor),
              spent_main: 0,
              budget_carry: 0,
              spent_carry: 0
            };
          }
        });
        recalculateCarryOver(detailYears);
        newBudgetDetails[key] = {
          years: detailYears
        };
      });

      // 3.5. 세부 프로그램(newPrograms)의 비목별 배정 계획을 단위과제 10대 비목(newBudgetDetails)에 쪼개서 강제 롤업 연동
      [1, 2, 3, 4, 5].forEach((yr) => {
        const categorySums: Record<string, LegacyAppRecord> = {
          "인건비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "장학금": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "교육∙연구 프로그램 개발∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "교육∙연구 환경개선비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "실험∙실습장비 및 기자재 구입∙운영비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "지역 연계∙협업 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "기업 지원∙협력 활동비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "성과 활용∙확산 지원비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "그 밖의 사업운영경비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 },
          "간접비": { main: 0, carry: 0, spent_main: 0, spent_carry: 0 }
        };

        newPrograms.forEach((prog) => {
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

                categorySums[catName].main += mainVal;
                categorySums[catName].carry += carryVal;
                categorySums[catName].spent_main += spentVal;
                categorySums[catName].spent_carry += spentCarryVal;

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

          categorySums["교육∙연구 프로그램 개발∙운영비"].main += remainMain;
          categorySums["교육∙연구 프로그램 개발∙운영비"].carry += remainCarry;
          categorySums["교육∙연구 프로그램 개발∙운영비"].spent_main += remainSpent;
          categorySums["교육∙연구 프로그램 개발∙운영비"].spent_carry += remainSpentCarry;
        });

        // 결과 주입
        Object.keys(categorySums).forEach((catName) => {
          if (!newBudgetDetails[catName]) {
            newBudgetDetails[catName] = { years: {} };
          }
          if (!newBudgetDetails[catName].years[yr]) {
            newBudgetDetails[catName].years[yr] = {
              budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0
            };
          }
          const tgt = newBudgetDetails[catName].years[yr];
          tgt.budget_main = categorySums[catName].main;
          tgt.budget_carry = categorySums[catName].carry;
          tgt.spent_main = categorySums[catName].spent_main;
          tgt.spent_carry = categorySums[catName].spent_carry;
        });
      });

      // 모든 비목의 이월 잔액 5개년 연쇄 재계산
      Object.keys(newBudgetDetails).forEach((key) => {
        recalculateCarryOver(newBudgetDetails[key].years);
      });

      // 3.6. 롤업된 데이터를 바탕으로 단위과제 전체 연도별(unitYears) 총예산/총집행액 누적합 재집계
      [1, 2, 3, 4, 5].forEach((yr) => {
        unitYears[yr] = {
          budget_main: Object.values(newBudgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_main || 0), 0),
          budget_carry: Object.values(newBudgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.budget_carry || 0), 0),
          spent_main: Object.values(newBudgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_main || 0), 0),
          spent_carry: Object.values(newBudgetDetails).reduce((sum, b) => sum + (b.years?.[yr]?.spent_carry || 0), 0)
        };
      });
      recalculateCarryOver(unitYears);

      return {
        ...u,
        years: unitYears,
        programs: newPrograms,
        budgetDetails: newBudgetDetails
      };
    });

    return {
      ...p,
      units: newUnits
    };
  });
}

export function mergeProjectsWithInitial(
  loadedData: LegacyAppRecord[] | null | undefined,
  multiYearInitialData: LegacyAppRecord[]
) {
  if (!loadedData) return multiYearInitialData;
  const updated = JSON.parse(JSON.stringify(loadedData)) as LegacyAppRecord[];

  // 💡 [Self-healing 누락 복원 가드] 최신 기획 템플릿(multiYearInitialData)에는 있으나
  // DB에서 읽어온 데이터(updated)에 누락된 신규 전략(Strategy) 및 단위과제(Unit)가 있다면
  // 구조 유실을 막기 위해 마스터 구조 그대로 자동 복원 및 주입합니다.
  multiYearInitialData.forEach((sourceStrat) => {
    let targetStrat = updated.find(s => s.id === sourceStrat.id);
    if (!targetStrat) {
      targetStrat = {
        id: sourceStrat.id,
        title: sourceStrat.title,
        units: []
      };
      updated.push(targetStrat);
    }

    if (sourceStrat.units && Array.isArray(sourceStrat.units)) {
      sourceStrat.units.forEach((sourceUnit: LegacyAppRecord) => {
        let targetUnit = targetStrat.units.find((u: LegacyAppRecord) => u.id === sourceUnit.id);
        if (!targetUnit) {
          // 단위과제가 통째로 누락되었으므로 마스터 템플릿의 사본을 주입
          targetUnit = JSON.parse(JSON.stringify(sourceUnit));
          targetStrat.units.push(targetUnit);
        } else {
          // 단위과제는 존재하나 메타 정보가 유실되었거나 최신화가 필요할 때 보정
          targetUnit.kpis = sourceUnit.kpis || [];
          if (sourceUnit.title) targetUnit.title = sourceUnit.title;
          if (sourceUnit.manager && !targetUnit.manager) targetUnit.manager = sourceUnit.manager;
        }
      });
    }
  });

  updated.forEach((strategy) => {
    if (strategy.units && Array.isArray(strategy.units)) {
      strategy.units.forEach((unit: LegacyAppRecord) => {
        const sourceUnit = multiYearInitialData
          ?.flatMap(s => s.units)
          ?.find((u: LegacyAppRecord) => u.id === unit.id);

        if (sourceUnit && sourceUnit.programs) {
          const mergedPrograms = sourceUnit.programs.map((sourceProg: LegacyAppRecord) => {
            const cachedProg = unit.programs?.find((cp: LegacyAppRecord) => cp.id === sourceProg.id);
            if (cachedProg) {
              // 💡 [Self-healing 연구원 배정 등급 호칭 불일치 자가 보정]
              if (cachedProg.assignee === "박인숙 연구원") {
                cachedProg.assignee = "박인숙 선임연구원";
              }
              if (cachedProg.assignees) {
                Object.keys(cachedProg.assignees).forEach(yr => {
                  if (cachedProg.assignees[yr] === "박인숙 연구원") {
                    cachedProg.assignees[yr] = "박인숙 선임연구원";
                  }
                });
              }

              if (!cachedProg.years) cachedProg.years = {};
              const updatedYears = { ...cachedProg.years };

              // 5개년에 대한 예산 및 집행액 정합성 복원 루프
              [1, 2, 3, 4, 5].forEach((yr) => {
                // 💡 [Self-healing 연도별 유실 복원] 캐시 프로그램에 해당 연도 정보가 누락되어 있다면 마스터 소스의 연도 기획 정보를 강제 복구 주입합니다.
                if (!updatedYears[yr] && sourceProg.years && sourceProg.years[yr]) {
                  updatedYears[yr] = JSON.parse(JSON.stringify(sourceProg.years[yr]));
                }

                if (updatedYears[yr]) {
                  // 💡 [D1, D2, D3 예산 강제 동기화 및 자가 치유 가드] D1, D2, D3 관련 프로그램들은
                  // DB에 잘못된 옛날 캐시(외부사업비 오염 등)가 남아있고 아직 수동 기획 저장을 거치지 않은 경우에 한해,
                  // 마스터 기획(sourceProg)의 본사업비 공식 분배율(D2는 100% 국비, 나머지는 국고 50%/시비 50%)을 정밀 강제 계산하여 실시간 보정합니다.
                  if (sourceProg.id) {
                    if (sourceProg.years && sourceProg.years[yr]) {
                      const sy = sourceProg.years[yr];
                      const y = updatedYears[yr];

                      // 💡 [재원 비율 및 비목 자가 복구 가드] DB에 저장된 국비 비율이 sourceProg의 2차년도 공식 기획 재원 비율과 오차가 생기거나 비목 상세가 비어 있으면 강제 복원 대상입니다.
                      const targetRatio = sourceProg.budget_2026 > 0 ? (sourceProg.budget_national || 0) / sourceProg.budget_2026 : 0.5;
                      const isDirtyRatio = y && y.budget_main > 0 && Math.abs((y.budget_national || 0) / y.budget_main - targetRatio) > 0.05;
                      const isCategoriesEmpty = !y || !y.budget_categories || y.budget_categories.length === 0 || y.budget_categories.every((c: LegacyAppRecord) => (c.budget || 0) === 0);

                      // 💡 [유효 비목 정합성 검사]
                      // 10대 비목이 기본으로 전부 포함되므로, 단순 종류 비교가 아닌 예산이 배정된 '실제 유효 비목'의 종류가 서로 일치하는지 정밀 대조합니다.
                      const hasBimokMismatch = () => {
                        if (!y || !y.budget_categories || !sy || !sy.budget_categories) return true;

                        const yActiveCats = y.budget_categories
                          .filter((c: LegacyAppRecord) => {
                            const b = parseInt(String(c.budget || "0").replace(/,/g, ""), 10) || 0;
                            const bc = parseInt(String(c.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                            return b > 0 || bc > 0;
                          })
                          .map((c: LegacyAppRecord) => c.category)
                          .sort();

                        const syActiveCats = sy.budget_categories
                          .filter((c: LegacyAppRecord) => {
                            const b = parseInt(String(c.budget || "0").replace(/,/g, ""), 10) || 0;
                            const bc = parseInt(String(c.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                            return b > 0 || bc > 0;
                          })
                          .map((c: LegacyAppRecord) => c.category)
                          .sort();

                        if (yActiveCats.length !== syActiveCats.length) return true;
                        return yActiveCats.some((val: string, idx: number) => val !== syActiveCats[idx]);
                      };
                      const isDirtyBimok = hasBimokMismatch();

                      const hasUserSavedData = y && (
                        (y.budget_main > 0 && y.budget_national !== undefined && y.budget_city !== undefined) ||
                        y.budget_national > 0 ||
                        y.budget_city > 0 ||
                        y.budget_external > 0
                      );

                      if (!hasUserSavedData || isDirtyRatio || isCategoriesEmpty || isDirtyBimok) {
                        const rawBudgetMain = yr === 2 ? (sourceProg.budget_2026 || 0) : yr === 1 ? Math.round((sourceProg.budget_2026 || 0) * 0.9) : Math.round((sourceProg.budget_2026 || 0) * (yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3));

                        y.budget_main = rawBudgetMain;
                        y.budget_national = Math.round(rawBudgetMain * targetRatio);
                        y.budget_city = rawBudgetMain - y.budget_national;
                        y.budget_external = 0; // 특별한 언급이 없으므로 외부사업비는 0원 처리

                        // 특별한 언급이 없으므로 이월사업비도 0원 처리
                        y.budget_carry_national = 0;
                        y.budget_carry_city = 0;
                        y.budget_carry_external = 0;
                        y.budget_carry = 0;

                        y.budget_categories = JSON.parse(JSON.stringify(sy.budget_categories || []));
                      }
                    }
                  }

                  // 소스에 해당 연도가 아예 기획되지 않은 프로그램이라면 캐시 오염을 막기 위해 제거
                  if (!sourceProg.years || !sourceProg.years[yr]) {
                    delete updatedYears[yr];
                    return;
                  }
                  const y = updatedYears[yr];

                  // 1. 입력한 예산(세부 재원: 국고 + 시비)이 있는지 확인
                  const inputBudgetSum = (y.budget_national || 0) + (y.budget_city || 0);

                  if (inputBudgetSum > 0) {
                    y.budget_main = inputBudgetSum;
                  } else {
                    let defaultBudgetMain = 0;
                    let defaultNational = 0;
                    let defaultCity = 0;
                    let defaultExternal = 0;

                    let defaultSpentMain = 0;
                    let defaultSpentNational = 0;
                    let defaultSpentCity = 0;
                    let defaultSpentExternal = 0;

                    if (sourceProg.years && sourceProg.years[yr]) {
                      const sy = sourceProg.years[yr];
                      defaultBudgetMain = (sy.budget_national || 0) + (sy.budget_city || 0);
                      defaultNational = sy.budget_national || 0;
                      defaultCity = sy.budget_city || 0;
                      defaultExternal = sy.budget_external || 0;

                      defaultSpentMain = (sy.spent_national || 0) + (sy.spent_city || 0);
                      defaultSpentNational = sy.spent_national || 0;
                      defaultSpentCity = sy.spent_city || 0;
                      defaultSpentExternal = sy.spent_external || 0;
                    } else {
                      const rawBudgetMain = yr === 2 ? (sourceProg.budget_2026 || 0) : yr === 1 ? Math.round((sourceProg.budget_2026 || 0) * 0.9) : Math.round((sourceProg.budget_2026 || 0) * (yr === 3 ? 1.1 : yr === 4 ? 1.2 : 1.3));
                      const isExternalSub = sourceProg.id.includes("위탁") || sourceProg.title.includes("위탁") || sourceProg.title.includes("협력");
                      if (isExternalSub) {
                        defaultExternal = rawBudgetMain;
                        defaultNational = 0;
                        defaultCity = 0;
                      } else {
                        defaultNational = Math.round(rawBudgetMain * 0.5);
                        defaultCity = rawBudgetMain - defaultNational;
                        defaultExternal = 0;
                      }
                      defaultBudgetMain = defaultNational + defaultCity;
                    }

                    y.budget_main = defaultBudgetMain;
                    y.budget_national = defaultNational;
                    y.budget_city = defaultCity;
                    y.budget_external = defaultExternal;

                    y.spent_main = defaultSpentMain;
                    y.spent_national = defaultSpentNational;
                    y.spent_city = defaultSpentCity;
                    y.spent_external = defaultSpentExternal;
                  }

                  // 2. 이월예산도 세부 이월예산(국고 + 시비)의 합산으로 동기화 (1차년도는 이월이 없으므로 강제 0원, 외부사업비 제외)
                  if (yr === 1) {
                    y.budget_carry_national = 0;
                    y.budget_carry_city = 0;
                    y.budget_carry_external = 0;
                    y.budget_carry = 0;
                  } else {
                    y.budget_carry = (y.budget_carry_national || 0) + (y.budget_carry_city || 0);
                  }

                  // 3. 본집행액도 세부 집행액(국고 + 시비)의 합으로 실시간 동기화 (외부사업비 제외)
                  y.spent_main = (y.spent_national || 0) + (y.spent_city || 0);

                  // 4. 이월집행액도 세부 이월집행액(국고 + 시비)의 합으로 동기화 (1차년도는 0원, 외부사업비 제외)
                  if (yr === 1) {
                    y.spent_carry_national = 0;
                    y.spent_carry_city = 0;
                    y.spent_carry_external = 0;
                    y.spent_carry = 0;
                  } else {
                    y.spent_carry = (y.spent_carry_national || 0) + (y.spent_carry_city || 0);
                  }

                  // 5. 비목 카테고리 예산 오버플로우 보정
                  if (y.budget_categories && Array.isArray(y.budget_categories)) {
                    y.budget_categories.forEach((cat: LegacyAppRecord) => {
                      const catBudget = parseInt(String(cat.budget || "0").replace(/,/g, ""), 10) || 0;
                      if (catBudget > 10000000000) {
                        cat.budget = Math.round(catBudget / 1000);
                      }
                      const catCarry = parseInt(String(cat.budget_carry || "0").replace(/,/g, ""), 10) || 0;
                      if (catCarry > 10000000000) {
                        cat.budget_carry = Math.round(catCarry / 1000);
                      }
                    });
                  }
                }
              });
              cachedProg.years = updatedYears; // 💡 [Self-healing 참조 복원 재대입]
              return cachedProg;
            } else {
              return sourceProg;
            }
          });
          // 💡 [중복 ID 방지 가드] 1차년도와 다년도 프로그램 목록 병합 시 발생할 수 있는 동일 ID 프로그램 중복 노출을 차단합니다.
          const uniquePrograms: LegacyAppRecord[] = [];
          const seenIds = new Set<string>();
          mergedPrograms.forEach((prog: LegacyAppRecord) => {
            if (prog && prog.id) {
              if (!seenIds.has(prog.id)) {
                seenIds.add(prog.id);
                uniquePrograms.push(prog);
              } else {
                // 중복된 경우, 상세 연도 정보(years)를 서로 병합하고, 유효한 상세 연도 정보(years[selectedYear])를 가진 객체를 우선하여 속성을 덮어씁니다.
                const existingIdx = uniquePrograms.findIndex((p: LegacyAppRecord) => p.id === prog.id);
                if (existingIdx !== -1) {
                  const existing = uniquePrograms[existingIdx];
                  existing.years = {
                    ...(existing.years || {}),
                    ...(prog.years || {})
                  };
                const hasCurrentData = (p: LegacyAppRecord) => p.years && Object.keys(p.years).some(y => p.years[y] && p.years[y].budget_main > 0);
                  if (!hasCurrentData(existing) && hasCurrentData(prog)) {
                    const mergedYears = existing.years;
                    uniquePrograms[existingIdx] = {
                      ...prog,
                      years: mergedYears
                    };
                  }
                }
              }
            }
          });
          unit.programs = uniquePrograms;

          // 💡 [단위과제 비목 및 예산 실시간 롤업 재집계]
          // 세부 프로그램들의 기획 예산(budget_main) 및 비목별 배정(budget_categories)을 기반으로
          // 단위과제의 budgetDetails와 years를 실시간으로 재집계(롤업)하여 정합성을 완벽하게 보장합니다.
          const categorySums: Record<string, LegacyYearRecord> = {
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

          // 집계한 categorySums를 unit.budgetDetails 에 반영
          if (!unit.budgetDetails) unit.budgetDetails = {};
          Object.keys(categorySums).forEach((catName) => {
            if (!unit.budgetDetails[catName]) {
              unit.budgetDetails[catName] = { years: {} };
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

              // 💡 [교육용 한글 주석] A1나(신산업특화) 단위과제는 시비 예산 없이
              // 국비(국고)로만 100% 편성하도록 예외 대상을 적용합니다. (시비 0원)
              const isNationalOnly = unit.id === "A1나";
              unit.budgetDetails[catName].years[yr] = {
                budget_main: mainVal,
                budget_carry: categorySums[catName][yr].carry,
                spent_main: categorySums[catName][yr].spent_main,
                spent_carry: categorySums[catName][yr].spent_carry,
                // 💡 [재원 정밀 집계] A1나 단위과제는 100% 국비(국고) 본예산으로 분류하고 시비는 0원 처리합니다.
                budget_national: isNationalOnly ? mainVal : Math.round(mainVal * ratio),
                budget_city: isNationalOnly ? 0 : mainVal - Math.round(mainVal * ratio),
                budget_external: 0,
                spent_national: isNationalOnly ? categorySums[catName][yr].spent_main : Math.round(categorySums[catName][yr].spent_main * spentRatio),
                spent_city: isNationalOnly ? 0 : categorySums[catName][yr].spent_main - Math.round(categorySums[catName][yr].spent_main * spentRatio),
                spent_external: 0
              };
            });
          });

          // 💡 [비목 구조 및 값 동기화] DB에서 로드된 단위과제의 비목 상세(budgetDetails)에 최신 mockData 비목 구조를 주입/병합합니다.
          if (sourceUnit && sourceUnit.budgetDetails) {
            if (!unit.budgetDetails) unit.budgetDetails = {};
            Object.keys(sourceUnit.budgetDetails).forEach((catName) => {
              const sourceCat = sourceUnit.budgetDetails[catName];
              const cachedCat = unit.budgetDetails[catName];

              if (!cachedCat) {
                unit.budgetDetails[catName] = { years: {} };
                [1, 2, 3, 4, 5].forEach((yr) => {
                  if (yr === 2 && sourceCat.budget_2026 !== undefined) {
                    unit.budgetDetails[catName].years[2] = {
                      budget_main: sourceCat.budget_2026 || 0,
                      budget_national: sourceCat.budget_national !== undefined ? sourceCat.budget_national : Math.round((sourceCat.budget_2026 || 0) * 0.5),
                      budget_city: (sourceCat.budget_2026 || 0) - (sourceCat.budget_national || 0),
                      budget_external: 0,
                      spent_main: sourceCat.spent_2026 || 0,
                      budget_carry: sourceCat.budget_2025_carry || 0,
                      spent_carry: sourceCat.spent_2025_carry || 0
                    };
                  } else {
                    unit.budgetDetails[catName].years[yr] = { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
                  }
                });
              } else {
                if (!cachedCat.years) cachedCat.years = {};
                [1, 2, 3, 4, 5].forEach((yr) => {
                  if (!cachedCat.years[yr]) {
                    if (sourceCat.years?.[yr]) {
                      cachedCat.years[yr] = JSON.parse(JSON.stringify(sourceCat.years[yr]));
                    } else if (yr === 2 && sourceCat.budget_2026 !== undefined) {
                      cachedCat.years[2] = {
                        budget_main: sourceCat.budget_2026 || 0,
                        budget_national: sourceCat.budget_national !== undefined ? sourceCat.budget_national : Math.round((sourceCat.budget_2026 || 0) * 0.5),
                        budget_city: (sourceCat.budget_2026 || 0) - (sourceCat.budget_national || 0),
                        budget_external: 0,
                        spent_main: sourceCat.spent_2026 || 0,
                        budget_carry: sourceCat.budget_2025_carry || 0,
                        spent_carry: sourceCat.spent_2025_carry || 0
                      };
                    } else {
                      cachedCat.years[yr] = { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
                    }
                  }
                });
              }
            });
          }
        }
      });
    }
  });

  // 💡 [단위과제 예산 총합 재집계] 머지가 완료된 후, 단위과제별로 10대 비목의 예산/집행 정보를 연도별(1~5)로 누적 합산하여 최종 budget_main을 갱신합니다.
  updated.forEach((strategy) => {
    if (strategy.units && Array.isArray(strategy.units)) {
      strategy.units.forEach((unit) => {
        if (unit.budgetDetails) {
          const budgetDetailValues = Object.values(
            unit.budgetDetails as Record<string, LegacyAppRecord>
          );
          [1, 2, 3, 4, 5].forEach((yr) => {
            if (!unit.years) unit.years = {};
            if (!unit.years[yr]) {
              unit.years[yr] = { budget_main: 0, spent_main: 0, budget_carry: 0, spent_carry: 0 };
            }

            unit.years[yr].budget_main = budgetDetailValues.reduce((sum, b) => {
              return sum + (b.years?.[yr]?.budget_main || 0);
            }, 0);

            // 💡 [교육용 한글 주석] A1나 단위과제는 100% 국비(국고) 본예산으로 집계되도록 강제 연산합니다. (시비 0원)
            if (unit.id === "A1나") {
              unit.years[yr].budget_national = unit.years[yr].budget_main;
              unit.years[yr].budget_city = 0;
              unit.years[yr].budget_external = 0;
              unit.years[yr].spent_national = unit.years[yr].spent_main || 0;
              unit.years[yr].spent_city = 0;
              unit.years[yr].spent_external = 0;
            } else {
              unit.years[yr].budget_national = budgetDetailValues.reduce((sum, b) => {
                return sum + (b.years?.[yr]?.budget_national || 0);
              }, 0);
              unit.years[yr].budget_city = budgetDetailValues.reduce((sum, b) => {
                return sum + (b.years?.[yr]?.budget_city || 0);
              }, 0);
              unit.years[yr].budget_external = budgetDetailValues.reduce((sum, b) => {
                return sum + (b.years?.[yr]?.budget_external || 0);
              }, 0);
              unit.years[yr].spent_national = budgetDetailValues.reduce((sum, b) => {
                return sum + (b.years?.[yr]?.spent_national || 0);
              }, 0);
              unit.years[yr].spent_city = budgetDetailValues.reduce((sum, b) => {
                return sum + (b.years?.[yr]?.spent_city || 0);
              }, 0);
              unit.years[yr].spent_external = budgetDetailValues.reduce((sum, b) => {
                return sum + (b.years?.[yr]?.spent_external || 0);
              }, 0);
            }

            unit.years[yr].budget_carry = budgetDetailValues.reduce((sum, b) => {
              return sum + (b.years?.[yr]?.budget_carry || 0);
            }, 0);
            unit.years[yr].spent_main = budgetDetailValues.reduce((sum, b) => {
              return sum + (b.years?.[yr]?.spent_main || 0);
            }, 0);
            unit.years[yr].spent_carry = budgetDetailValues.reduce((sum, b) => {
              return sum + (b.years?.[yr]?.spent_carry || 0);
            }, 0);
          });

          // 레거시/기타 UI 연동용 필드 동기화
          const yr = 2; // 2차년도 기준 디폴트 연동
          unit.budget = (unit.years[yr]?.budget_main || 0) + (unit.years[yr]?.budget_carry || 0);
          unit.spent = (unit.years[yr]?.spent_main || 0) + (unit.years[yr]?.spent_carry || 0);
        }
      });
    }
  });

  return updated;
}

export const getNormalizedKpi = (k: LegacyAppRecord, selectedYear: number) => {
  if (!k) return null;
  if (selectedYear !== 1) return k;

  if (k.id.startsWith("C-")) {
    if (k.id === "C-1") {
      return {
        ...k,
        description: "지자체 대표 프로젝트 및 단위과제들의 종합 연도별 목표치 달성률",
        formula: "\\text{대표과제 달성률(\\%)} = \\frac{\\text{당해연도 대표과제 성과 달성치}}{\\text{당해연도 대표과제 목표 설정치}} \\times 100",
        subItems: [
          {
            id: "C-1-1",
            name: "대표과제 목표 달성 개수",
            unit: "건",
            years: { 1: { target: 5, current: 5 } }
          }
        ]
      };
    } else if (k.id === "C-2") {
      return {
        ...k,
        description: "대학, 산업체, 연구소, 지자체 간의 협약 건수 및 공동 R&BD 유입 실적 증가 비율",
        formula: "\\text{협업 증가율(\\%)} = \\frac{\\text{평가연도 실적} - \\text{기준연도(24년) 실적}}{\\text{기준연도(24년) 실적}} \\times 100",
        subItems: [
          {
            id: "C-2-1",
            name: "지산학연 협력협약 체결 건수",
            unit: "건",
            years: { 1: { target: 45, current: 52 } }
          },
          {
            id: "C-2-2",
            name: "공동 R&BD 및 기술이전 체결액",
            unit: "백만원",
            years: { 1: { target: 800, current: 950 } }
          }
        ]
      };
    } else if (k.id === "C-3") {
      return {
        ...k,
        description: "성인학습자의 직업 능력 제고를 위한 비학위 및 평생직업교육과정 참여생 증가 추이",
        formula: "\\text{성인학습자 증가율(\\%)} = \\frac{\\text{평가연도 실적} - \\text{기준연도(24년) 실적}}{\\text{기준연도(24년) 실적}} \\times 100",
        subItems: [
          {
            id: "C-3-1",
            name: "평생직업교육 비학위과정 이수 인원",
            unit: "명",
            years: { 1: { target: 1500, current: 1680 } }
          }
        ]
      };
    } else if (k.id === "C-4") {
      return {
        ...k,
        description: "졸업생 중 울산광역시 및 인접 동일생활권 내 기업체에 취업하여 정주한 졸업생 증가율",
        formula: "\\text{정주 취업 증가율(\\%)} = \\frac{\\text{평가연도 실적} - \\text{기준연도(24년) 실적}}{\\text{기준연도(24년) 실적}} \\times 100",
        subItems: [
          {
            id: "C-4-1",
            name: "관내 기업체 취업 졸업생 수",
            unit: "명",
            years: { 1: { target: 650, current: 698 } }
          }
        ]
      };
    } else if (k.id === "C-5") {
      return {
        ...k,
        description: "RISE 사업 및 지산학 협력 거버넌스 전반에 대한 시도 내 만족도 조사 향상율",
        formula: "\\text{만족도 증가율(\\%)} = \\frac{\\text{평가연도 실적} - \\text{기준연도(24년) 실적}}{\\text{기준연도(24년) 실적}} \\times 100",
        subItems: [
          {
            id: "C-5-1",
            name: "종합 지산학연 연계 체제 만족도 지수",
            unit: "점",
            years: { 1: { target: 80, current: 82 } }
          }
        ]
      };
    } else if (k.id === "C-6") {
      return {
        ...k,
        description: "대학의 생산 유발 및 고용 창출 등 지역 경제 활성화에 기여한 영향력 성장도",
        formula: "\\text{경제영향력 증가율(\\%)} = \\frac{\\text{평가연도 실적} - \\text{기준연도(24년) 실적}}{\\text{기준연도(24년) 실적}} \\times 100",
        subItems: [
          {
            id: "C-6-1",
            name: "생산 및 고용 유발 파급효과 추정액",
            unit: "억원",
            years: { 1: { target: 1200, current: 1280 } }
          }
        ]
      };
    }
  }

  if (k.id === "L-1") {
    return {
      ...k,
      description: "주류 및 신산업 연계 주문식 교육과정 개발 건수 및 강의 만족도 조사 지표",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 40 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 20 + \\frac{\\text{D 실적}}{\\text{D 기준}} \\times 10",
      subItems: [
        {
          id: "L-1-1",
          name: "지역 맞춤형 교과·비교과 프로그램 개편 건수",
          base: 28,
          unit: "건",
          years: { 1: { target: 28, current: 35 } }
        },
        {
          id: "L-1-2",
          name: "지역 맞춤형 교과·비교과 프로그램 이수 학생 수",
          base: 3500,
          unit: "명",
          years: { 1: { target: 4000, current: 3726 } }
        },
        {
          id: "L-1-3",
          name: "졸업자의 지역 내 취업자 수",
          base: 624,
          unit: "명",
          years: { 1: { target: 624, current: 624 } }
        },
        {
          id: "L-1-4",
          name: "졸업자의 지역 외 취업자 수",
          base: 527,
          unit: "명",
          years: { 1: { target: 527, current: 527 } }
        }
      ]
    };
  }

  if (k.id === "L-2") {
    return {
      ...k,
      description: "이차전지/조선 등 울산 핵심 분야 산업체 현장실습 이수 학생 수 및 만족도",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 30 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 20 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 10 + \\frac{\\text{D 실적}}{\\text{D 기준}} \\times 10 + \\frac{\\text{E 실적}}{\\text{E 기준}} \\times 30",
      subItems: [
        {
          id: "L-2-1",
          name: "12주 이상으로 운영된 표준 현장실습 학기제 이수학생 수",
          base: 74,
          unit: "명",
          years: { 1: { target: 74, current: 66 } }
        },
        {
          id: "L-2-2",
          name: "8주이상 12주미만으로 운영된 표준 현장실습 학기제 이수학생 수",
          base: 27,
          unit: "명",
          years: { 1: { target: 27, current: 26 } }
        },
        {
          id: "L-2-3",
          name: "4주 이상 8주 미만으로 운영된 표준 현장실습 학기제 이수학생 수",
          base: 103,
          unit: "명",
          years: { 1: { target: 103, current: 63 } }
        },
        {
          id: "L-2-4",
          name: "4주 이상으로 운영된 일반 현장실습 이수학생 수",
          base: 16,
          unit: "명",
          years: { 1: { target: 20, current: 1005 } }
        },
        {
          id: "L-2-5",
          name: "4주 이상 글로벌 표준 현장실습 학기제 이수학생 수",
          base: 4,
          unit: "명",
          years: { 1: { target: 4, current: 1 } }
        }
      ]
    };
  }

  if (k.id === "L-3") {
    return {
      ...k,
      description: "창업 강좌 개설 건수 및 창업 강좌 이수 학생 수 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        {
          id: "L-3-1",
          name: "창업교육 운영성과지수",
          base: 132,
          unit: "건",
          years: { 1: { target: 132, current: 143 } }
        },
        {
          id: "L-3-2",
          name: "창업교육과정 이수학생 수",
          base: 2300,
          unit: "명",
          years: { 1: { target: 2300, current: 3580 } }
        }
      ]
    };
  }

  if (k.id === "L-4") {
    return {
      ...k,
      description: "학생 및 교원의 창업 프로그램 참가 지원 및 실질 창업 활성화 수준 평가 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 40 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 10",
      subItems: [
        {
          id: "L-4-1",
          name: "창업지원 프로그램 지원(운영)건수",
          base: 22,
          unit: "건",
          years: { 1: { target: 22, current: 32 } }
        },
        {
          id: "L-4-2",
          name: "학생·교원 창업기업 수",
          base: 1,
          unit: "개사",
          years: { 1: { target: 1, current: 1 } }
        },
        {
          id: "L-4-3",
          name: "학생·교원 창업 매출액",
          base: 0,
          unit: "백만원",
          years: { 1: { target: 0, current: 0 } }
        }
      ]
    };
  }

  if (k.id === "L-5") {
    return {
      ...k,
      description: "산학공동 연구개발 성과의 기업 기술이전 계약 건수 및 로열티(기술료) 창출 실적 평가 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 25 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 25 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 10 + \\frac{\\text{D 실적}}{\\text{D 기준}} \\times 30 + \\frac{\\text{E 실적}}{\\text{E 기준}} \\times 10",
      subItems: [
        { id: "L-5-1", name: "산학연계 기술이전 건수", base: 1, unit: "건", years: { 1: { target: 0, current: 0 } } },
        { id: "L-5-2", name: "산학연계 기술이전 수익", base: 500, unit: "원", years: { 1: { target: 0, current: 0 } } },
        { id: "L-5-3", name: "산학연계 기술사업화 지원 건수", base: 6, unit: "건", years: { 1: { target: 0, current: 0 } } },
        { id: "L-5-4", name: "지식재산권 건수", base: 10, unit: "건", years: { 1: { target: 10, current: 21 } } },
        { id: "L-5-5", name: "논문 게재 수", base: 33, unit: "편", years: { 1: { target: 33, current: 62 } } }
      ]
    };
  }

  if (k.id === "L-6") {
    return {
      ...k,
      description: "대학 인프라 및 교수진을 매칭한 중소·중견기업 대상 기업애로 기술 지원 및 비즈니스 컨설팅 지원 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-6-1", name: "기업애로 해결 기술 지원 수", base: 21, unit: "건", years: { 1: { target: 21, current: 22 } } },
        { id: "L-6-2", name: "기업애로 해결 컨설팅 지원 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 3 } } }
      ]
    };
  }

  if (k.id === "L-7") {
    return {
      ...k,
      description: "성인학습자 친화형 교육환경 구축 및 평생·직업교육 과정 활성화를 통한 평생학습 기회 보장 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-7-1", name: "평생·직업교육 프로그램 이수자 수", base: 100, unit: "명", years: { 1: { target: 110, current: 375 } } },
        { id: "L-7-2", name: "재학생 중 성인 학습자 수", base: 50, unit: "명", years: { 1: { target: 50, current: 98 } } }
      ]
    };
  }

  if (k.id === "L-8") {
    return {
      ...k,
      description: "평생·직업교육 품질 신뢰도 향상을 위한 교육과정 신개발 및 참여자의 취·창업 지원 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 30 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 40 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 40",
      subItems: [
        { id: "L-8-1", name: "평생·직업교육 프로그램 개발 및 개편 건수", base: 5, unit: "건", years: { 1: { target: 5, current: 10 } } },
        { id: "L-8-2", name: "대학 성인학습자 고등교육 참여자의 유지취업률", base: 10, unit: "%", years: { 1: { target: 10, current: 0 } } },
        { id: "L-8-3", name: "대학 성인학습자 고등교육 참여자의 취·창업률", base: 14, unit: "%", years: { 1: { target: 14, current: 25.9 } } }
      ]
    };
  }

  if (k.id === "L-9") {
    return {
      ...k,
      description: "지역 밀착형 문제 해결을 위한 리빙랩 및 지자체-대학-산업계 지역 현안 공동 대응 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 20",
      subItems: [
        { id: "L-9-1", name: "지역사회 문제를 해결한 프로젝트 건수", base: 7, unit: "건", years: { 1: { target: 7, current: 7 } } },
        { id: "L-9-2", name: "지역사회 문제해결 협의체 운영 건수", base: 5, unit: "명", years: { 1: { target: 5, current: 6 } } },
        { id: "L-9-3", name: "지역사회 문제 해결 프로젝트 참여 기업(기관) 수", base: 6, unit: "명", years: { 1: { target: 6, current: 6 } } }
      ]
    };
  }

  if (k.id === "L-10") {
    return {
      ...k,
      description: "대학 보건·안전·문화 인프라를 활용한 취약계층 돌봄 및 사회공헌 프로그램 활성화 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-10-1", name: "대학 특화분야 연계 사회공헌활동 참여 인원", base: 30, unit: "명", years: { 1: { target: 30, current: 34 } } },
        { id: "L-10-2", name: "지역사회 내 행사 봉사활동 참여 인원", base: 100, unit: "명", years: { 1: { target: 100, current: 164 } } }
      ]
    };
  }

  if (k.id === "L-11") {
    return {
      ...k,
      description: "재난 및 산업안전 분야 예방 관련 산학협력 안전기술 지도 및 재난안전 확산 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 40 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 30",
      subItems: [
        { id: "L-11-1", name: "재난 및 산업안전 관련 안전기술 지원 건수 (기준값: 3)", base: 3, unit: "건", years: { 1: { target: 3, current: 3 } } },
        { id: "L-11-2", name: "재난 및 산업안전 관련 연구 및 시스템(S/W, 콘텐츠) 개발 활용 건수 (기준값: 1)", base: 1, unit: "건", years: { 1: { target: 1, current: 1 } } },
        { id: "L-11-3", name: "재난 및 산업안전 확산 활동 건수 (기준값: 1)", base: 1, unit: "건", years: { 1: { target: 1, current: 3 } } }
      ]
    };
  }

  if (k.id === "L-12") {
    return {
      ...k,
      name: "재난 및 산업안전 교육성과 종합지수",
      description: "지역 밀착형 재난안전 교육프로그램 신규 개발 및 전문 교육 이수, 관련 자격 취득 활성화 종합 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 20 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 40 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 20 + \\frac{\\text{D 실적}}{\\text{D 기준}} \\times 20",
      subItems: [
        { id: "L-12-1", name: "재난 및 산업안전 관련 교육프로그램 개편건수 (기준값: 1)", base: 1, unit: "건", years: { 1: { target: 1, current: 1 } } },
        { id: "L-12-2", name: "재난 및 산업안전 관련 교육프로그램 이수자수 (기준값: 150)", base: 150, unit: "명", years: { 1: { target: 150, current: 168 } } },
        { id: "L-12-3", name: "재난 및 산업안전 관련 교육프로그램 이수자 자격증 취득건수 (기준값: 25)", base: 25, unit: "건", years: { 1: { target: 25, current: 31 } } },
        { id: "L-12-4", name: "재난 및 산업안전 관련 교육프로그램 산업현장 적용 기업수 (기준값: 4)", base: 4, unit: "개", years: { 1: { target: 5, current: 5 } } }
      ]
    };
  }

  if (k.id === "L-13") {
    return {
      ...k,
      description: "스마트 제조 및 미래 신산업 전환을 대비한 지역 산업 연계 AI·DX 핵심 인재 양성 교육프로그램 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 30 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 70",
      subItems: [
        { id: "L-13-1", name: "AI·DX 관련 교육프로그램 개발 건수", base: 5, unit: "건", years: { 1: { target: 5, current: 4 } } },
        { id: "L-13-2", name: "AI·DX 관련 교육프로그램 이수자 수", base: 300, unit: "명", years: { 1: { target: 300, current: 360 } } }
      ]
    };
  }

  if (k.id === "L-14") {
    return {
      ...k,
      name: "AI·DX 기술혁신 확산지수",
      description: "중소·중견 제조기업의 스마트화 지원을 위한 AI·DX 연계 밀착형 기술지도 및 융합컨설팅 지원 확산지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-14-1", name: "AI·DX 관련 기술지원 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 3 } } },
        { id: "L-14-2", name: "AI·DX 관련 자문·컨설팅 건수", base: 5, unit: "건", years: { 1: { target: 5, current: 17 } } }
      ]
    };
  }

  if (k.id === "L-15") {
    return {
      ...k,
      description: "탄소중립 및 친환경 ESG 핵심 가치 확산을 위한 전공·비전공 학생 대상 ESG 전문 인력 육성 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-15-1", name: "ESG 전문인력 양성프로그램 이수자 수", base: 100, unit: "명", years: { 1: { target: 100, current: 146 } } },
        { id: "L-15-2", name: "ESG 경영개선 지원 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 1 } } }
      ]
    };
  }

  if (k.id === "L-16") {
    return {
      ...k,
      description: "지역 중소기업의 저탄소 공정 전환 지원 및 친환경 탄소중립 실천 문화 정착 기여 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 70 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30",
      subItems: [
        { id: "L-16-1", name: "탄소중립 프로그램 운영 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 4 } } },
        { id: "L-16-2", name: "탄소배출 경영개선 지원 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 1 } } }
      ]
    };
  }

  if (k.id === "L-17") {
    return {
      ...k,
      description: "지역 보건·의료 분야 정주 인력 확보를 위한 전공 학생 대상 전문 취업 역량 및 지역 정착 지원지수",
      formula: "1차년도 미개설 지표 (0%)",
      subItems: []
    };
  }

  if (k.id === "L-18") {
    return {
      ...k,
      description: "취약계층의 만성질환 예방 및 만성병 환자의 체계적 자가 관리를 돕는 디지털 모니터링 수혜지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-18-1", name: "사회적약자 의료케어를 위한 전문인력 양성 인원 수", base: 110, unit: "명", years: { 1: { target: 110, current: 208 } } },
        { id: "L-18-2", name: "사회적약자 건강모니터링 지원 인원 수", base: 70, unit: "명", years: { 1: { target: 70, current: 87 } } }
      ]
    };
  }

  if (k.id === "L-19") {
    return {
      ...k,
      name: "늘봄학교 및 온동네 돌봄 교사 양성 프로그램 운영성과 지수",
      description: "울산형 온동네 초등 돌봄 교사 및 방과후 프로그램 연수를 통한 아동 돌봄 전문 인력 공급 양성 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-19-1", name: "늘봄/방과후 교사 양성 프로그램 수", base: 5, unit: "건", years: { 1: { target: 5, current: 11 } } },
        { id: "L-19-2", name: "늘봄/방과후 교사 양성 수", base: 100, unit: "명", years: { 1: { target: 100, current: 134 } } }
      ]
    };
  }

  if (k.id === "L-20") {
    return {
      ...k,
      name: "돌봄 및 체험 프로그램 운영 활성화 지수",
      description: "지역 영유아 및 초등학생을 위한 창의 융합 체험 프로그램 다각화 및 이용 수혜 실적 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-20-1", name: "돌봄 및 체험 프로그램 수", base: 10, unit: "건", years: { 1: { target: 10, current: 14 } } },
        { id: "L-20-2", name: "돌봄 및 체험 프로그램 이용자 수", base: 40, unit: "명", years: { 1: { target: 40, current: 69 } } }
      ]
    };
  }

  if (k.id === "L-21") {
    return {
      ...k,
      description: "도시 쇠퇴지역 공간 혁신 및 청년 창작 생태계 기반 조성을 위한 공간 재생 및 거버넌스 구축 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-21-1", name: "도시공간 재생프로젝트 운영 건수", base: 2, unit: "건", years: { 1: { target: 2, current: 2 } } },
        { id: "L-21-2", name: "도시공간 재생프로젝트 네트워크 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 3 } } }
      ]
    };
  }

  if (k.id === "L-22") {
    return {
      ...k,
      description: "지역 고유 문화 자원 기반 청년 창작 콘텐츠 신규 개발 및 축제 활성화를 통한 관내 수혜 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 50 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 50",
      subItems: [
        { id: "L-22-1", name: "문화 콘텐츠 개발 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 2 } } },
        { id: "L-22-2", name: "문화 콘텐츠 개발 프로젝트 참여 인원", base: 40, unit: "명", years: { 1: { target: 40, current: 60 } } }
      ]
    };
  }

  if (k.id === "L-23") {
    return {
      ...k,
      description: "대학의 글로벌 학술 평판 제고 및 국제 공동 연구·교류 활성화를 통한 해외 우수 기관과의 파트너십 성과지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 20 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 30 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 50",
      subItems: [
        { id: "L-23-1", name: "국제공동 연구 건수", base: 0, unit: "건", years: { 1: { target: 0, current: 0 } } },
        { id: "L-23-2", name: "국제공동 협력 건수", base: 3, unit: "건", years: { 1: { target: 3, current: 5 } } },
        { id: "L-23-3", name: "해외교류 프로그램 참여인원 수", base: 53, unit: "명", years: { 1: { target: 53, current: 100 } } }
      ]
    };
  }

  if (k.id === "L-24") {
    return {
      ...k,
      name: "글로벌 인재유치 및 정착 지원지수",
      description: "외국인 유학생 유치 다각화 및 안정적인 주거·학습·취업 전주기 밀착 케어 서비스 활성화 지수",
      formula: "\\frac{\\text{A 실적}}{\\text{A 기준}} \\times 60 + \\frac{\\text{B 실적}}{\\text{B 기준}} \\times 20 + \\frac{\\text{C 실적}}{\\text{C 기준}} \\times 20",
      subItems: [
        { id: "L-24-1", name: "국제학생 유치 인원수", base: 190, unit: "명", years: { 1: { target: 190, current: 295 } } },
        { id: "L-24-2", name: "국제학생 정착 지원 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 2 } } },
        { id: "L-24-3", name: "외국인 근로자 정착 지원 건수", base: 1, unit: "건", years: { 1: { target: 1, current: 0 } } }
      ]
    };
  }

  return k;
};
