import fs from 'fs';

const filePath = './projects_data_year_2.json';
console.log("=== D1 단위과제 이미지 스펙 예산 반영 스크립트 실행 ===");

try {
  if (!fs.existsSync(filePath)) {
    console.error(`오류: ${filePath} 파일이 존재하지 않습니다.`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(rawData);

  // 이미지 표에 따른 D1 예산 맵 (원 단위)
  const d1BudgetMap = {
    "D1-S1T1-1": 5000000,
    "D1-S1T1-2": 15000000,
    "D1-S1T1-3": 0,
    "D1-S1T1-4": 0,
    "D1-S1T1-5": 10000000, // 실험실습재료비
    "D1-S1T2-1": 6000000,
    "D1-S1T2-2": 6000000,
    "D1-S1T2-3": 2000000,
    "D1-S1T3-1": 5000000,
    "D1-S1T3-2": 24000000,
    "D1-S1T4-1": 5000000,
    "D1-S1T4-2": 5000000,
    "D1-S1T5-1": 5000000,
    "D1-S1T5-2": 0,
    "D1-S1T6-1": 40000000,
    "D1-S1T7-1": 12000000,
    "D1-S1T8-1": 50000000,
    "D1-S1T8-2": 5000000,
    "D1-S1T8-3": 5000000
  };

  const targetUnitId = "D1";
  let modifiedProgramsCount = 0;

  // 10대 비목 템플릿 정의
  const getInitialCategories = (targetCategory, budgetVal) => {
    const categories = [
      "인건비", "장학금", "교육∙연구 프로그램 개발∙운영비", "교육∙연구 환경개선비", 
      "실험∙실습장비 및 기자재 구입∙운영비", "지역 연계∙협업 지원비", 
      "기업 지원∙협력 활동비", "성과 활용∙확산 지원비", "그 밖의 사업운영경비", "간접비"
    ];
    return categories.map(cat => ({
      spent: 0,
      budget: cat === targetCategory ? budgetVal.toLocaleString() : "0",
      category: cat,
      spent_carry: 0,
      budget_carry: "0"
    }));
  };

  data.forEach(strat => {
    if (strat.units) {
      strat.units.forEach(unit => {
        if (unit.id === targetUnitId) {
          console.log(`\n[단위과제: ${unit.id}] 이미지 스펙 예산 적용 중...`);
          
          if (unit.programs) {
            unit.programs.forEach(prog => {
              if (d1BudgetMap[prog.id] !== undefined) {
                const budgetVal = d1BudgetMap[prog.id];
                
                // 1) years 및 years["2"] 구조 보장
                if (!prog.years) prog.years = {};
                if (!prog.years["2"]) prog.years["2"] = {};
                
                const yr2 = prog.years["2"];
                
                // 2) 예산액 보정 (시비는 0원, 국비는 100% 반영)
                yr2.budget_main = budgetVal;
                yr2.budget_national = budgetVal;
                yr2.budget_city = 0;
                yr2.budget_external = 0;
                yr2.budget_carry = yr2.budget_carry || 0;
                yr2.budget_carry_city = yr2.budget_carry_city || 0;
                yr2.budget_carry_national = yr2.budget_carry_national || 0;
                yr2.budget_carry_external = yr2.budget_carry_external || 0;
                
                yr2.spent_main = yr2.spent_main || 0;
                yr2.spent_national = yr2.spent_main;
                yr2.spent_city = 0;
                yr2.spent_external = 0;
                
                // 3) 비목 예산(budget_categories) 보정
                const targetCategory = prog.id === "D1-S1T1-5" 
                  ? "실험∙실습장비 및 기자재 구입∙운영비" 
                  : "교육∙연구 프로그램 개발∙운영비";

                if (!yr2.budget_categories || !Array.isArray(yr2.budget_categories) || yr2.budget_categories.length === 0) {
                  yr2.budget_categories = getInitialCategories(targetCategory, budgetVal);
                } else {
                  // 이미 비목들이 존재하는 경우, 해당 비목의 예산만 치환하고 나머지는 0 처리
                  yr2.budget_categories.forEach(catItem => {
                    if (catItem.category === targetCategory) {
                      catItem.budget = budgetVal.toLocaleString();
                    } else {
                      catItem.budget = "0";
                    }
                    catItem.budget_carry = catItem.budget_carry || "0";
                    catItem.spent = catItem.spent || 0;
                    catItem.spent_carry = catItem.spent_carry || 0;
                  });
                }
                
                modifiedProgramsCount++;
                console.log(`  - 프로그램 ${prog.id} (${prog.title}) -> 예산: ${budgetVal.toLocaleString()}원 반영 완료`);
              }
            });
          }
        }
      });
    }
  });

  // 변경된 내용을 로컬 파일에 다시 쓰기
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n=== D1 예산 이미지 스펙 반영 성공! ===`);
  console.log(`- 보정된 프로그램 개수: ${modifiedProgramsCount}개`);
  console.log(`- 수정된 데이터가 ${filePath}에 저장되었습니다.`);

} catch (err) {
  console.error("D1 예산 보정 중 예외 발생:", err);
}
