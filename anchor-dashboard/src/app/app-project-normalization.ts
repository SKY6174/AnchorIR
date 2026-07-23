import type { LegacyAppRecord, LegacyYearRecord } from "./app-types";
import { recalculateCarryOver } from "./app-data-utils";

// 💡 [비즈니스 룰 규격화 엔진]
// 3, 4, 5차년도 예산 계획을 2차년도(2026년) 예산 계획과 강제로 동기화하고,
// 종료과제 A1나의 경우 2차년도를 제외한 모든 차년도를 0원으로 강제 격리 조치합니다.
export const normalizeProjectsMultiYearData = <T extends LegacyAppRecord[] | null | undefined,>(projectsList: T): T => {
  if (!projectsList || !Array.isArray(projectsList)) return projectsList;
  return projectsList.map((strat: LegacyAppRecord) => ({
    ...strat,
    units: strat.units?.map((unit: LegacyAppRecord) => {
      const isA1Na = unit.id === "A1na" || unit.id === "A1나";
      const isC1 = unit.id === "C1";

      const newYears: LegacyYearRecord = { ...unit.years };
      if (isC1) {
        // 💡 C1단위과제 2차년도 본사업비 예산 350,000,000원으로 강제 주입 (이월 찌꺼기 3.5억 제거)
        newYears[2] = {
          budget_main: 350000000,
          spent_main: 0,
          budget_carry: 0,
          spent_carry: 0
        };
      }

      const u2 = newYears[2] || {};

      // 3, 4, 5차년도 강제 복사 (A1나 단위과제는 0원)
      [3, 4, 5].forEach(yr => {
        newYears[yr] = {
          ...newYears[yr],
          budget_main: isA1Na ? 0 : (u2.budget_main || 0),
          spent_main: 0,
          budget_carry: 0,
          spent_carry: 0
        };
      });

      // 1차년도부터 5차년도까지 이월잔액 연쇄적 재계산
      recalculateCarryOver(newYears);

      // 💡 [데이터 불일치 방지망] C1단위과제 하위 프로그램 목록에 타 과제(B2 등) 찌꺼기가 섞여 로드되는 문제를 방지하기 위해 프로그램 명세를 템플릿으로 강제 치환 및 초기화합니다.
      let targetPrograms: LegacyAppRecord[] = unit.programs || [];
      if (isC1) {
        const c1Template: LegacyAppRecord[] = [
          { id: "C1-S1T1-1", title: "아카데미별 거버넌스 운영", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S1T1-2", title: "평생학습관 환경개선", assignee: "이연향", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
          { id: "C1-S1T1-3", title: "평생직업교육관련 기자재", assignee: "이연향", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
          { id: "C1-S1T2-1", title: "평생학습 박람회 및 성과공유회", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S1T3-1", title: "자체홈페이지플랫폼구축으로 변경필요(예산미정)", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S1T4-1", title: "자체홈페이지플랫폼구축으로 변경필요(예산미정)", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S2T5-1", title: "자격증 취득지원", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S2T6-1", title: "성인학습자 학과 환경개선", assignee: "이연향", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
          { id: "C1-S2T6-2", title: "성인학습자 학과 기자재 구축", assignee: "이연향", pdca: { p: "완료", d: "진행", c: "대기", a: "대기" } },
          { id: "C1-S2T7-1", title: "평생직업교육활성화 정책연구", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S3T8-1", title: "평생직업교육활성화 정책연구", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S3T9-1", title: "평생학습 박람회 및 성과공유회", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S3T10-1", title: "평생직업교육과정 개발", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S3T11-1", title: "성인학습자 학습지원 프로그램", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S3T11-2", title: "평생교육참여학습자장학금", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S3T11-3", title: "운영보조인력 지원", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S4T12-1", title: "스마트테크 아카데미 교육프로그램운영", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S4T12-2", title: "라이프케어아카데미 교육프로그램운영", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S4T13-1", title: "평생직업교육과정 개발", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S4T14-1", title: "로컬창업아카데미 교육프로그램운영", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } },
          { id: "C1-S4T14-2", title: "팝업아카데미 교육프로그램운영", assignee: "이연향", pdca: { p: "완료", d: "완료", c: "진행", a: "대기" } }
        ];

        targetPrograms = c1Template.map((tmpl: LegacyAppRecord) => {
          const exist = unit.programs?.find((ex: LegacyAppRecord) => ex.id === tmpl.id) || {};
          return {
            ...tmpl,
            years: exist.years || {}
          };
        });
      }

      return {
        ...unit,
        years: newYears,
        programs: targetPrograms.map((prog: LegacyAppRecord) => {
          const newProgYears: LegacyYearRecord = { ...prog.years };

          // 💡 C1단위과제의 하위 프로그램인 경우, 2차년도 본사업비와 국비/시비 안분, 비목을 강제로 정규화합니다.
          if (isC1) {
            const c1ProgBudgets: Record<string, LegacyAppRecord> = {
              "C1-S1T1-1": { total: 5000000, national: 5000000, city: 0, category: "성과 활용∙확산 지원비" },
              "C1-S1T1-2": { total: 75000000, national: 75000000, city: 0, category: "교육∙연구 환경개선비" },
              "C1-S1T1-3": { total: 30000000, national: 30000000, city: 0, category: "실험∙실습장비 및 기자재 구입∙운영비" },
              "C1-S1T2-1": { total: 10000000, national: 10000000, city: 0, category: "성과 활용∙확산 지원비" },
              "C1-S1T3-1": { total: 0, national: 0, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
              "C1-S1T4-1": { total: 0, national: 0, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
              "C1-S2T5-1": { total: 4000000, national: 4000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
              "C1-S2T6-1": { total: 95000000, national: 95000000, city: 0, category: "교육∙연구 환경개선비" },
              "C1-S2T6-2": { total: 20000000, national: 20000000, city: 0, category: "실험∙실습장비 및 기자재 구입∙운영비" },
              "C1-S2T7-1": { total: 5000000, national: 5000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
              "C1-S3T8-1": { total: 5000000, national: 5000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
              "C1-S3T9-1": { total: 10000000, national: 10000000, city: 0, category: "성과 활용∙확산 지원비" },
              "C1-S3T10-1": { total: 6000000, national: 6000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
              "C1-S3T11-1": { total: 12000000, national: 12000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
              "C1-S3T11-2": { total: 10000000, national: 10000000, city: 0, category: "장학금" },
              "C1-S3T11-3": { total: 2000000, national: 2000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
              "C1-S4T12-1": { total: 10000000, national: 0, city: 10000000, category: "교육∙연구 프로그램 개발∙운영비" },
              "C1-S4T12-2": { total: 25000000, national: 25000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
              "C1-S4T13-1": { total: 6000000, national: 6000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" },
              "C1-S4T14-1": { total: 10000000, national: 0, city: 10000000, category: "교육∙연구 프로그램 개발∙운영비" },
              "C1-S4T14-2": { total: 10000000, national: 10000000, city: 0, category: "교육∙연구 프로그램 개발∙운영비" }
            };

            const cfg = c1ProgBudgets[prog.id] || { total: 0, national: 0, city: 0, category: "교육∙연구 프로그램 개발∙운영비" };
            newProgYears[2] = {
              budget_main: cfg.total,
              spent_main: 0,
              budget_carry: 0,
              spent_carry: 0,
              budget_national: cfg.national,
              spent_national: 0,
              budget_city: cfg.city,
              spent_city: 0,
              budget_external: 0,
              spent_external: 0,
              budget_carry_national: 0,
              spent_carry_national: 0,
              budget_carry_city: 0,
              spent_carry_city: 0,
              budget_carry_external: 0,
              spent_carry_external: 0,
              budget_categories: [
                {
                  category: cfg.category,
                  budget: String(cfg.total).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                  budget_carry: "0",
                  spent: 0,
                  spent_carry: 0
                }
              ]
            };
          }

          const p2 = newProgYears[2] || {};

          [3, 4, 5].forEach(yr => {
            const pYr = newProgYears[yr] || {};
            const budgetMain = isA1Na ? 0 : (p2.budget_main || 0);

            // 2차년도의 재원(국비, 시비, 외부사업비) 비율 복사 적용
            const budget_national = isA1Na ? 0 : (p2.budget_national || 0);
            const budget_city = isA1Na ? 0 : (p2.budget_city || 0);
            const budget_external = isA1Na ? 0 : (p2.budget_external || 0);

            newProgYears[yr] = {
              ...pYr,
              budget_main: budgetMain,
              spent_main: 0,
              budget_carry: 0,
              spent_carry: 0,

              budget_national,
              spent_national: 0,
              budget_city,
              spent_city: 0,
              budget_external,
              spent_external: 0,

              budget_carry_national: 0,
              spent_carry_national: 0,
              budget_carry_city: 0,
              spent_carry_city: 0,
              budget_carry_external: 0,
              spent_carry_external: 0
            };

            // 2차년도 비목(budget_categories) 복사 적용 (A1나는 0원)
            if (p2.budget_categories) {
              newProgYears[yr].budget_categories = p2.budget_categories.map((cat: LegacyAppRecord) => ({
                ...cat,
                budget: isA1Na ? "0" : cat.budget,
                budget_carry: "0",
                spent: 0,
                spent_carry: 0
              }));
            }
          });

          return {
            ...prog,
            years: newProgYears
          };
        })
      };
    })
  })) as unknown as T;
};
