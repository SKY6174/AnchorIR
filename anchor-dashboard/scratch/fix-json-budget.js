import fs from 'fs';

const filePath = '/Users/thomas/Documents/AnchorIR/anchor-dashboard/projects_data_year_2.json';
console.log("JSON 객체 기반 예산 수정 스크립트 가동...");

try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent);
  
  let found = false;
  data.forEach(strat => {
    if (strat.units) {
      strat.units.forEach(unit => {
        if (unit.programs) {
          unit.programs.forEach(prog => {
            if (prog.id === 'D1-S1T1-1') {
              if (prog.years && prog.years["2"]) {
                prog.years["2"].budget_city = 0;
                prog.years["2"].budget_main = 5000000;
                prog.years["2"].budget_national = 5000000;
                found = true;
              }
            }
          });
        }
      });
    }
  });

  if (found) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log("JSON 객체 수정 및 저장 완료: D1-S1T1-1 2차년도 예산 원복 완료!");
  } else {
    console.error("D1-S1T1-1 프로그램을 JSON 내에서 찾지 못했거나 2차년도 데이터가 없습니다.");
  }
} catch (err) {
  console.error("에러 발생:", err);
}
