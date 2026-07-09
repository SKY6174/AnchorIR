import fs from 'fs';

const filePath = './projects_data_year_2.json';
console.log("=== D1, D2, D3 단위과제 예산 보정 스크립트 실행 ===");

try {
  // 1. 로컬 2차년도 데이터 JSON 파일 로드
  if (!fs.existsSync(filePath)) {
    console.error(`오류: ${filePath} 파일이 존재하지 않습니다.`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(rawData);

  const targetUnits = ["D1", "D2", "D3"];
  let modifiedUnitsCount = 0;
  let modifiedProgramsCount = 0;

  // 2. 전체 프로젝트 데이터를 순회하면서 D1, D2, D3 단위과제 탐색
  data.forEach(strat => {
    if (strat.units) {
      strat.units.forEach(unit => {
        if (targetUnits.includes(unit.id)) {
          console.log(`\n[단위과제: ${unit.id}] 예산 보정 적용 중...`);
          
          // (A) 단위과제 비목별 예산 보정 (budgetDetails)
          if (unit.budgetDetails) {
            Object.keys(unit.budgetDetails).forEach(catName => {
              const category = unit.budgetDetails[catName];
              if (category.years && category.years["2"]) {
                const yr2 = category.years["2"];
                
                // 시비를 전면 제외(0원)하고, 국비(national)를 전체 예산액으로 고정
                yr2.budget_city = 0;
                yr2.budget_national = yr2.budget_main;
                
                // 실제 집행액도 마찬가지로 시비를 0원, 국비를 전체 집행액으로 고정
                yr2.spent_city = 0;
                yr2.spent_national = yr2.spent_main;
              }
            });
            modifiedUnitsCount++;
            console.log(`  - 단위과제 비목 예산(budgetDetails) 보정 완료`);
          }

          // (B) 세부 프로그램별 예산 보정 (programs)
          if (unit.programs) {
            unit.programs.forEach(prog => {
              if (prog.years && prog.years["2"]) {
                const yr2 = prog.years["2"];
                
                // 세부 프로그램 2차년도 예산에서 시비 0원, 국비 100% 처리
                yr2.budget_city = 0;
                yr2.budget_national = yr2.budget_main;
                
                // 세부 프로그램 실제 집행액도 시비 0원, 국비 100% 처리
                yr2.spent_city = 0;
                yr2.spent_national = yr2.spent_main;
                
                modifiedProgramsCount++;
              }
            });
            console.log(`  - 세부 프로그램 총 ${unit.programs.length}개 예산 보정 완료`);
          }
        }
      });
    }
  });

  // 3. 변경 사항이 반영된 데이터를 파일에 다시 쓰기
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n=== 예산 보정 완료! ===`);
  console.log(`- 보정된 단위과제 개수: ${modifiedUnitsCount}개`);
  console.log(`- 보정된 프로그램 개수: ${modifiedProgramsCount}개`);
  console.log(`- 수정된 데이터가 ${filePath}에 성공적으로 저장되었습니다.`);

} catch (err) {
  console.error("예산 보정 중 예외 발생:", err);
}
